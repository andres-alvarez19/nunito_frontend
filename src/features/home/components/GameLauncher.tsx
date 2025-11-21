import type { ComponentType } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import type { GameResults } from '@/features/home/types';
import { palette } from '@/theme/colors';

import AudioRecognitionGame from './games/AudioRecognitionGame';
import ImageWordGame from './games/ImageWordGame';
import RhymeGame from './games/RhymeGame';
import SyllableCountGame from './games/SyllableCountGame';
import type { GameComponentProps } from './games/types';

interface GameLauncherProps {
  gameId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Tiempo máximo permitido en segundos. */
  timeLimit: number;
  onGameComplete: (results: GameResults) => void;
  onBack: () => void;
}

const gameRegistry: Record<string, ComponentType<GameComponentProps>> = {
  'image-word': ImageWordGame,
  'syllable-count': SyllableCountGame,
  'rhyme-identification': RhymeGame,
  'audio-recognition': AudioRecognitionGame,
};

export default function GameLauncher({ gameId, difficulty, timeLimit, onGameComplete, onBack }: GameLauncherProps) {
  const SelectedGame = gameRegistry[gameId];

  if (!SelectedGame) {
    return (
      <View
        className="flex-1 items-center justify-center gap-3 px-8"
        style={{ backgroundColor: palette.background }}
      >
        <Text className="text-xl font-bold" style={{ color: palette.text }}>
          No encontramos este juego
        </Text>
        <Text className="text-base text-center" style={{ color: palette.muted }}>
          Parece que el juego seleccionado aún no está disponible en la versión móvil.
        </Text>
        <TouchableOpacity
          className="mt-2 rounded-xl px-5 py-3"
          style={{ backgroundColor: palette.primary }}
          onPress={onBack}
          accessibilityRole="button"
        >
          <Text className="font-semibold" style={{ color: palette.primaryOn }}>
            Volver al menú
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SelectedGame difficulty={difficulty} timeLimit={timeLimit} onExit={onBack} onGameComplete={onGameComplete} />
  );
}
