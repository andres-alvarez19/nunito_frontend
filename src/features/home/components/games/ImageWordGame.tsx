import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '@/theme/colors';
import { formatSeconds } from '@/utils/time';

import type { GameComponentProps } from './types';

interface GameQuestion {
  id: number;
  image: any;
  correctAnswer: string;
  options: string[];
  hint: string;
}

const questionBank: Record<'easy' | 'medium' | 'hard', GameQuestion[]> = {
  easy: [
    {
      id: 1,
      image: require('../../../../../assets/images/gato-naranja-sentado.jpg'),
      correctAnswer: 'GATO',
      options: ['GATO', 'PERRO', 'PÁJARO'],
      hint: "Es un animal doméstico que dice 'miau'",
    },
    {
      id: 2,
      image: require('../../../../../assets/images/casa-azul-con-puerta-roja.jpg'),
      correctAnswer: 'CASA',
      options: ['CASA', 'CARRO', 'ÁRBOL'],
      hint: 'Es donde vive la gente',
    },
    {
      id: 3,
      image: require('../../../../../assets/images/pelota-roja-redonda.jpg'),
      correctAnswer: 'PELOTA',
      options: ['PELOTA', 'CUBO', 'LIBRO'],
      hint: 'Es redonda y se usa para jugar',
    },
    {
      id: 4,
      image: require('../../../../../assets/images/sol-amarillo-brillante.jpg'),
      correctAnswer: 'SOL',
      options: ['SOL', 'LUNA', 'ESTRELLA'],
      hint: 'Nos da luz y calor durante el día',
    },
    {
      id: 5,
      image: require('../../../../../assets/images/flor-rosa-bonita.jpg'),
      correctAnswer: 'FLOR',
      options: ['FLOR', 'HOJA', 'RAMA'],
      hint: 'Es bonita, colorida y huele bien',
    },
  ],
  medium: [
    {
      id: 1,
      image: require('../../../../../assets/images/mariposa-colorida-volando.jpg'),
      correctAnswer: 'MARIPOSA',
      options: ['MARIPOSA', 'ABEJA', 'LIBÉLULA', 'MOSCA'],
      hint: 'Es un insecto con alas coloridas',
    },
    {
      id: 2,
      image: require('../../../../../assets/images/elefante-gris-grande.jpg'),
      correctAnswer: 'ELEFANTE',
      options: ['ELEFANTE', 'RINOCERONTE', 'HIPOPÓTAMO', 'JIRAFA'],
      hint: 'Es un gran mamífero con trompa',
    },
    {
      id: 3,
      image: require('../../../../../assets/images/bicicleta-roja-con-ruedas.jpg'),
      correctAnswer: 'BICICLETA',
      options: ['BICICLETA', 'MOTOCICLETA', 'PATINETA', 'TRICICLO'],
      hint: 'Tiene dos ruedas y se mueve con pedales',
    },
  ],
  hard: [
    {
      id: 1,
      image: require('../../../../../assets/images/telescopio-astron-mico-negro.jpg'),
      correctAnswer: 'TELESCOPIO',
      options: ['TELESCOPIO', 'MICROSCOPIO', 'BINOCULARES', 'CÁMARA', 'PERISCOPIO'],
      hint: 'Sirve para observar estrellas y planetas',
    },
    {
      id: 2,
      image: require('../../../../../assets/images/orquesta-sinf-nica-instrumentos.jpg'),
      correctAnswer: 'ORQUESTA',
      options: ['ORQUESTA', 'BANDA', 'CORO', 'CONJUNTO', 'GRUPO'],
      hint: 'Es un grupo de músicos que tocan diferentes instrumentos',
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

export default function ImageWordGame({ difficulty, timeLimit, onExit, onGameComplete }: GameComponentProps) {
  const questions = useMemo(() => questionBank[difficulty] ?? questionBank.easy, [difficulty]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerWasCorrect, setAnswerWasCorrect] = useState<boolean | null>(null);
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
          Pregunta {questionIndex + 1} de {totalQuestions}
        </Text>
        <Image source={currentQuestion.image} style={styles.image} resizeMode="cover" />
        <Text style={styles.prompt}>¿Qué palabra corresponde a la imagen?</Text>

        <View style={styles.options}>
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

        <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint((prev) => !prev)}>
          <Text style={styles.hintText}>{showHint ? 'Ocultar pista' : 'Ver pista'}</Text>
        </TouchableOpacity>

        {showHint && <Text style={styles.hintMessage}>{currentQuestion.hint}</Text>}

        {showFeedback && (
          <View
            style={[styles.feedback, answerWasCorrect ? styles.feedbackSuccess : styles.feedbackError]}
          >
            <Text style={styles.feedbackText}>
              {answerWasCorrect ? '¡Excelente! Respuesta correcta.' : 'Casi... intenta nuevamente en la siguiente pregunta.'}
            </Text>
          </View>
        )}

        {showFeedback && questionIndex < totalQuestions - 1 && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion} accessibilityRole="button">
            <Text style={styles.nextButtonText}>Siguiente pregunta</Text>
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
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  options: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#EEF2FF',
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
  optionTextActive: {
    color: palette.text,
  },
  hintButton: {
    alignSelf: 'flex-end',
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
