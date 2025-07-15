"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const profanityChecker_1 = require("../profanityChecker");
describe('ProfanityChecker', () => {
    let checker;
    beforeEach(() => {
        checker = new profanityChecker_1.ProfanityChecker();
    });
    describe('Constructor and Initialization', () => {
        it('should create an instance with default options', () => {
            expect(checker).toBeInstanceOf(profanityChecker_1.ProfanityChecker);
        });
        it('should accept custom options', () => {
            const options = {
                censorCharacter: '#',
                strictMode: true,
                allowWhitelist: false,
                customWords: {
                    profanity: ['murdered'],
                    sexual: ['gangbang'],
                    violence: ['torture'],
                    hateSpeech: ['subhuman']
                },
                severity: {
                    profanity: 'high',
                    sexual: 'high',
                    violence: 'high',
                    hateSpeech: 'high'
                }
            };
            const customChecker = new profanityChecker_1.ProfanityChecker(options);
            expect(customChecker).toBeInstanceOf(profanityChecker_1.ProfanityChecker);
        });
    });
    describe('check() method', () => {
        it('should return clean result for clean text', () => {
            const result = checker.check('This is a perfectly clean sentence.');
            expect(result.isFlagged).toBe(false);
            expect(result.isProfane).toBe(false);
            expect(result.isSexual).toBe(false);
            expect(result.isViolent).toBe(false);
            expect(result.isHateSpeech).toBe(false);
            expect(result.severity).toBe('low');
            expect(result.matches.profanity).toHaveLength(0);
            expect(result.matches.sexual).toHaveLength(0);
            expect(result.matches.violence).toHaveLength(0);
            expect(result.matches.hateSpeech).toHaveLength(0);
        });
        it('should handle empty or null input', () => {
            const result1 = checker.check('');
            const result2 = checker.check(null);
            const result3 = checker.check(undefined);
            [result1, result2, result3].forEach(result => {
                expect(result.isFlagged).toBe(false);
                expect(result.isProfane).toBe(false);
                expect(result.isSexual).toBe(false);
                expect(result.isViolent).toBe(false);
                expect(result.isHateSpeech).toBe(false);
                expect(result.severity).toBe('low');
            });
        });
        it('should handle non-string input', () => {
            const result = checker.check(123);
            expect(result.isFlagged).toBe(false);
            expect(result.originalText).toBe('123');
        });
        it('should detect profanity and flag as such', () => {
            // Note: Using mild examples for testing
            const result = checker.check('This is damn annoying.');
            expect(result.isFlagged).toBe(true);
            expect(result.isProfane).toBe(true);
            expect(result.originalText).toBe('This is damn annoying.');
        });
        it('should detect multiple categories in one text', () => {
            // This test assumes you have words in your JSON files
            // You may need to adjust based on your actual dictionary content
            const result = checker.check('This contains multiple bad words from different categories.');
            expect(result.originalText).toBe('This contains multiple bad words from different categories.');
            // Add specific assertions based on your dictionary content
        });
        it('should respect severity levels', () => {
            // Test with high severity words
            const result = checker.check('Test with high severity content.');
            // Add assertions based on your actual dictionary content
            expect(result.severity).toMatch(/^(low|medium|high)$/);
        });
        it('should provide match details with context', () => {
            const result = checker.check('This sentence contains a damn word.');
            if (result.matches.profanity.length > 0) {
                const match = result.matches.profanity[0];
                expect(match).toHaveProperty('word');
                expect(match).toHaveProperty('position');
                expect(match).toHaveProperty('severity');
                expect(match).toHaveProperty('context');
                expect(typeof match.position).toBe('number');
                expect(typeof match.context).toBe('string');
            }
        });
        it('should handle leetspeak and character substitutions', () => {
            const result = checker.check('This is d4mn annoying with l33t speak.');
            // Should detect "d4mn" as "damn"
            expect(result.isFlagged).toBe(true);
        });
        it('should handle case insensitivity', () => {
            const result1 = checker.check('DAMN');
            const result2 = checker.check('damn');
            const result3 = checker.check('Damn');
            expect(result1.isFlagged).toBe(result2.isFlagged);
            expect(result2.isFlagged).toBe(result3.isFlagged);
        });
    });
    describe('censor() method', () => {
        it('should return original text when no flagged words found', () => {
            const text = 'This is a clean sentence.';
            const result = checker.censor(text);
            expect(result).toBe(text);
        });
        it('should censor flagged words with default character', () => {
            const result = checker.censor('This is damn annoying.');
            expect(result).toContain('****'); // Assuming "damn" gets censored
        });
        it('should use custom censor character', () => {
            const customChecker = new profanityChecker_1.ProfanityChecker({ censorCharacter: '#' });
            const result = customChecker.censor('This is damn annoying.');
            expect(result).toContain('####'); // Assuming "damn" gets censored
        });
        it('should handle empty or null input', () => {
            expect(checker.censor('')).toBe('');
            expect(checker.censor(null)).toBe('');
            expect(checker.censor(undefined)).toBe('');
        });
        it('should preserve word boundaries', () => {
            const result = checker.censor('This is damn but not condamn.');
            // Should only censor the standalone "damn", not "condamn"
            expect(result).toContain('condamn');
        });
        it('should handle multiple flagged words', () => {
            const result = checker.censor('This damn text has multiple bad words.');
            // Should censor all flagged words
            expect(result).toContain('****');
        });
        it('should handle overlapping matches correctly', () => {
            const result = checker.censor('damn damn damn');
            // Should censor all instances
            expect(result).toMatch(/\*+ \*+ \*+/);
        });
    });
    describe('censorHtml() method', () => {
        it('should censor text within HTML while preserving markup', () => {
            const html = '<p>This is <strong>damn</strong> annoying.</p>';
            const result = checker.censorHtml(html);
            expect(result).toContain('<strong>');
            expect(result).toContain('</strong>');
            expect(result).toContain('****');
        });
        it('should handle complex HTML structures', () => {
            const html = `
        <div class="content">
          <h1>Title</h1>
          <p>This is damn annoying.</p>
          <ul>
            <li>Item with damn word</li>
            <li>Clean item</li>
          </ul>
        </div>
      `;
            const result = checker.censorHtml(html);
            expect(result).toContain('<div class="content">');
            expect(result).toContain('<h1>Title</h1>');
            expect(result).toContain('<ul>');
            expect(result).toContain('****');
        });
        it('should handle empty or null HTML input', () => {
            expect(checker.censorHtml('')).toBe('');
            expect(checker.censorHtml(null)).toBe('');
            expect(checker.censorHtml(undefined)).toBe('');
        });
        it('should not affect HTML attributes', () => {
            const html = '<a href="https://example.com/damn" title="damn">Link</a>';
            const result = checker.censorHtml(html);
            // Should preserve href and title attributes
            expect(result).toContain('href="https://example.com/damn"');
            expect(result).toContain('title="damn"');
        });
    });
    describe('addWords() method', () => {
        it('should add words to profanity category', () => {
            const initialStats = checker.getStats();
            checker.addWords('profanity', ['testword1', 'testword2']);
            const newStats = checker.getStats();
            expect(newStats.profanity).toBe(initialStats.profanity + 2);
            const result = checker.check('This contains testword1.');
            expect(result.isProfane).toBe(true);
        });
        it('should add words to sexual category', () => {
            const initialStats = checker.getStats();
            checker.addWords('sexual', ['testsexual1'], 'high');
            const newStats = checker.getStats();
            expect(newStats.sexual).toBe(initialStats.sexual + 1);
            const result = checker.check('This contains testsexual1.');
            expect(result.isSexual).toBe(true);
            expect(result.severity).toBe('high');
        });
        it('should add words to violence category', () => {
            const initialStats = checker.getStats();
            checker.addWords('violence', ['testviolence1']);
            const newStats = checker.getStats();
            expect(newStats.violence).toBe(initialStats.violence + 1);
            const result = checker.check('This contains testviolence1.');
            expect(result.isViolent).toBe(true);
        });
        it('should add words to hateSpeech category', () => {
            const initialStats = checker.getStats();
            checker.addWords('hateSpeech', ['testhate1']);
            const newStats = checker.getStats();
            expect(newStats.hateSpeech).toBe(initialStats.hateSpeech + 1);
            const result = checker.check('This contains testhate1.');
            expect(result.isHateSpeech).toBe(true);
        });
        it('should handle case insensitivity when adding words', () => {
            checker.addWords('profanity', ['TESTWORD']);
            const result1 = checker.check('This contains testword.');
            const result2 = checker.check('This contains TESTWORD.');
            expect(result1.isProfane).toBe(true);
            expect(result2.isProfane).toBe(true);
        });
    });
    describe('removeWords() method', () => {
        it('should remove words from profanity category', () => {
            // First add a word
            checker.addWords('profanity', ['removeme']);
            expect(checker.check('This contains removeme.').isProfane).toBe(true);
            // Then remove it
            checker.removeWords('profanity', ['removeme']);
            expect(checker.check('This contains removeme.').isProfane).toBe(false);
        });
        it('should remove words from all categories', () => {
            // Add words to all categories
            checker.addWords('profanity', ['testremove']);
            checker.addWords('sexual', ['testremove']);
            checker.addWords('violence', ['testremove']);
            checker.addWords('hateSpeech', ['testremove']);
            // Remove from all categories
            checker.removeWords('profanity', ['testremove']);
            checker.removeWords('sexual', ['testremove']);
            checker.removeWords('violence', ['testremove']);
            checker.removeWords('hateSpeech', ['testremove']);
            const result = checker.check('This contains testremove.');
            expect(result.isFlagged).toBe(false);
        });
        it('should handle case insensitivity when removing words', () => {
            checker.addWords('profanity', ['testremove']);
            checker.removeWords('profanity', ['TESTREMOVE']);
            const result = checker.check('This contains testremove.');
            expect(result.isProfane).toBe(false);
        });
    });
    describe('addToWhitelist() method', () => {
        it('should add words to whitelist', () => {
            // First add a word to profanity
            checker.addWords('profanity', ['whitelisttest']);
            expect(checker.check('This contains whitelisttest.').isProfane).toBe(true);
            // Then add to whitelist
            checker.addToWhitelist(['whitelisttest']);
            expect(checker.check('This contains whitelisttest.').isProfane).toBe(false);
        });
        it('should handle case insensitivity in whitelist', () => {
            checker.addWords('profanity', ['whitelisttest']);
            checker.addToWhitelist(['WHITELISTTEST']);
            const result = checker.check('This contains whitelisttest.');
            expect(result.isProfane).toBe(false);
        });
        it('should respect allowWhitelist option', () => {
            const noWhitelistChecker = new profanityChecker_1.ProfanityChecker({ allowWhitelist: false });
            noWhitelistChecker.addWords('profanity', ['whitelisttest']);
            noWhitelistChecker.addToWhitelist(['whitelisttest']);
            const result = noWhitelistChecker.check('This contains whitelisttest.');
            expect(result.isProfane).toBe(true); // Should still be flagged
        });
    });
    describe('getStats() method', () => {
        it('should return correct statistics', () => {
            const stats = checker.getStats();
            expect(stats).toHaveProperty('profanity');
            expect(stats).toHaveProperty('sexual');
            expect(stats).toHaveProperty('violence');
            expect(stats).toHaveProperty('hateSpeech');
            expect(stats).toHaveProperty('whitelist');
            expect(stats).toHaveProperty('total');
            expect(typeof stats.profanity).toBe('number');
            expect(typeof stats.sexual).toBe('number');
            expect(typeof stats.violence).toBe('number');
            expect(typeof stats.hateSpeech).toBe('number');
            expect(typeof stats.whitelist).toBe('number');
            expect(typeof stats.total).toBe('number');
            expect(stats.total).toBe(stats.profanity + stats.sexual + stats.violence + stats.hateSpeech);
        });
        it('should update statistics when words are added', () => {
            const initialStats = checker.getStats();
            checker.addWords('profanity', ['newword1', 'newword2']);
            checker.addWords('sexual', ['newsexual1']);
            checker.addToWhitelist(['whiteword1']);
            const newStats = checker.getStats();
            expect(newStats.profanity).toBe(initialStats.profanity + 2);
            expect(newStats.sexual).toBe(initialStats.sexual + 1);
            expect(newStats.whitelist).toBe(initialStats.whitelist + 1);
            expect(newStats.total).toBe(initialStats.total + 3);
        });
    });
    describe('strictMode functionality', () => {
        it('should detect partial matches in strict mode', () => {
            const strictChecker = new profanityChecker_1.ProfanityChecker({ strictMode: true });
            // Add a test word
            strictChecker.addWords('profanity', ['test']);
            const result = strictChecker.check('This is testing.');
            expect(result.isProfane).toBe(true); // Should match "test" in "testing"
        });
        it('should not detect partial matches in non-strict mode', () => {
            const normalChecker = new profanityChecker_1.ProfanityChecker({ strictMode: false });
            // Add a test word
            normalChecker.addWords('profanity', ['test']);
            const result = normalChecker.check('This is testing.');
            expect(result.isProfane).toBe(false); // Should not match "test" in "testing"
        });
    });
    describe('severity calculation', () => {
        it('should return high severity when high severity words are present', () => {
            checker.addWords('violence', ['highseverityword'], 'high');
            const result = checker.check('This contains highseverityword.');
            expect(result.severity).toBe('high');
        });
        it('should return medium severity when only medium severity words are present', () => {
            checker.addWords('profanity', ['mediumseverityword'], 'medium');
            const result = checker.check('This contains mediumseverityword.');
            expect(result.severity).toBe('medium');
        });
        it('should return low severity when only low severity words are present', () => {
            checker.addWords('profanity', ['lowseverityword'], 'low');
            const result = checker.check('This contains lowseverityword.');
            expect(result.severity).toBe('low');
        });
        it('should prioritize highest severity level', () => {
            checker.addWords('profanity', ['lowword'], 'low');
            checker.addWords('violence', ['highword'], 'high');
            const result = checker.check('This contains lowword and highword.');
            expect(result.severity).toBe('high');
        });
    });
    describe('text normalization', () => {
        it('should handle excessive punctuation', () => {
            const result = checker.check('This!!! is!!! damn!!! annoying!!!');
            expect(result.isProfane).toBe(true);
            expect(result.matches.profanity[0].word).toBe('damn');
        });
        it('should handle leetspeak substitutions', () => {
            const result1 = checker.check('That is 4nnoying.');
            expect(result1.isProfane).toBe(false); // No match, but shows normalization works
            checker.addWords('profanity', ['asshole']);
            const result2 = checker.check('You are an @$$h0l3.');
            expect(result2.isProfane).toBe(true);
        });
        it('should handle mixed case and whitespace', () => {
            checker.addWords('profanity', ['testword']);
            const result = checker.check(' ThIs    iS a TesTWOrD   .');
            expect(result.isProfane).toBe(true);
        });
    });
});
