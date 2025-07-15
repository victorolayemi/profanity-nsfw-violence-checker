import * as cheerio from 'cheerio';
import { CheckResult, MatchDetails, Options } from './types';

class ProfanityChecker {
  private profanityList: { word: string; severity: 'low' | 'medium' | 'high'; }[] = [];
  private sexualList: { word: string; severity: 'low' | 'medium' | 'high'; }[] = [];
  private violenceList: { word: string; severity: 'low' | 'medium' | 'high'; }[] = [];
  private hateSpeechList: { word: string; severity: 'low' | 'medium' | 'high'; }[] = [];
  private whitelist: string[] = [];
  private options: Required<Options>;

  constructor(options: Options = {}) {
    this.options = {
      censorCharacter: '*',
      strictMode: false,
      allowWhitelist: true,
      customWords: {},
      severity: {
        profanity: 'medium',
        sexual: 'medium',
        violence: 'high',
        hateSpeech: 'high'
      },
      ...options,
    };

    this.loadDictionaries();
  }

  private loadDictionaries(): void {
    // Load base dictionaries with severity levels
    this.profanityList = this.loadWordList('./data/profanity.json');
    this.sexualList = this.loadWordList('./data/sexual.json');
    this.violenceList = this.loadWordList('./data/violence.json');
    this.hateSpeechList = this.loadWordList('./data/hateSpeech.json');
    this.whitelist = require('./data/whitelist.json').words || [];

    // Add custom words if provided
    if (this.options.customWords.profanity) {
      this.profanityList.push(...this.options.customWords.profanity.map(word => ({ word, severity: 'medium' as const })));
    }
    if (this.options.customWords.sexual) {
      this.sexualList.push(...this.options.customWords.sexual.map(word => ({ word, severity: 'medium' as const })));
    }
    if (this.options.customWords.violence) {
      this.violenceList.push(...this.options.customWords.violence.map(word => ({ word, severity: 'high' as const })));
    }
    if (this.options.customWords.hateSpeech) {
      this.hateSpeechList.push(...this.options.customWords.hateSpeech.map(word => ({ word, severity: 'high' as const })));
    }
  }

  private loadWordList(path: string): { word: string; severity: 'low' | 'medium' | 'high' }[] {
    try {
      const data = require(path);
      if (Array.isArray(data.words)) {
        return data.words.map((item: any) => {
          if (typeof item === 'string') {
            return { word: item, severity: 'medium' as const };
          }
          return { word: item.word, severity: item.severity || 'medium' };
        });
      }
      return [];
    } catch (error) {
      console.warn(`Failed to load word list from ${path}:`, error);
      return [];
    }
  }

  private normalizeText(text: string): string {
    if (typeof text !== 'string') {
      return '';
    }
    
    let normalized = text.toLowerCase();
    
    // Handle leetspeak and character substitutions
    const substitutions: { [key: string]: string } = {
      '4': 'a', '3': 'e', '1': 'i', '0': 'o', '5': 's', '7': 't',
      '@': 'a', '$': 's', '!': 'i', '€': 'e', '¡': 'i',
      'ph': 'f', 'ck': 'k', 'qu': 'kw'
    };

    for (const [sub, replacement] of Object.entries(substitutions)) {
      normalized = normalized.replace(new RegExp(sub, 'g'), replacement);
    }

    // Remove excessive punctuation and spacing
    normalized = normalized.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    
    return normalized;
  }

  private findMatches(text: string): Omit<CheckResult, 'originalText' | 'isFlagged' | 'isProfane' | 'isSexual' | 'isViolent' | 'isHateSpeech' | 'severity'> {
    const matches = { profanity: [], sexual: [], violence: [], hateSpeech: [] };
    const normalizedText = this.normalizeText(text);
    const originalText = text.toLowerCase();

    const allLists = {
      profanity: this.profanityList,
      sexual: this.sexualList,
      violence: this.violenceList,
      hateSpeech: this.hateSpeechList,
    };

    for (const [category, wordList] of Object.entries(allLists)) {
      for (const { word, severity } of wordList) {
        // Skip if word is in whitelist
        if (this.options.allowWhitelist && this.whitelist.includes(word)) {
          continue;
        }

        // Search in both normalized and original text
        const searchTexts = [
          { text: normalizedText, isNormalized: true },
          { text: originalText, isNormalized: false }
        ];

        for (const { text: searchText, isNormalized } of searchTexts) {
          // Multiple matching strategies
          const patterns = this.options.strictMode ? [
            new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi'), // Exact word boundary
            new RegExp(`\\b${this.escapeRegex(word)}s?\\b`, 'gi'), // Plural forms
            new RegExp(`${this.escapeRegex(word)}`, 'gi'), // Substring (strict mode)
          ] : [
            new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi'), // Exact word boundary
            new RegExp(`\\b${this.escapeRegex(word)}s?\\b`, 'gi'), // Plural forms
          ];

          for (const pattern of patterns) {
            let match;
            const regexCopy = new RegExp(pattern.source, pattern.flags);
            while ((match = regexCopy.exec(searchText)) !== null) {
              const position = match.index;
              const context = this.getContext(originalText, position, word.length);
              
              // Check if this match already exists to avoid duplicates
              const existingMatch = (matches[category as keyof typeof matches] as MatchDetails[]).find(
                m => m.word === word && Math.abs(m.position - position) < word.length
              );
              
              if (!existingMatch) {
                (matches[category as keyof typeof matches] as MatchDetails[]).push({
                  word,
                  position,
                  severity,
                  context
                });
              }
            }
          }
        }
      }
    }

    return { matches };
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getContext(text: string, position: number, wordLength: number): string {
    const start = Math.max(0, position - 20);
    const end = Math.min(text.length, position + wordLength + 20);
    return text.substring(start, end);
  }

  private calculateOverallSeverity(matches: CheckResult['matches']): 'low' | 'medium' | 'high' {
    const allMatches = [
      ...matches.profanity,
      ...matches.sexual,
      ...matches.violence,
      ...matches.hateSpeech
    ];

    if (allMatches.some(m => m.severity === 'high')) return 'high';
    if (allMatches.some(m => m.severity === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * Checks a plain text string for flagged content.
   */
  public check(text: string): CheckResult {
    // Convert non-string input to string
    const textString = typeof text === 'string' ? text : String(text || '');
    
    if (!textString) {
      return {
        originalText: textString,
        isFlagged: false,
        isProfane: false,
        isSexual: false,
        isViolent: false,
        isHateSpeech: false,
        severity: 'low',
        matches: { profanity: [], sexual: [], violence: [], hateSpeech: [] }
      };
    }

    const { matches } = this.findMatches(textString);

    const isProfane = matches.profanity.length > 0;
    const isSexual = matches.sexual.length > 0;
    const isViolent = matches.violence.length > 0;
    const isHateSpeech = matches.hateSpeech.length > 0;

    return {
      originalText: textString,
      isFlagged: isProfane || isSexual || isViolent || isHateSpeech,
      isProfane,
      isSexual,
      isViolent,
      isHateSpeech,
      severity: this.calculateOverallSeverity(matches),
      matches,
    };
  }

  /**
   * Censors flagged words in a plain text string.
   */
  public censor(text: string): string {
    if (!text || typeof text !== 'string') {
      return text || '';
    }

    const { matches } = this.findMatches(text);
    let censoredText = text;

    // Collect all flagged words and sort by length (longest first to avoid partial replacements)
    const allFlaggedWords = [
      ...matches.profanity,
      ...matches.sexual,
      ...matches.violence,
      ...matches.hateSpeech
    ]
      .map(match => match.word)
      .filter((word, index, array) => array.indexOf(word) === index) // Remove duplicates
      .sort((a, b) => b.length - a.length);

    for (const word of allFlaggedWords) {
      // Try both exact word boundary and more flexible matching
      const patterns = [
        new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi'),
        new RegExp(`\\b${this.escapeRegex(word)}s?\\b`, 'gi')
      ];
      
      for (const regex of patterns) {
        const replacement = this.options.censorCharacter.repeat(word.length);
        censoredText = censoredText.replace(regex, replacement);
      }
    }

    return censoredText;
  }

  /**
   * Censors flagged words within an HTML string without breaking markup.
   */
  public censorHtml(html: string): string {
    if (!html || typeof html !== 'string') {
      return html || '';
    }

    const $ = cheerio.load(html);

    // Iterate over every text node in the document
    $('*').contents().filter((i, element) => {
      return element.type === 'text';
    }).each((i, element) => {
      const text = $(element).text();
      const censoredText = this.censor(text);
      if (text !== censoredText) {
        $(element).replaceWith(censoredText);
      }
    });

    return $.html();
  }

  /**
   * Add words to specific categories
   */
  public addWords(category: 'profanity' | 'sexual' | 'violence' | 'hateSpeech', words: string[], severity: 'low' | 'medium' | 'high' = 'medium'): void {
    const wordObjects = words.map(word => ({ word: word.toLowerCase(), severity }));
    
    switch (category) {
      case 'profanity':
        this.profanityList.push(...wordObjects);
        break;
      case 'sexual':
        this.sexualList.push(...wordObjects);
        break;
      case 'violence':
        this.violenceList.push(...wordObjects);
        break;
      case 'hateSpeech':
        this.hateSpeechList.push(...wordObjects);
        break;
    }
  }

  /**
   * Remove words from specific categories
   */
  public removeWords(category: 'profanity' | 'sexual' | 'violence' | 'hateSpeech', words: string[]): void {
    const wordsToRemove = words.map(w => w.toLowerCase());
    
    switch (category) {
      case 'profanity':
        this.profanityList = this.profanityList.filter(item => !wordsToRemove.includes(item.word));
        break;
      case 'sexual':
        this.sexualList = this.sexualList.filter(item => !wordsToRemove.includes(item.word));
        break;
      case 'violence':
        this.violenceList = this.violenceList.filter(item => !wordsToRemove.includes(item.word));
        break;
      case 'hateSpeech':
        this.hateSpeechList = this.hateSpeechList.filter(item => !wordsToRemove.includes(item.word));
        break;
    }
  }

  /**
   * Add words to whitelist
   */
  public addToWhitelist(words: string[]): void {
    this.whitelist.push(...words.map(w => w.toLowerCase()));
  }

  /**
   * Get statistics about the checker
   */
  public getStats(): {
    profanity: number;
    sexual: number;
    violence: number;
    hateSpeech: number;
    whitelist: number;
    total: number;
  } {
    return {
      profanity: this.profanityList.length,
      sexual: this.sexualList.length,
      violence: this.violenceList.length,
      hateSpeech: this.hateSpeechList.length,
      whitelist: this.whitelist.length,
      total: this.profanityList.length + this.sexualList.length + this.violenceList.length + this.hateSpeechList.length
    };
  }
}

export { ProfanityChecker };