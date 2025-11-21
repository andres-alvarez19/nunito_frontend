import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import NunitoButton from '@/features/home/components/NunitoButton';
import { palette, withAlpha } from '@/theme/colors';
import { formatSeconds } from '@/utils/time';

import type { GameComponentProps } from './types';

interface AudioQuestion {
  id: number;
  audioWord: string;
  options: string[];
  correctAnswer: string;
}

const questionBank: Record<'easy' | 'medium' | 'hard', AudioQuestion[]> = {
  easy: [
    { id: 1, audioWord: 'GATO', options: ['GATO', 'PATO', 'RATO'], correctAnswer: 'GATO' },
    { id: 2, audioWord: 'CASA', options: ['CASA', 'MASA', 'PASA'], correctAnswer: 'CASA' },
    { id: 3, audioWord: 'SOL', options: ['SOL', 'GOL', 'COL'], correctAnswer: 'SOL' },
    { id: 4, audioWord: 'FLOR', options: ['FLOR', 'AMOR', 'COLOR'], correctAnswer: 'FLOR' },
    { id: 5, audioWord: 'PELOTA', options: ['PELOTA', 'COMETA', 'GALLETA'], correctAnswer: 'PELOTA' },
  ],
  medium: [
    {
      id: 1,
      audioWord: 'MARIPOSA',
      options: ['MARIPOSA', 'HERMOSA', 'ESPOSA', 'ROSA'],
      correctAnswer: 'MARIPOSA',
    },
    {
      id: 2,
      audioWord: 'ELEFANTE',
      options: ['ELEFANTE', 'GIGANTE', 'ESTUDIANTE', 'IMPORTANTE'],
      correctAnswer: 'ELEFANTE',
    },
    {
      id: 3,
      audioWord: 'BICICLETA',
      options: ['BICICLETA', 'COMETA', 'GALLETA', 'MALETA'],
      correctAnswer: 'BICICLETA',
    },
    {
      id: 4,
      audioWord: 'COMPUTADORA',
      options: ['COMPUTADORA', 'LAVADORA', 'GRABADORA', 'CALCULADORA'],
      correctAnswer: 'COMPUTADORA',
    },
  ],
  hard: [
    {
      id: 1,
      audioWord: 'REFRIGERADOR',
      options: ['REFRIGERADOR', 'COMPUTADOR', 'TELEVISOR', 'PROCESADOR', 'GENERADOR'],
      correctAnswer: 'REFRIGERADOR',
    },
    {
      id: 2,
      audioWord: 'EXTRAORDINARIO',
      options: ['EXTRAORDINARIO', 'ORDINARIO', 'NECESARIO', 'VOLUNTARIO', 'UNIVERSITARIO'],
      correctAnswer: 'EXTRAORDINARIO',
    },
    {
      id: 3,
      audioWord: 'RESPONSABILIDAD',
      options: ['RESPONSABILIDAD', 'POSIBILIDAD', 'HABILIDAD', 'FACILIDAD', 'MOVILIDAD'],
      correctAnswer: 'RESPONSABILIDAD',
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

export default function AudioRecognitionGame({ difficulty, timeLimit, onExit, onGameComplete }: GameComponentProps) {
  const theme = useMemo(
    () => ({
      container: palette.blueContainer,
      accent: palette.blue,
      onAccent: palette.blueOn,
    }),
    []
  );
  const questions = useMemo(() => questionBank[difficulty] ?? questionBank.easy, [difficulty]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerWasCorrect, setAnswerWasCorrect] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    setHasPlayedAudio(false);
    setPlayCount(0);
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
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  const finalizeQuestion = (wasCorrect: boolean) => {
    const responseTime = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));
    setAnswerWasCorrect(wasCorrect);
    setShowFeedback(true);
    setIsPlaying(false);

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

  const handleAnswerPress = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    finalizeQuestion(answer === currentQuestion.correctAnswer);
  };

  const handleNextQuestion = () => {
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const speakWord = () => {
    setHasPlayedAudio(true);
    setPlayCount((prev) => prev + 1);
    setIsPlaying(true);

    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }

    playbackTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      playbackTimeoutRef.current = null;
    }, 1600);
  };

  const stopWord = () => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    setIsPlaying(false);
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
            <Text style={[styles.metaTitle, { color: theme.onAccent }]}>Reconocimiento Auditivo</Text>
            <Text style={[styles.metaSubtitle, { color: withAlpha(theme.onAccent, 0.85) }]}>
              Audio {questionIndex + 1} de {totalQuestions}
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
        <View style={[styles.card, styles.columnCard, { borderColor: withAlpha(theme.accent, 0.22) }]}>
          <Text style={styles.prompt}>Escucha con atención la palabra y selecciona la opción correcta.</Text>

          <View
            style={[
              styles.audioCircle,
              { backgroundColor: withAlpha(theme.accent, 0.16), borderColor: withAlpha(theme.accent, 0.4) },
            ]}
          >
            <Text style={[styles.audioGlyph, { color: theme.accent }]}>{isPlaying ? '🔊' : '🎧'}</Text>
          </View>

          <View style={styles.audioActions}>
            <NunitoButton onPress={isPlaying ? stopWord : speakWord}>
              <Text style={[styles.primaryButtonText, { color: theme.onAccent }]}>
                {isPlaying ? 'Detener audio' : hasPlayedAudio ? `Reproducir (${playCount})` : 'Escuchar palabra'}
              </Text>
            </NunitoButton>
            <Text style={styles.playCount}>
              {hasPlayedAudio ? `Reproducido ${playCount} vez${playCount === 1 ? '' : 'es'}` : 'Toca para escuchar'}
            </Text>
          </View>

          {showFeedback && (
            <View
              style={[
                styles.answerChip,
                { borderColor: withAlpha(theme.accent, 0.28), backgroundColor: withAlpha(theme.accent, 0.12) },
              ]}
            >
              <Text style={[styles.answerChipText, { color: theme.accent }]}>{currentQuestion.correctAnswer}</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, styles.columnCard, { borderColor: withAlpha(theme.accent, 0.22) }]}>
          <Text style={styles.prompt}>Selecciona la palabra que escuchaste</Text>
          <View style={styles.optionList}>
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = showFeedback && option === currentQuestion.correctAnswer;
              const isIncorrectChoice = showFeedback && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    { backgroundColor: withAlpha(theme.accent, 0.12), borderColor: withAlpha(theme.accent, 0.28) },
                    isSelected && { backgroundColor: withAlpha(theme.accent, 0.24), borderColor: theme.accent },
                    isCorrect && styles.optionCorrect,
                    isIncorrectChoice && styles.optionIncorrect,
                  ]}
                  onPress={() => handleAnswerPress(option)}
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
        </View>
      </View>

      {showFeedback && (
        <View style={[styles.feedback, answerWasCorrect ? styles.feedbackSuccess : styles.feedbackError]}>
          <Text style={styles.feedbackTitle}>{answerWasCorrect ? '✅ Correcto' : '❌ Incorrecto'}</Text>
          <Text style={styles.feedbackText}>
            {answerWasCorrect
              ? stats.streak >= 3
                ? `¡Fantástico! Llevas ${stats.streak} respuestas correctas seguidas.`
                : '¡Excelente! Identificaste el sonido correcto.'
              : `La respuesta correcta era "${currentQuestion.correctAnswer}".`}
          </Text>
          {questionIndex < totalQuestions - 1 && (
            <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.accent }]} onPress={handleNextQuestion}>
              <Text style={[styles.nextButtonText, { color: theme.onAccent }]}>Siguiente audio</Text>
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
  prompt: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
  },
  audioCircle: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
  },
  audioGlyph: {
    fontSize: 46,
  },
  audioActions: {
    gap: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: palette.text,
    fontWeight: '700',
  },
  playCount: {
    color: palette.muted,
    fontSize: 13,
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
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    color: palette.text,
  },
  answerChip: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  answerChipText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  feedback: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  feedbackSuccess: {
    backgroundColor: '#ecfdf3',
    borderColor: '#86efac',
  },
  feedbackError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  feedbackText: {
    color: palette.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 14,
  },
  nextButtonText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
