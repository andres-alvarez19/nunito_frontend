export type AppState =
  | 'home'
  | 'teacher-login'
  | 'teacher-menu'
  | 'teacher-reports'
  | 'room-creation'
  | 'room-dashboard'
  | 'student-dashboard'
  | 'student-game'
  | 'student-results';

export interface Teacher {
  name: string;
  email: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  game: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  teacher: Teacher;
  students: string[];
  isActive: boolean;
}

export interface GameResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTime: number;
  score: number;
}

export type DifficultyOption = "easy" | "medium" | "hard";

export type StudentResult = {
  name: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  averageTime: number;
  completedAt: string;
};

export type RoomSummaryItem = {
  id: string;
  title: string;
  gameLabel: string;
  gameId: "image-word" | "syllable-count" | "rhyme-identification" | "audio-recognition";
  difficulty: DifficultyOption;
  createdAt: string;
  dateTime: string;
  students: number;
  average: number;
  completion: number;
  status: "active" | "past";
  studentsResults: StudentResult[];
  code?: string;
};
