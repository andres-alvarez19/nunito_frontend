import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '@/theme/colors';
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
          Audio {questionIndex + 1} de {totalQuestions}
        </Text>
        <Text style={styles.prompt}>Escucha con atención la palabra y selecciona la opción correcta.</Text>

        <View style={styles.audioActions}>
          <TouchableOpacity
            style={[styles.primaryButton, isPlaying && styles.secondaryButton]}
            onPress={isPlaying ? stopWord : speakWord}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>{isPlaying ? 'Detener audio' : 'Escuchar palabra'}</Text>
          </TouchableOpacity>
          <Text style={styles.playCount}>{hasPlayedAudio ? `Reproducido ${playCount} vez${playCount === 1 ? '' : 'es'}` : 'Aún no reproduces el audio'}</Text>
        </View>

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
                  isSelected && styles.optionSelected,
                  isCorrect && styles.optionCorrect,
                  isIncorrectChoice && styles.optionIncorrect,
                ]}
                onPress={() => handleAnswerPress(option)}
                accessibilityRole="button"
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showFeedback && (
          <View style={[styles.feedback, answerWasCorrect ? styles.feedbackSuccess : styles.feedbackError]}>
            <Text style={styles.feedbackText}>
              {answerWasCorrect
                ? '¡Excelente! Identificaste el sonido correcto.'
                : `La respuesta correcta era "${currentQuestion.correctAnswer}".`}
            </Text>
          </View>
        )}

        {showFeedback && questionIndex < totalQuestions - 1 && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion} accessibilityRole="button">
            <Text style={styles.nextButtonText}>Siguiente audio</Text>
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
  prompt: {
    fontSize: 16,
    color: palette.text,
  },
  audioActions: {
    gap: 8,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#6366F1',
  },
  primaryButtonText: {
    color: palette.primaryOn,
    fontWeight: '700',
  },
  playCount: {
    color: palette.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  optionList: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
  },
  optionSelected: {
    backgroundColor: '#DBEAFE',
  },
  optionCorrect: {
    backgroundColor: '#DCFCE7',
  },
  optionIncorrect: {
    backgroundColor: '#FEE2E2',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    textAlign: 'center',
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
