import type { ComponentType } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>No encontramos este juego</Text>
        <Text style={styles.fallbackSubtitle}>
          Parece que el juego seleccionado aún no está disponible en la versión móvil.
        </Text>
        <TouchableOpacity style={styles.fallbackButton} onPress={onBack} accessibilityRole="button">
          <Text style={styles.fallbackButtonText}>Volver al menú</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SelectedGame difficulty={difficulty} timeLimit={timeLimit} onExit={onBack} onGameComplete={onGameComplete} />
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
  },
  fallbackSubtitle: {
    color: palette.muted,
    textAlign: 'center',
  },
  fallbackButton: {
    marginTop: 8,
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  fallbackButtonText: {
    color: palette.primaryOn,
    fontWeight: '600',
  },
});
