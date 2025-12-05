import type { ComponentType } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import type { GameResults } from '@/features/home/types';
import { palette } from '@/theme/colors';

import AudioRecognitionGame from './games/AudioRecognitionGame';
import ImageWordGame from './games/ImageWordGame';
import RhymeGame from './games/RhymeGame';
import SyllableCountGame from './games/SyllableCountGame';
import type { GameComponentProps } from './games/types';
import { useGameMonitoringPublisher } from '@/hooks/useGameMonitoringPublisher';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '@stomp/stompjs';
import { useQuestions } from '@/services/useQuestions';
import { useEffect } from 'react';
import { submitGameResult } from '@/services/useAnswers';

interface GameLauncherProps {
  gameId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Tiempo máximo permitido en segundos. */
  timeLimit: number;
  onGameComplete: (results: GameResults) => void;
  onBack: () => void;
  roomId?: string;
  studentName?: string;
  studentId?: string;
  stompClient?: Client | null;
  testSuiteId?: string;
}

const gameRegistry: Record<string, ComponentType<GameComponentProps>> = {
  'image-word': ImageWordGame,
  'syllable-count': SyllableCountGame,
  'rhyme-identification': RhymeGame,
  'audio-recognition': AudioRecognitionGame,
};

export default function GameLauncher({ gameId, difficulty, timeLimit, onGameComplete, onBack, roomId, studentName, studentId, stompClient, testSuiteId }: GameLauncherProps) {
  const SelectedGame = gameRegistry[gameId];
  const { user } = useAuth();
  const { questions, fetchQuestions, loading } = useQuestions();
  const safeStudentName = studentName || user?.name || 'Estudiante';
  const safeStudentId = studentId || user?.id || 'temp-student';

  useEffect(() => {
    if (testSuiteId) {
      fetchQuestions(testSuiteId, gameId as any);
    }
  }, [testSuiteId, gameId, fetchQuestions]);

  // We need the socket client to publish events
  // We reuse the connection if possible, but here we might need to ensure we have access to the client
  // Since GameLauncher is inside HomeScreen which doesn't hold the socket state for the student in a way we can easily pass down the client object itself without prop drilling from a context
  // But wait, HomeScreen DOES NOT use useRoomSocket for the student dashboard part yet?
  // Actually, let's look at how we can get the client.
  // Ideally, the student should be connected to the room socket when they join.
  // For now, let's instantiate useRoomSocket here if roomId is present, just to get the client.
  // OR better: pass the client from a parent if possible.
  // But given the current structure, let's use useRoomSocket here to ensure we have a connection or reuse it.
  // Note: useRoomSocket handles connection logic. If we call it with the same params, it might create a new connection if not carefully managed or if the context isn't shared.
  // However, the requirement says "reutilizando la conexión STOMP ya existente".
  // If we don't have a global socket context, we might need to lift the socket connection up or use a singleton/context.
  // For this task, I will assume we can use useRoomSocket here. If it creates a second connection, we might need to refactor later to a Context.
  // BUT, looking at the user request: "Reutilice el mismo cliente STOMP global (o que comparta conexión con useRoomSocket) para no abrir sockets duplicados."
  // Since I don't have a global context yet, I will use useRoomSocket.
  // To avoid duplication, the best way in this codebase without a major refactor is to rely on the fact that if we are in the game, we might be the only active socket user for this student in this view.

  // WebSocket Integration is now handled by parent (HomeScreen)
  // We receive stompClient as a prop to reuse the connection

  const { publishAnswer } = useGameMonitoringPublisher({
    roomId: roomId || '',
    studentId: safeStudentId,
    studentName: safeStudentName,
    gameId,
    stompClient: stompClient || null // Use passed client
  });

  useEffect(() => {
    console.log('GameLauncher mounted. StompClient connected:', stompClient?.connected);
    console.log('GameLauncher params:', { roomId, studentId, studentName, gameId });
  }, [stompClient, roomId, studentId, studentName, gameId]);

  const handleGameComplete = (results: GameResults) => {
    console.log('GameLauncher - Game Complete. Results:', results);

    if (roomId) {
      const payload = {
        studentId: safeStudentId,
        studentName: safeStudentName,
        roomId,
        gameId,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        incorrectAnswers: results.incorrectAnswers,
        averageTimeSeconds: results.averageTime,
        score: results.score,
        completedAt: new Date().toISOString(),
      };

      void submitGameResult(roomId, payload).catch((error) => {
        console.error('Error submitting game result:', error);
      });
    }

    onGameComplete(results);
  };

  if (!SelectedGame) {
    return (
      <View
        className="flex-1 items-center justify-center gap-3 px-8"
        style={{ backgroundColor: palette.background }}
      >
        <Text className="text-xl font-bold" style={{ color: palette.text }}>
          No encontramos este juego
        </Text>
        <Text className="text-base text-center" style={{ color: palette.muted }}>
          Parece que el juego seleccionado aún no está disponible en la versión móvil.
        </Text>
        <TouchableOpacity
          className="mt-2 rounded-xl px-5 py-3"
          style={{ backgroundColor: palette.primary }}
          onPress={onBack}
          accessibilityRole="button"
        >
          <Text className="font-semibold" style={{ color: palette.primaryOn }}>
            Volver al menú
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SelectedGame
      difficulty={difficulty}
      timeLimit={timeLimit}
      onExit={onBack}
      onGameComplete={(results) => {
        handleGameComplete(results);
      }}
      onAnswer={publishAnswer}
      questions={questions.length > 0 ? questions : undefined}
    />
  );
}
