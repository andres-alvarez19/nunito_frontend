// Re-export existing question types or define new ones matching backend
// For now, we'll align with the types defined in features/home/types/questions.ts
// but ensuring they match the backend response structure.

export type Difficulty = "easy" | "medium" | "hard";
export type GameId = "image-word" | "syllable-count" | "rhyme-identification" | "audio-recognition";

export interface BaseQuestion {
    id: string;
    type: GameId;
    // difficulty is now inside options
    hint?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ImageWordQuestion extends BaseQuestion {
    type: "image-word";
    text?: string;
    options: {
        word: string;
        imageUrl: string;
        alternatives: string[];
        hint?: string;
        difficulty?: Difficulty;
    };
}

export interface SyllableCountQuestion extends BaseQuestion {
    type: "syllable-count";
    text?: string;
    options: {
        word: string;
        syllableCount: number;
        syllableSeparation: string;
        alternatives: number[];
        hint?: string;
        difficulty?: Difficulty;
    };
}

export interface RhymeQuestion extends BaseQuestion {
    type: "rhyme-identification";
    text?: string;
    options: {
        mainWord: string;
        rhymingWords: string[];
        nonRhymingWords: string[];
        hint?: string;
        difficulty?: Difficulty;
    };
}

export interface AudioQuestion extends BaseQuestion {
    type: "audio-recognition";
    text?: string;
    options: {
        word?: string;
        audioUrl: string;
        alternatives: string[];
        hint?: string;
        difficulty?: Difficulty;
    };
}

export type Question =
    | ImageWordQuestion
    | SyllableCountQuestion
    | RhymeQuestion
    | AudioQuestion;

export type CreateQuestionRequest = Omit<Question, "id" | "createdAt" | "updatedAt"> & { testSuiteId: string };
