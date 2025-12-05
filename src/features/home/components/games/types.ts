import type { GameResults } from '@/features/home/types';
import type { Question } from '@/models/questions';

export interface GameComponentProps {
  difficulty: 'easy' | 'medium' | 'hard';
  /** Tiempo máximo permitido en segundos. */
  timeLimit: number;
  onGameComplete: (results: GameResults) => void;
  onExit: () => void;
  onAnswer?: (
    questionId: string,
    questionText: string,
    selectedOptionId: string | null,
    selectedOptionText: string | null,
    isCorrect: boolean,
    elapsedMillis: number
  ) => void;
  questions?: Question[];
}
