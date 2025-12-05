export type AppState =
  | 'home'
  | 'teacher-login'
  | 'teacher-menu'
  | 'teacher-reports'
  | 'room-creation'
  | 'room-dashboard'
  | 'student-dashboard'
  | 'student-game'
  | 'student-results'
  | 'download-app';

export interface Teacher {
  name: string;
  email: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  games: { id: string; name: string }[];
  difficulty: 'easy' | 'medium' | 'hard';
  durationMinutes: number;
  isActive: boolean;
  status: "pending" | "active" | "finished";
  testSuiteId: string;
  createdAt: string;
  teacherId: string;
  students: string[];
  updatedAt: string | null;
  // Deprecated fields kept for compatibility if needed, or remove if sure
  game?: string;
  duration?: number;
  teacher?: Teacher;
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
  answers?: StudentAnswer[];
};

export type StudentAnswer = {
  id: string;
  roomId: string;
  studentId: string;
  gameId?: string;
  questionId: string;
  questionText?: string | null;
  answer: string;
  isCorrect?: boolean;
  elapsedMs?: number;
  attempt?: number;
  createdAt?: string;
  sentAt?: string;
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
  status: "pending" | "active" | "finished";
  studentsResults?: StudentResult[];
  code?: string;
  gameLabels: string[];
  // API compatibility fields
  name?: string;
  roomName?: string;
  studentsCount?: number;
  averageScore?: number;
  completionRate?: number;
  lastActivityAt?: string;
  isActive?: boolean;
};
