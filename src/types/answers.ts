export interface AnswerSubmission {
  studentId: string;
  questionId: string;
  answer: string;
  questionText?: string;
  isCorrect?: boolean;
  elapsedMs?: number;
  attempt?: number;
  sentAt?: string;
  replace?: boolean;
  studentName?: string;
  gameId?: string;
  selectedOptionId?: string | null;
  selectedOptionText?: string | null;
}

export interface AnswerRecord extends AnswerSubmission {
  id: string;
  roomId: string;
  createdAt: string;
}

export interface GameResultSubmission {
  studentId?: string;
  studentName: string;
  roomId?: string;
  gameId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimeSeconds: number;
  score: number;
  completedAt?: string;
}
