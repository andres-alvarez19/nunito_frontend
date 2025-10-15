import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '@/theme/colors';
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

export default function SyllableCountGame({ difficulty, timeLimit, onExit, onGameComplete }: GameComponentProps) {
  const questions = useMemo(() => questionBank[difficulty] ?? questionBank.easy, [difficulty]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerWasCorrect, setAnswerWasCorrect] = useState<boolean | null>(null);
  const [showSyllables, setShowSyllables] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartRef = useRef(Date.now());
  const [, setStats] = useState<StatsState>({
    correct: 0,
    incorrect: 0,
    responses: [],
    streak: 0,
    maxStreak: 0,
  });

  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const progress = ((questionIndex + 1) / totalQuestions) * 100;

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
    <ScrollView contentContainerStyle={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.backButton} accessibilityRole="button">
          <Text style={styles.backText}>← Salir</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.timerLabel}>Tiempo restante</Text>
          <Text style={styles.timerValue}>{formatSeconds(timeRemaining)}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.card}>
        <Text style={styles.questionCounter}>
          Palabra {questionIndex + 1} de {totalQuestions}
        </Text>
        <Text style={styles.word}>{currentQuestion.word}</Text>
        <Text style={styles.prompt}>¿Cuántas sílabas tiene esta palabra?</Text>

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
                  isSelected && styles.chipSelected,
                  isCorrect && styles.chipCorrect,
                  isIncorrectChoice && styles.chipIncorrect,
                ]}
                onPress={() => handleAnswerPress(option)}
                accessibilityRole="button"
              >
                <Text style={styles.chipText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.hintButton} onPress={() => setShowSyllables((prev) => !prev)}>
          <Text style={styles.hintText}>{showSyllables ? 'Ocultar sílabas' : 'Mostrar sílabas'}</Text>
        </TouchableOpacity>

        {showSyllables && (
          <View style={styles.syllableGroup}>
            {currentQuestion.syllables.map((syllable) => (
              <View key={syllable} style={styles.syllableChip}>
                <Text style={styles.syllableText}>{syllable}</Text>
              </View>
            ))}
          </View>
        )}

        {showFeedback && (
          <View
            style={[styles.feedback, answerWasCorrect ? styles.feedbackSuccess : styles.feedbackError]}
          >
            <Text style={styles.feedbackText}>
              {answerWasCorrect
                ? '¡Muy bien! Contaste correctamente las sílabas.'
                : 'Recuerda separar la palabra en golpes de voz y vuelve a intentarlo.'}
            </Text>
          </View>
        )}

        {showFeedback && questionIndex < totalQuestions - 1 && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion} accessibilityRole="button">
            <Text style={styles.nextButtonText}>Siguiente palabra</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 24,
    gap: 24,
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
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#00000022',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  questionCounter: {
    fontSize: 14,
    color: palette.muted,
  },
  word: {
    fontSize: 40,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
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
    minWidth: 56,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#DBEAFE',
  },
  chipCorrect: {
    backgroundColor: '#DCFCE7',
  },
  chipIncorrect: {
    backgroundColor: '#FEE2E2',
  },
  chipText: {
    fontSize: 18,
    fontWeight: '700',
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
  },
  syllableText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 16,
  },
  feedback: {
    borderRadius: 12,
    padding: 14,
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
  nextButton: {
    marginTop: 4,
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonText: {
    color: palette.primaryOn,
    fontWeight: '700',
    textAlign: 'center',
  },
});
