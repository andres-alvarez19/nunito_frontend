import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { palette, withAlpha } from '@/theme/colors';
import { formatSeconds } from '@/utils/time';

import type { GameComponentProps } from './types';

interface SyllableQuestion {
  id: number;
  word: string;
  syllables: string[];
  correctCount: number;
  options: number[];
}

const questionBank: Record<'easy' | 'medium' | 'hard', SyllableQuestion[]> = {
  easy: [
    { id: 1, word: 'CASA', syllables: ['CA', 'SA'], correctCount: 2, options: [1, 2, 3] },
    { id: 2, word: 'GATO', syllables: ['GA', 'TO'], correctCount: 2, options: [1, 2, 3] },
    { id: 3, word: 'SOL', syllables: ['SOL'], correctCount: 1, options: [1, 2, 3] },
    { id: 4, word: 'PELOTA', syllables: ['PE', 'LO', 'TA'], correctCount: 3, options: [1, 2, 3] },
    { id: 5, word: 'FLOR', syllables: ['FLOR'], correctCount: 1, options: [1, 2, 3] },
  ],
  medium: [
    { id: 1, word: 'MARIPOSA', syllables: ['MA', 'RI', 'PO', 'SA'], correctCount: 4, options: [2, 3, 4, 5] },
    { id: 2, word: 'ELEFANTE', syllables: ['E', 'LE', 'FAN', 'TE'], correctCount: 4, options: [2, 3, 4, 5] },
    { id: 3, word: 'BICICLETA', syllables: ['BI', 'CI', 'CLE', 'TA'], correctCount: 4, options: [2, 3, 4, 5] },
    { id: 4, word: 'COMPUTADORA', syllables: ['COM', 'PU', 'TA', 'DO', 'RA'], correctCount: 5, options: [3, 4, 5, 6] },
  ],
  hard: [
    { id: 1, word: 'REFRIGERADOR', syllables: ['RE', 'FRI', 'GE', 'RA', 'DOR'], correctCount: 5, options: [3, 4, 5, 6] },
    { id: 2, word: 'EXTRAORDINARIO', syllables: ['EX', 'TRAOR', 'DI', 'NA', 'RIO'], correctCount: 5, options: [4, 5, 6, 7] },
    { id: 3, word: 'RESPONSABILIDAD', syllables: ['RES', 'PON', 'SA', 'BI', 'LI', 'DAD'], correctCount: 6, options: [4, 5, 6, 7] },
  ],
};

interface StatsState {
  correct: number;
  incorrect: number;
  responses: number[];
  streak: number;
  maxStreak: number;
}

export default function SyllableCountGame({ difficulty, timeLimit, onExit, onGameComplete, onAnswer, questions: fetchedQuestions }: GameComponentProps) {
  const theme = useMemo(
    () => ({
      container: palette.pastelContainer,
      accent: palette.pastel,
      onAccent: palette.pastelOn,
    }),
    []
  );
  const questions = useMemo(() => {
    if (fetchedQuestions && fetchedQuestions.length > 0) {
      return fetchedQuestions
        .filter(q => q.type === 'syllable-count')
        .map((q, index) => {
          if (q.type !== 'syllable-count') return null;
          return {
            id: parseInt(q.id) || index + 1,
            word: q.options.word.toUpperCase(),
            syllables: q.options.syllableSeparation.split('-').map(s => s.toUpperCase()),
            correctCount: q.options.syllableCount,
            options: [q.options.syllableCount, ...q.options.alternatives].sort(() => Math.random() - 0.5),
          };
        })
        .filter((q): q is SyllableQuestion => q !== null);
    }
    return questionBank[difficulty] ?? questionBank.easy;
  }, [difficulty, fetchedQuestions]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerWasCorrect, setAnswerWasCorrect] = useState<boolean | null>(null);
  const [showSyllables, setShowSyllables] = useState(false);
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
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswerWasCorrect(null);
    setShowSyllables(false);
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
    setShowSyllables(true);

    if (onAnswer) {
      onAnswer(
        currentQuestion.id.toString(),
        `¿Cuántas sílabas tiene ${currentQuestion.word}?`,
        selectedAnswer !== null ? String(selectedAnswer) : 'NO_ANSWER',
        wasCorrect,
        responseTime * 1000
      );
    }

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

  const handleAnswerPress = (value: number) => {
    if (showFeedback) return;

    setSelectedAnswer(value);
    finalizeQuestion(value === currentQuestion.correctCount);
  };

  const handleNextQuestion = () => {
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.wrapper, { backgroundColor: theme.container }]}>
      <View style={styles.header}>
        {/* Exit button removed */}
        <View style={{ flex: 1 }} />
        <View style={styles.headerInfo}>
          {/* Time remaining label removed */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="clock" size={20} color={theme.accent} />
            <Text style={[styles.timerValue, { color: theme.accent }]}>{formatSeconds(timeRemaining)}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.metaCard, { backgroundColor: theme.accent }]}>
        <View style={styles.metaTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.metaTitle, { color: theme.onAccent }]}>Conteo de Sílabas</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="star" size={16} color={withAlpha(theme.onAccent, 0.85)} />
              <Text style={[styles.metaSubtitle, { color: withAlpha(theme.onAccent, 0.85) }]}>
                Pregunta {questionIndex + 1} de {totalQuestions}
              </Text>
            </View>
          </View>
          <View style={styles.metaBadges}>
            {/* Badges updated */}
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
        <View style={[styles.metaProgress, { backgroundColor: '#FFFFFF' }]}>
          <View style={[styles.metaProgressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={[styles.columns, { flexDirection: isWideLayout ? 'row' : 'column' }]}>
        <View style={[styles.card, styles.columnCard, { borderColor: withAlpha(theme.accent, 0.2) }]}>
          <Text style={styles.sectionTitle}>¿Cuántas sílabas tiene esta palabra?</Text>
          <View style={[styles.wordContainer, { backgroundColor: theme.accent }]}>
            <Text style={[styles.word, { color: theme.onAccent }]}>{currentQuestion.word}</Text>
          </View>
          <Text style={styles.prompt}>Separa mentalmente la palabra y cuenta cada sonido.</Text>

          <TouchableOpacity style={styles.hintButton} onPress={() => setShowSyllables((prev) => !prev)}>
            <Text style={[styles.hintText, { color: theme.accent }]}>
              {showSyllables ? 'Ocultar sílabas' : '💡 Ver división silábica'}
            </Text>
          </TouchableOpacity>

          {showSyllables && (
            <View style={styles.syllableGroup}>
              {currentQuestion.syllables.map((syllable) => (
                <View
                  key={syllable}
                  style={[
                    styles.syllableChip,
                    { borderColor: theme.accent, backgroundColor: withAlpha(theme.accent, 0.18) },
                  ]}
                >
                  <Text style={[styles.syllableText, { color: theme.accent }]}>{syllable}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.card, styles.columnCard, { borderColor: withAlpha(theme.accent, 0.2) }]}>
          <Text style={styles.sectionTitle}>Selecciona el número de sílabas</Text>
          <Text style={styles.sectionSubtitle}>Toca la opción correcta para avanzar</Text>

          <View style={styles.optionRow}>
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = showFeedback && option === currentQuestion.correctCount;
              const isIncorrectChoice = showFeedback && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.chip,
                    { backgroundColor: withAlpha(theme.accent, 0.18), borderColor: withAlpha(theme.accent, 0.35) },
                    isSelected && { backgroundColor: withAlpha(theme.accent, 0.3), borderColor: theme.accent },
                    isCorrect && styles.chipCorrect,
                    isIncorrectChoice && styles.chipIncorrect,
                  ]}
                  onPress={() => handleAnswerPress(option)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.chipText,
                      (isSelected || isCorrect || isIncorrectChoice) && styles.chipTextActive,
                    ]}
                  >
                    {option} {option === 1 ? 'sílaba' : 'sílabas'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {showFeedback && (
        <View
          style={[
            styles.feedback,
            answerWasCorrect ? styles.feedbackSuccess : styles.feedbackError,
            { borderColor: answerWasCorrect ? '#22c55e' : '#f87171' },
          ]}
        >
          <Text style={styles.feedbackTitle}>{answerWasCorrect ? '✅ Correcto' : '❌ Incorrecto'}</Text>
          <Text style={styles.feedbackText}>
            {answerWasCorrect
              ? stats.streak >= 3
                ? `¡INCREÍBLE RACHA! Llevas ${stats.streak} respuestas correctas.`
                : '¡Muy bien! Contaste correctamente las sílabas.'
              : `La palabra tiene ${currentQuestion.correctCount} ${currentQuestion.correctCount === 1 ? 'sílaba' : 'sílabas'
              }.`}
          </Text>
          {showSyllables && (
            <Text style={styles.feedbackTextMuted}>
              División silábica: {currentQuestion.syllables.join(' - ')}
            </Text>
          )}
          {questionIndex < totalQuestions - 1 && (
            <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.accent }]} onPress={handleNextQuestion} accessibilityRole="button">
              <Text style={[styles.nextButtonText, { color: theme.onAccent }]}>Siguiente pregunta</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {stats.streak >= 3 && (
        <View style={styles.celebration}>
          <Text style={styles.celebrationText}>🎉</Text>
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
  wordContainer: {
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  word: {
    fontSize: 40,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  prompt: {
    fontSize: 16,
    color: palette.text,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  chip: {
    minWidth: 68,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    borderWidth: 1,
  },
  chipCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16a34a',
  },
  chipIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#f87171',
  },
  chipText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
  },
  chipTextActive: {
    color: palette.text,
  },
  hintButton: {
    alignSelf: 'center',
  },
  hintText: {
    color: palette.primary,
    fontWeight: '600',
  },
  syllableGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  syllableChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
  },
  syllableText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 16,
  },
  feedback: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    color: palette.text,
  },
  feedbackSuccess: {
    backgroundColor: '#DCFCE7',
  },
  feedbackError: {
    backgroundColor: '#FEE2E2',
  },
  feedbackText: {
    color: palette.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackTextMuted: {
    color: palette.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  nextButton: {
    marginTop: 4,
    backgroundColor: palette.pastel,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  celebration: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: withAlpha(palette.pastel, 0.15),
    borderRadius: 999,
    padding: 16,
  },
  celebrationText: {
    fontSize: 28,
  },
});
