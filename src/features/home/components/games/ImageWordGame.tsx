import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { palette, withAlpha } from '@/theme/colors';
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
  const theme = useMemo(
    () => ({
      container: palette.mintContainer,
      accent: palette.mint,
      onAccent: palette.mintOn,
    }),
    []
  );
  const questions = useMemo(() => questionBank[difficulty] ?? questionBank.easy, [difficulty]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerWasCorrect, setAnswerWasCorrect] = useState<boolean | null>(null);
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
            <Text style={[styles.metaTitle, { color: theme.onAccent }]}>Asociación Imagen-Palabra</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="star" size={16} color={withAlpha(theme.onAccent, 0.8)} />
              <Text style={[styles.metaSubtitle, { color: withAlpha(theme.onAccent, 0.8) }]}>
                Pregunta {questionIndex + 1} de {totalQuestions}
              </Text>
            </View>
          </View>
          <View style={styles.metaBadges}>
            {/* Badges removed or updated if needed, keeping simple for now based on request */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.correct}/{totalQuestions}</Text>
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
        <View style={[styles.card, styles.columnCard, { borderColor: withAlpha(theme.accent, 0.18) }]}>
          <Text style={styles.prompt}>¿Qué ves en la imagen?</Text>
          <View style={styles.imageFrame}>
            <Image source={currentQuestion.image} style={styles.image} resizeMode="contain" />
            {showFeedback && (
              <View style={styles.imageOverlay}>
                <Text style={styles.overlayText}>{answerWasCorrect ? '✅' : '✖️'}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint((prev) => !prev)}>
            <Text style={[styles.hintText, { color: theme.accent }]}>
              💡 {showHint ? 'Ocultar pista' : 'Ver pista'}
            </Text>
          </TouchableOpacity>

          {showHint && <Text style={styles.hintMessage}>{currentQuestion.hint}</Text>}
        </View>

        <View style={[styles.card, styles.columnCard, { borderColor: withAlpha(theme.accent, 0.18) }]}>
          <Text style={styles.prompt}>Selecciona la palabra correcta</Text>
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
                    { backgroundColor: withAlpha(theme.accent, 0.14), borderColor: withAlpha(theme.accent, 0.25) },
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
                ? `¡INCREÍBLE RACHA! Llevas ${stats.streak}.`
                : '¡Excelente! Respuesta correcta.'
              : `La respuesta correcta era ${currentQuestion.correctAnswer}.`}
          </Text>
        </View>
      )}

      {showFeedback && questionIndex < totalQuestions - 1 && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion} accessibilityRole="button">
          <Text style={styles.nextButtonText}>Siguiente pregunta</Text>
        </TouchableOpacity>
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
    gap: 12,
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
  columns: {
    gap: 16,
  },
  columnCard: {
    flex: 1,
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
  questionCounter: {
    fontSize: 14,
    color: palette.muted,
  },
  topStats: {
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
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
  imageFrame: {
    alignSelf: 'center',
    borderWidth: 0,
    borderRadius: 12,
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  image: {
    width: 260,
    height: 200,
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 0,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    fontSize: 42,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
  },
  options: {
    gap: 10,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#C7D2FE',
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
  hintButton: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: withAlpha(palette.mint, 0.12),
  },
  hintText: {
    color: palette.primary,
    fontWeight: '700',
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
  feedbackText: {
    color: palette.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    color: palette.text,
  },
  nextButton: {
    marginTop: 4,
    backgroundColor: palette.mint,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonText: {
    color: palette.mintOn,
    fontWeight: '700',
    textAlign: 'center',
  },
});
