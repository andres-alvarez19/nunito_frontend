import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { gameDefinitions } from '@/features/home/constants/games';
import type { GameResults } from '@/features/home/types';
import { palette } from '@/theme/colors';

interface StudentResultsProps {
  studentName: string;
  gameId: string;
  results: GameResults;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export default function StudentResults({ studentName, gameId, results, onPlayAgain, onBackToHome }: StudentResultsProps) {
  const gameDefinition = gameDefinitions.find((definition) => definition.id === gameId);
  const gameName = gameDefinition?.name ?? 'mini juego';

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>¡Excelente trabajo, {studentName}!</Text>
        <Text style={styles.subtitle}>Has completado el juego {gameName}.</Text>

        <View style={styles.resultsGrid}>
          <ResultBlock label="Preguntas" value={results.totalQuestions.toString()} />
          <ResultBlock label="Correctas" value={results.correctAnswers.toString()} />
          <ResultBlock label="Incorrectas" value={results.incorrectAnswers.toString()} />
          <ResultBlock label="Tiempo promedio" value={`${results.averageTime}s`} />
          <ResultBlock label="Puntaje" value={`${results.score}%`} />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onPlayAgain}>
          <Text style={styles.primaryButtonText}>Jugar nuevamente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBackToHome}>
          <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface ResultBlockProps {
  label: string;
  value: string;
}

function ResultBlock({ label, value }: ResultBlockProps) {
  return (
    <View style={styles.resultBlock}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 24,
    gap: 20,
    shadowColor: '#00000022',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 16,
    color: palette.muted,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultBlock: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 14,
    flexBasis: '30%',
    flexGrow: 1,
  },
  resultLabel: {
    color: palette.muted,
    fontSize: 13,
  },
  resultValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: palette.primaryOn,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: '600',
  },
});
