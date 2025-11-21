import { Question } from "./questions";

export interface TestSuite {
    id: string;
    name: string;
    description?: string;
    courseId: string;
    games: string[]; // GameId[]
    createdAt: string;
    updatedAt?: string;
}

export interface CreateTestSuiteRequest {
    name: string;
    description?: string;
    courseId: string;
    games: string[];
}

export interface UpdateTestSuiteRequest {
    name?: string;
    description?: string;
    games?: string[];
}
