"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfanityChecker = void 0;
const cheerio = __importStar(require("cheerio"));
class ProfanityChecker {
    constructor(options = {}) {
        this.profanityList = [];
        this.sexualList = [];
        this.violenceList = [];
        this.hateSpeechList = [];
        this.whitelist = [];
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
    loadDictionaries() {
        // Load base dictionaries with severity levels
        this.profanityList = this.loadWordList('./data/profanity.json');
        this.sexualList = this.loadWordList('./data/sexual.json');
        this.violenceList = this.loadWordList('./data/violence.json');
        this.hateSpeechList = this.loadWordList('./data/hateSpeech.json');
        this.whitelist = require('./data/whitelist.json').words || [];
        // Add custom words if provided
        if (this.options.customWords.profanity) {
            this.profanityList.push(...this.options.customWords.profanity.map(word => ({ word, severity: 'medium' })));
        }
        if (this.options.customWords.sexual) {
            this.sexualList.push(...this.options.customWords.sexual.map(word => ({ word, severity: 'medium' })));
        }
        if (this.options.customWords.violence) {
            this.violenceList.push(...this.options.customWords.violence.map(word => ({ word, severity: 'high' })));
        }
        if (this.options.customWords.hateSpeech) {
            this.hateSpeechList.push(...this.options.customWords.hateSpeech.map(word => ({ word, severity: 'high' })));
        }
    }
    loadWordList(path) {
        try {
            const data = require(path);
            if (Array.isArray(data.words)) {
                return data.words.map((item) => {
                    if (typeof item === 'string') {
                        return { word: item, severity: 'medium' };
                    }
                    return { word: item.word, severity: item.severity || 'medium' };
                });
            }
            return [];
        }
        catch (error) {
            console.warn(`Failed to load word list from ${path}:`, error);
            return [];
        }
    }
    normalizeText(text) {
        if (typeof text !== 'string') {
            return '';
        }
        let normalized = text.toLowerCase();
        // Handle leetspeak and character substitutions
        const substitutions = {
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
    findMatches(text) {
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
                // Multiple matching strategies
                const patterns = [
                    new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi'), // Exact word boundary
                    new RegExp(`\\b${this.escapeRegex(word)}s?\\b`, 'gi'), // Plural forms
                    new RegExp(`${this.escapeRegex(word)}`, 'gi'), // Substring (strict mode)
                ];
                const patternToUse = this.options.strictMode ? patterns : [patterns[0], patterns[1]];
                for (const pattern of patternToUse) {
                    let match;
                    while ((match = pattern.exec(normalizedText)) !== null) {
                        const position = match.index;
                        const context = this.getContext(originalText, position, word.length);
                        matches[category].push({
                            word,
                            position,
                            severity,
                            context
                        });
                    }
                }
            }
        }
        return { matches };
    }
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    getContext(text, position, wordLength) {
        const start = Math.max(0, position - 20);
        const end = Math.min(text.length, position + wordLength + 20);
        return text.substring(start, end);
    }
    calculateOverallSeverity(matches) {
        const allMatches = [
            ...matches.profanity,
            ...matches.sexual,
            ...matches.violence,
            ...matches.hateSpeech
        ];
        if (allMatches.some(m => m.severity === 'high'))
            return 'high';
        if (allMatches.some(m => m.severity === 'medium'))
            return 'medium';
        return 'low';
    }
    /**
     * Checks a plain text string for flagged content.
     */
    check(text) {
        if (!text || typeof text !== 'string') {
            return {
                originalText: text || '',
                isFlagged: false,
                isProfane: false,
                isSexual: false,
                isViolent: false,
                isHateSpeech: false,
                severity: 'low',
                matches: { profanity: [], sexual: [], violence: [], hateSpeech: [] }
            };
        }
        const { matches } = this.findMatches(text);
        const isProfane = matches.profanity.length > 0;
        const isSexual = matches.sexual.length > 0;
        const isViolent = matches.violence.length > 0;
        const isHateSpeech = matches.hateSpeech.length > 0;
        return {
            originalText: text,
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
    censor(text) {
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
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            const replacement = this.options.censorCharacter.repeat(word.length);
            censoredText = censoredText.replace(regex, replacement);
        }
        return censoredText;
    }
    /**
     * Censors flagged words within an HTML string without breaking markup.
     */
    censorHtml(html) {
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
    addWords(category, words, severity = 'medium') {
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
    removeWords(category, words) {
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
    addToWhitelist(words) {
        this.whitelist.push(...words.map(w => w.toLowerCase()));
    }
    /**
     * Get statistics about the checker
     */
    getStats() {
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
exports.ProfanityChecker = ProfanityChecker;
