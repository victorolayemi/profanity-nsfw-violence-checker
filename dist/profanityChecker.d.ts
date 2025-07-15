import { CheckResult, Options } from './types';
declare class ProfanityChecker {
    private profanityList;
    private sexualList;
    private violenceList;
    private hateSpeechList;
    private whitelist;
    private options;
    constructor(options?: Options);
    private loadDictionaries;
    private loadWordList;
    private normalizeText;
    private findMatches;
    private escapeRegex;
    private getContext;
    private calculateOverallSeverity;
    /**
     * Checks a plain text string for flagged content.
     */
    check(text: string): CheckResult;
    /**
     * Censors flagged words in a plain text string.
     */
    censor(text: string): string;
    /**
     * Censors flagged words within an HTML string without breaking markup.
     */
    censorHtml(html: string): string;
    /**
     * Add words to specific categories
     */
    addWords(category: 'profanity' | 'sexual' | 'violence' | 'hateSpeech', words: string[], severity?: 'low' | 'medium' | 'high'): void;
    /**
     * Remove words from specific categories
     */
    removeWords(category: 'profanity' | 'sexual' | 'violence' | 'hateSpeech', words: string[]): void;
    /**
     * Add words to whitelist
     */
    addToWhitelist(words: string[]): void;
    /**
     * Get statistics about the checker
     */
    getStats(): {
        profanity: number;
        sexual: number;
        violence: number;
        hateSpeech: number;
        whitelist: number;
        total: number;
    };
}
export { ProfanityChecker };
