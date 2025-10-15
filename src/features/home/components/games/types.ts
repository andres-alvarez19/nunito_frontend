import type { GameResults } from '@/features/home/types';

export interface GameComponentProps {
  difficulty: 'easy' | 'medium' | 'hard';
  /** Tiempo máximo permitido en segundos. */
  timeLimit: number;
  onGameComplete: (results: GameResults) => void;
  onExit: () => void;
}
