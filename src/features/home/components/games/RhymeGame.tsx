import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '@/theme/colors';
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
  const questions = useMemo(() => questionBank[difficulty] ?? questionBank.easy, [difficulty]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerWasCorrect, setAnswerWasCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
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
        <View style={styles.keywordBox}>
          <Text style={styles.keyword}>{currentQuestion.keyWord}</Text>
        </View>
        <Text style={styles.prompt}>Selecciona todas las palabras que rimen con la palabra clave.</Text>

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
                  isSelected && styles.optionSelected,
                  isCorrect && styles.optionCorrect,
                  isIncorrectChoice && styles.optionIncorrect,
                ]}
                onPress={() => handleToggleAnswer(option)}
                accessibilityRole="button"
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!showFeedback && (
          <TouchableOpacity
            style={[styles.submitButton, selectedAnswers.length === 0 && styles.submitButtonDisabled]}
            onPress={handleSubmitAnswer}
            disabled={selectedAnswers.length === 0}
            accessibilityRole="button"
          >
            <Text style={styles.submitButtonText}>
              {selectedAnswers.length === 0
                ? 'Selecciona al menos una opción'
                : `Confirmar (${selectedAnswers.length})`}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint((prev) => !prev)}>
          <Text style={styles.hintText}>{showHint ? 'Ocultar pista' : 'Ver pista'}</Text>
        </TouchableOpacity>

        {showHint && !showFeedback && (
          <Text style={styles.hintMessage}>Escucha el final de la palabra clave y busca sonidos similares.</Text>
        )}

        {showFeedback && (
          <View style={[styles.feedback, answerWasCorrect ? styles.feedbackSuccess : styles.feedbackError]}>
            <Text style={styles.feedbackTitle}>
              {answerWasCorrect ? '¡Gran trabajo!' : 'Buen intento, revisa las rimas correctas.'}
            </Text>
            <Text style={styles.feedbackSubtitle}>Rimas correctas:</Text>
            <View style={styles.correctRhymes}>
              {currentQuestion.correctRhymes.map((rhyme) => (
                <View key={rhyme} style={styles.rhymeChip}>
                  <Text style={styles.rhymeText}>{rhyme}</Text>
                </View>
              ))}
            </View>
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
  keywordBox: {
    alignSelf: 'center',
    backgroundColor: '#DDD6FE',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  keyword: {
    fontSize: 40,
    fontWeight: '800',
    color: '#4C1D95',
  },
  prompt: {
    fontSize: 16,
    color: palette.text,
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
    backgroundColor: '#E0E7FF',
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
  },
  feedbackSuccess: {
    backgroundColor: '#DCFCE7',
  },
  feedbackError: {
    backgroundColor: '#FEE2E2',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    color: palette.muted,
    textAlign: 'center',
  },
  correctRhymes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  rhymeChip: {
    backgroundColor: '#DDD6FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rhymeText: {
    color: '#4C1D95',
    fontWeight: '700',
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
