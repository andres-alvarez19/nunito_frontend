// Base question interface
export interface BaseQuestion {
    id: string;
    difficulty: "easy" | "medium" | "hard";
    createdAt: string;
}

// Image-Word Association Game
export interface ImageWordQuestion extends BaseQuestion {
    type: "image-word";
    word: string;
    imageUrl: string;
    alternatives: string[]; // Wrong options
    hint?: string;
}

// Syllable Count Game
export interface SyllableCountQuestion extends BaseQuestion {
    type: "syllable-count";
    word: string;
    syllableCount: number;
    syllableSeparation: string; // e.g., "ca-sa"
    alternatives: number[]; // Wrong syllable counts
    hint?: string;
}

// Rhyme Identification Game
export interface RhymeQuestion extends BaseQuestion {
    type: "rhyme-identification";
    mainWord: string;
    rhymingWords: string[]; // Words that rhyme
    nonRhymingWords: string[]; // Words that don't rhyme
    hint?: string;
}

// Audio Recognition Game
export interface AudioQuestion extends BaseQuestion {
    type: "audio-recognition";
    text: string; // The word/phrase that will be heard
    audioUrl: string;
    alternatives: string[]; // Wrong options
    hint?: string;
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
