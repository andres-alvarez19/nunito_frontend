import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { palette, withAlpha } from '@/theme/colors';
import { formatSeconds } from '@/utils/time';

import type { GameComponentProps } from './types';

interface RhymeQuestion {
  id: number;
  keyWord: string;
  options: string[];
  correctRhymes: string[];
}

const questionBank: Record<'easy' | 'medium' | 'hard', RhymeQuestion[]> = {
  easy: [
    { id: 1, keyWord: 'GATO', options: ['PATO', 'CASA', 'RATO', 'FLOR'], correctRhymes: ['PATO', 'RATO'] },
    { id: 2, keyWord: 'SOL', options: ['GOL', 'MAR', 'COL', 'PAN'], correctRhymes: ['GOL', 'COL'] },
    { id: 3, keyWord: 'FLOR', options: ['AMOR', 'MESA', 'COLOR', 'GATO'], correctRhymes: ['AMOR', 'COLOR'] },
    { id: 4, keyWord: 'CASA', options: ['MASA', 'PERRO', 'PASA', 'LIBRO'], correctRhymes: ['MASA', 'PASA'] },
  ],
  medium: [
    {
      id: 1,
      keyWord: 'CORAZÓN',
      options: ['RATÓN', 'MESA', 'CANCIÓN', 'ÁRBOL', 'LIMÓN'],
      correctRhymes: ['RATÓN', 'CANCIÓN', 'LIMÓN'],
    },
    {
      id: 2,
      keyWord: 'MARIPOSA',
      options: ['HERMOSA', 'GATO', 'ROSA', 'CASA', 'ESPOSA'],
      correctRhymes: ['HERMOSA', 'ROSA', 'ESPOSA'],
    },
    {
      id: 3,
      keyWord: 'VENTANA',
      options: ['MAÑANA', 'PERRO', 'CAMPANA', 'LIBRO', 'HERMANA'],
      correctRhymes: ['MAÑANA', 'CAMPANA', 'HERMANA'],
    },
  ],
  hard: [
    {
      id: 1,
      keyWord: 'MARAVILLOSO',
      options: ['FABULOSO', 'MESA', 'HERMOSO', 'GATO', 'PODEROSO', 'LIBRO'],
      correctRhymes: ['FABULOSO', 'HERMOSO', 'PODEROSO'],
    },
    {
      id: 2,
      keyWord: 'EXTRAORDINARIO',
      options: ['ORDINARIO', 'CASA', 'NECESARIO', 'PERRO', 'VOLUNTARIO', 'ÁRBOL'],
      correctRhymes: ['ORDINARIO', 'NECESARIO', 'VOLUNTARIO'],
    },
  ],
};

interface StatsState {
  correct: number;
  incorrect: number;
  responses: number[];
  streak: number;
  maxStreak: number;
}

export default function RhymeGame({ difficulty, timeLimit, onExit, onGameComplete }: GameComponentProps) {
  const theme = useMemo(
    () => ({
      container: palette.violetContainer,
      accent: palette.violet,
      onAccent: palette.violetOn,
    }),
    []
  );
  const questions = useMemo(() => questionBank[difficulty] ?? questionBank.easy, [difficulty]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerWasCorrect, setAnswerWasCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartRef = useRef(Date.now());
  const [stats, setStats] = useState<StatsState>({
    correct: 0,
    incorrect: 0,
    responses: [],
    streak: 0,
    maxStreak: 0,
  });

  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const progress = ((questionIndex + 1) / totalQuestions) * 100;
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 900;

  useEffect(() => {
    questionStartRef.current = Date.now();
    setTimeRemaining(timeLimit);
    setSelectedAnswers([]);
    setShowFeedback(false);
    setAnswerWasCorrect(null);
    setShowHint(false);
  }, [questionIndex, timeLimit]);

  useEffect(() => {
    if (showFeedback) return;

    if (timeRemaining <= 0) {
      handleTimeout();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeRemaining, showFeedback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const finalizeQuestion = (wasCorrect: boolean) => {
    const responseTime = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));
    setAnswerWasCorrect(wasCorrect);
    setShowFeedback(true);

    setStats((prev) => {
      const nextStreak = wasCorrect ? prev.streak + 1 : 0;
      const nextStats: StatsState = {
        correct: prev.correct + (wasCorrect ? 1 : 0),
        incorrect: prev.incorrect + (wasCorrect ? 0 : 1),
        responses: [...prev.responses, responseTime],
        streak: nextStreak,
        maxStreak: Math.max(prev.maxStreak, nextStreak),
      };

      if (questionIndex === totalQuestions - 1) {
        const averageTime =
          nextStats.responses.reduce((total, seconds) => total + seconds, 0) / nextStats.responses.length || 0;
        const score = Math.round((nextStats.correct / totalQuestions) * 100);

        setTimeout(() => {
          onGameComplete({
            totalQuestions,
            correctAnswers: nextStats.correct,
            incorrectAnswers: nextStats.incorrect,
            averageTime: Math.round(averageTime),
            score,
          });
        }, 500);
      }

      return nextStats;
    });
  };

  const handleTimeout = () => {
    if (showFeedback) return;
    finalizeQuestion(false);
  };

  const handleToggleAnswer = (option: string) => {
    if (showFeedback) return;

    setSelectedAnswers((prev) => {
      if (prev.includes(option)) {
        return prev.filter((value) => value !== option);
      }

      return [...prev, option];
    });
  };

  const handleSubmitAnswer = () => {
    if (showFeedback || selectedAnswers.length === 0) return;

    const correctRhymes = new Set(currentQuestion.correctRhymes);
    const isCorrect =
      selectedAnswers.length === correctRhymes.size && selectedAnswers.every((answer) => correctRhymes.has(answer));

    finalizeQuestion(isCorrect);
  };

  const handleNextQuestion = () => {
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.wrapper, { backgroundColor: theme.container }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.backButton} accessibilityRole="button">
          <Text style={[styles.backText, { color: theme.accent }]}>← Salir</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.timerLabel}>Tiempo restante</Text>
          <Text style={[styles.timerValue, { color: theme.accent }]}>{formatSeconds(timeRemaining)}</Text>
        </View>
      </View>

      <View style={[styles.metaCard, { backgroundColor: theme.accent }]}>
        <View style={styles.metaTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.metaTitle, { color: theme.onAccent }]}>Identificación de Rimas</Text>
            <Text style={[styles.metaSubtitle, { color: withAlpha(theme.onAccent, 0.85) }]}>
              Pregunta {questionIndex + 1} de {totalQuestions}
            </Text>
          </View>
          <View style={styles.metaBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formatSeconds(timeRemaining)}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {stats.correct}/{totalQuestions}
              </Text>
            </View>
            {stats.streak > 0 && (
              <View style={[styles.badge, styles.streakBadge]}>
                <Text style={[styles.badgeText, styles.streakText]}>🔥 {stats.streak}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.metaProgress, { backgroundColor: withAlpha(theme.onAccent, 0.25) }]}>
          <View style={[styles.metaProgressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={[styles.columns, { flexDirection: isWideLayout ? 'row' : 'column' }]}>
        <View style={[styles.card, styles.columnCard, { borderColor: withAlpha(theme.accent, 0.2) }]}>
          <Text style={styles.sectionTitle}>Palabra clave</Text>
          <View
            style={[
              styles.keywordBox,
              { backgroundColor: withAlpha(theme.accent, 0.16), borderColor: withAlpha(theme.accent, 0.4) },
            ]}
          >
            <Text style={[styles.keyword, { color: theme.accent }]}>{currentQuestion.keyWord}</Text>
          </View>
          <Text style={styles.prompt}>Encuentra todas las palabras que rimen con la palabra clave.</Text>

          <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint((prev) => !prev)}>
            <Text style={[styles.hintText, { color: theme.accent }]}>
              {showHint ? 'Ocultar pista' : '💡 Ver pista'}
            </Text>
          </TouchableOpacity>
          {showHint && !showFeedback && (
            <Text style={styles.hintMessage}>Las palabras que riman terminan con sonidos similares.</Text>
          )}
        </View>

        <View style={[styles.card, styles.columnCard, { borderColor: withAlpha(theme.accent, 0.2) }]}>
          <Text style={styles.sectionTitle}>Selecciona las palabras que riman</Text>
          <Text style={styles.sectionSubtitle}>Puedes escoger más de una opción</Text>

          <View style={styles.optionList}>
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers.includes(option);
              const isCorrect = showFeedback && currentQuestion.correctRhymes.includes(option);
              const isIncorrectChoice = showFeedback && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    { backgroundColor: withAlpha(theme.accent, 0.12), borderColor: withAlpha(theme.accent, 0.28) },
                    isSelected && { backgroundColor: withAlpha(theme.accent, 0.28), borderColor: theme.accent },
                    isCorrect && styles.optionCorrect,
                    isIncorrectChoice && styles.optionIncorrect,
                  ]}
                  onPress={() => handleToggleAnswer(option)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.optionText,
                      (isSelected || isCorrect || isIncorrectChoice) && styles.optionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!showFeedback && (
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.accent },
                selectedAnswers.length === 0 && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitAnswer}
              disabled={selectedAnswers.length === 0}
              accessibilityRole="button"
            >
              <Text style={[styles.submitButtonText, { color: theme.onAccent }]}>
                {selectedAnswers.length === 0
                  ? 'Selecciona al menos una opción'
                  : `Confirmar (${selectedAnswers.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showFeedback && (
        <View style={[styles.feedback, answerWasCorrect ? styles.feedbackSuccess : styles.feedbackError]}>
          <Text style={styles.feedbackTitle}>{answerWasCorrect ? '✅ Correcto' : '❌ Incorrecto'}</Text>
          <Text style={styles.feedbackTitle}>
            {answerWasCorrect
              ? stats.streak >= 3
                ? `¡INCREÍBLE RACHA! Llevas ${stats.streak}.`
                : '¡Excelente! Has encontrado las rimas.'
              : `Las palabras que riman con "${currentQuestion.keyWord}" son:`}
          </Text>
          <View style={styles.correctRhymes}>
            {currentQuestion.correctRhymes.map((rhyme) => (
              <View key={rhyme} style={styles.rhymeChip}>
                <Text style={styles.rhymeText}>{rhyme}</Text>
              </View>
            ))}
          </View>
          {questionIndex < totalQuestions - 1 && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: theme.accent }]}
              onPress={handleNextQuestion}
              accessibilityRole="button"
            >
              <Text style={[styles.nextButtonText, { color: theme.onAccent }]}>Siguiente palabra</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    gap: 18,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    color: palette.primary,
    fontWeight: '600',
  },
  headerInfo: {
    alignItems: 'flex-end',
  },
  timerLabel: {
    fontSize: 12,
    color: palette.muted,
  },
  timerValue: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
  },
  metaCard: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: '#00000022',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  metaTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  metaTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  metaSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaBadges: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  metaProgress: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  metaProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2D6943',
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: '#00000022',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  columns: {
    gap: 14,
  },
  columnCard: {
    flex: 1,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#38693C',
  },
  badgeText: {
    fontWeight: '700',
    color: '#ffffff',
  },
  streakBadge: {
    backgroundColor: '#facc15',
  },
  streakText: {
    color: '#854d0e',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
  },
  sectionSubtitle: {
    color: palette.muted,
    textAlign: 'center',
  },
  keywordBox: {
    alignSelf: 'center',
    paddingVertical: 22,
    paddingHorizontal: 30,
    borderRadius: 18,
    borderWidth: 2,
  },
  keyword: {
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
  },
  prompt: {
    fontSize: 16,
    color: palette.text,
    textAlign: 'center',
  },
  optionList: {
    gap: 10,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16a34a',
  },
  optionIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#f87171',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    textAlign: 'center',
  },
  optionTextActive: {
    color: palette.text,
  },
  submitButton: {
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5F5',
  },
  submitButtonText: {
    color: palette.primaryOn,
    fontWeight: '700',
    textAlign: 'center',
  },
  hintButton: {
    alignSelf: 'center',
  },
  hintText: {
    color: palette.primary,
    fontWeight: '600',
  },
  hintMessage: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    color: '#92400E',
    textAlign: 'center',
  },
  feedback: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#ecfdf3',
    borderColor: '#86efac',
  },
  feedbackError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
  },
  correctRhymes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  rhymeChip: {
    backgroundColor: palette.violetContainer,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rhymeText: {
    color: palette.violet,
    fontWeight: '700',
  },
  nextButton: {
    marginTop: 4,
    backgroundColor: palette.violet,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
