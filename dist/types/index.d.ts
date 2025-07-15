export interface CheckResult {
    originalText: string;
    isFlagged: boolean;
    isProfane: boolean;
    isSexual: boolean;
    isViolent: boolean;
    isHateSpeech: boolean;
    severity: 'low' | 'medium' | 'high';
    matches: {
        profanity: MatchDetails[];
        sexual: MatchDetails[];
        violence: MatchDetails[];
        hateSpeech: MatchDetails[];
    };
}
export interface MatchDetails {
    word: string;
    position: number;
    severity: 'low' | 'medium' | 'high';
    context?: string;
}
export interface Options {
    censorCharacter?: string;
    strictMode?: boolean;
    allowWhitelist?: boolean;
    customWords?: {
        profanity?: string[];
        sexual?: string[];
        violence?: string[];
        hateSpeech?: string[];
    };
    severity?: {
        profanity?: 'low' | 'medium' | 'high';
        sexual?: 'low' | 'medium' | 'high';
        violence?: 'low' | 'medium' | 'high';
        hateSpeech?: 'low' | 'medium' | 'high';
    };
}
