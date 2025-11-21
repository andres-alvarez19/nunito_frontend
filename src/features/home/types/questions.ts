// Base question interface
export interface BaseQuestion {
    id: string;
    difficulty: "easy" | "medium" | "hard";
    createdAt: string;
}

// Image-Word Association Game
export interface ImageWordQuestion extends BaseQuestion {
    type: "image-word";
    text?: string;
    options?: {
        word: string;
        imageUrl: string;
        alternatives: string[];
        hint?: string;
        difficulty?: "easy" | "medium" | "hard";
    };
}

// Syllable Count Game
export interface SyllableCountQuestion extends BaseQuestion {
    type: "syllable-count";
    text?: string;
    options?: {
        word: string;
        syllableCount: number;
        syllableSeparation: string;
        alternatives: number[];
        hint?: string;
        difficulty?: "easy" | "medium" | "hard";
    };
}

// Rhyme Identification Game
export interface RhymeQuestion extends BaseQuestion {
    type: "rhyme-identification";
    text?: string;
    options?: {
        mainWord: string;
        rhymingWords: string[];
        nonRhymingWords: string[];
        hint?: string;
        difficulty?: "easy" | "medium" | "hard";
    };
}

// Audio Recognition Game
export interface AudioQuestion extends BaseQuestion {
    type: "audio-recognition";
    text?: string;
    options?: {
        audioUrl: string;
        alternatives: string[];
        hint?: string;
        difficulty?: "easy" | "medium" | "hard";
    };
}

// Union type for all question types
export type Question =
    | ImageWordQuestion
    | SyllableCountQuestion
    | RhymeQuestion
    | AudioQuestion;

// Helper type to get question type from game ID
export type GameQuestionType<T extends string> = T extends "image-word"
    ? ImageWordQuestion
    : T extends "syllable-count"
    ? SyllableCountQuestion
    : T extends "rhyme-identification"
    ? RhymeQuestion
    : T extends "audio-recognition"
    ? AudioQuestion
    : never;
