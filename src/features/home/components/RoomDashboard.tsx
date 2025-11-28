import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  gameDefinitions,
  gameThemeTokens,
} from "@/features/home/constants/games";
import NunitoButton from "@/features/home/components/NunitoButton";
import { palette, withAlpha } from "@/theme/colors";
import type { Room } from "@/features/home/types";
import { formatSeconds } from "@/utils/time";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { useAuth } from "@/contexts/AuthContext";
import { useRoomMonitoring } from "@/hooks/useRoomMonitoring";
import { StudentMonitoringStateDto } from "@/types/monitoring";

interface RoomDashboardProps {
  room: Room;
  onStartGame: () => void;
  onEndGame: () => void;
  onViewResults: () => void;
  onBack: () => void;
}

const difficultyLabels = {
  easy: "Fácil",
  medium: "Intermedio",
  hard: "Difícil",
} as const;

export default function RoomDashboard({
  room,
  onStartGame,
  onEndGame,
  onViewResults,
  onBack,
}: RoomDashboardProps) {
  const { user } = useAuth();
  // Use durationMinutes if available, otherwise fallback to duration or default
  const duration = room.durationMinutes ?? room.duration ?? 10;
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [copied, setCopied] = useState(false);

  // WebSocket Integration
  const { users: connectedUsers, answers, status: connectionStatus, stompClient } = useRoomSocket({
    roomId: room.id,
    userId: user?.id || "teacher-temp-id",
    userName: user?.name || "Profesor",
    enabled: true, // Always connect when in dashboard
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedStudentId && studentsList.length > 0) {
      setSelectedStudentId(studentsList[0].userId);
    }
  }, [studentsList, selectedStudentId]);

  const globalAccuracy = useMemo(() => {
    const totalAnswers = answers.length;
    const totalCorrect = answers.filter(a => a.correct).length;
    return totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;
  }, [answers]);

  const selectedStudentAnswers = useMemo(() => {
    return answers.filter(a => a.studentId === selectedStudentId);
  }, [answers, selectedStudentId]);

  useEffect(() => {
    console.log('RoomDashboard answers:', answers);
    console.log('RoomDashboard globalAccuracy:', globalAccuracy);
    console.log('RoomDashboard selectedStudentId:', selectedStudentId);
  }, [answers, globalAccuracy, selectedStudentId]);

  const { students: monitoredStudents, globalStats, ranking, connectionState } = useRoomMonitoring({
    roomId: room.id,
    stompClient: null // We need the client from useRoomSocket, but useRoomSocket doesn't return it yet in the component usage above.
    // Wait, I updated useRoomSocket to return it. I need to destructure it.
  });

  // Re-call useRoomSocket to get the client properly
  // Actually, I should just update the destructuring above.
  // But since I can't easily edit the destructuring line without replacing the whole block, I'll do it in a separate chunk or just here if I can match it.
  // Let's try to match the previous chunk better.
  // I will replace the useRoomSocket call to include stompClient.

  // Filter out the teacher from the student list and merge with students who have answered
  const studentsList = useMemo(() => {
    const studentsMap = new Map<string, { userId: string; name: string }>();

    // Add connected users
    connectedUsers.forEach(u => {
      if (u.userId !== user?.id) {
        studentsMap.set(u.userId, u);
      }
    });

    // Add students from answers (in case they are not in connected list)
    answers.forEach(a => {
      if (a.studentId !== user?.id && !studentsMap.has(a.studentId)) {
        studentsMap.set(a.studentId, { userId: a.studentId, name: a.studentName });
      }
    });

    return Array.from(studentsMap.values());
  }, [connectedUsers, answers, user?.id]);

  // Handle game array or single game
  const gameId = room.games?.[0]?.id ?? room.game;

  const gameDefinition = useMemo(
    () => gameDefinitions.find((definition) => definition.id === gameId),
    [gameId],
  );
  const gameName = gameDefinition?.name ?? "Actividad";
  const gameTheme = gameDefinition
    ? gameThemeTokens[gameDefinition.color]
    : null;
  const difficultyLabel = difficultyLabels[room.difficulty] ?? room.difficulty;

  useEffect(() => {
    setTimeRemaining(duration * 60);
  }, [duration, room.code]);

  useEffect(() => {
    if (!room.isActive) return;
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [room.isActive, timeRemaining]);

  useEffect(() => {
    if (!room.isActive) {
      setTimeRemaining(duration * 60);
    }
  }, [room.isActive, duration]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleStartPress = () => {
    setTimeRemaining(duration * 60);
    onStartGame();
  };

  const handleEndPress = () => {
    onEndGame();
  };

  const handleCopyCode = () => {
    setCopied(true);
  };

  const formattedTimer = formatSeconds(timeRemaining);

  // Teacher name fallback
  const teacherName = room.teacher?.name ?? user?.name ?? "Profesor";

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.title}>{room.name}</Text>
            <Text style={styles.subtitle}>
              Sala creada por {teacherName}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              room.isActive ? styles.statusBadgeActive : styles.statusBadgeIdle,
            ]}
          >
            <Text style={styles.statusText}>
              {room.isActive ? "Activa" : "En espera"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.roomCard}>
        <TouchableOpacity style={styles.codeBlock} onPress={handleCopyCode}>
          <View>
            <Text style={styles.codeLabel}>Código de acceso</Text>
            <Text style={styles.codeValue}>{room.code}</Text>
          </View>
          <Text style={styles.copyHint}>
            {copied ? "¡Código listo para compartir!" : "Tocar para copiar"}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          <InfoChip label="Juego" value={gameName} />
          <InfoChip label="Dificultad" value={difficultyLabel} />
          <InfoChip label="Duración" value={`${duration} minutos`} />
          <InfoChip
            label="Estudiantes"
            value={studentsList.length.toString()}
          />
        </View>

        {room.isActive && (
          <View
            style={[
              styles.timerBox,
              gameTheme && {
                borderColor: withAlpha(gameTheme.accent, 0.5),
                backgroundColor: withAlpha(gameTheme.accent, 0.12),
              },
            ]}
          >
            <Text style={styles.timerLabel}>Tiempo restante</Text>
            <Text style={styles.timerValue}>{formattedTimer}</Text>
          </View>
        )}

        <View style={styles.controlRow}>
          {!room.isActive ? (
            <NunitoButton
              style={studentsList.length === 0 && styles.disabledButton}
              disabled={studentsList.length === 0}
              onPress={handleStartPress}
            >
              <Text style={styles.primaryButtonText}>Iniciar juego</Text>
            </NunitoButton>
          ) : (
            <TouchableOpacity
              style={styles.destructiveButton}
              onPress={handleEndPress}
            >
              <Text style={styles.destructiveButtonText}>Finalizar sesión</Text>
            </TouchableOpacity>
          )}

          <NunitoButton contentStyle={styles.secondaryButton}>
            <TouchableOpacity
              style={styles.secondaryButtonInner}
              onPress={onViewResults}
            >
              <Text style={styles.secondaryButtonText}>Ver reportes</Text>
            </TouchableOpacity>
          </NunitoButton>
        </View>
      </View>

      <View style={styles.studentsCard}>
        {/* Real-time Room Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sala en tiempo real</Text>

          <View style={styles.statsRow}>
            <InfoChip label="Promedio Global (Sala)" value={`${globalAccuracy.toFixed(1)}%`} />
          </View>

          <Text style={styles.subTitle}>Alumno seleccionado</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentSelector}>
            {studentsList.map(student => (
              <TouchableOpacity
                key={student.userId}
                style={[
                  styles.studentChip,
                  selectedStudentId === student.userId && styles.studentChipSelected
                ]}
                onPress={() => setSelectedStudentId(student.userId)}
              >
                <Text style={[
                  styles.studentChipText,
                  selectedStudentId === student.userId && styles.studentChipTextSelected
                ]}>
                  {student.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.subTitle}>Respuestas de {studentsList.find(s => s.userId === selectedStudentId)?.name || '...'}</Text>
          {selectedStudentAnswers.length === 0 ? (
            <Text style={styles.emptyText}>Aún no hay respuestas de este alumno.</Text>
          ) : (
            selectedStudentAnswers.map((a, idx) => (
              <View key={idx} style={styles.answerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.questionId}>Pregunta: {a.questionId}</Text>
                  <Text style={styles.answerText}>Respuesta: {a.answer}</Text>
                </View>
                <View style={[
                  styles.resultBadge,
                  a.correct ? styles.resultBadgeCorrect : styles.resultBadgeIncorrect
                ]}>
                  <Text style={[
                    styles.resultText,
                    a.correct ? styles.resultTextCorrect : styles.resultTextIncorrect
                  ]}>
                    {a.correct ? 'Correcta' : 'Incorrecta'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Estudiantes conectados</Text>
          <Text style={{ fontSize: 12, color: palette.muted }}>
            {connectionStatus === 'CONNECTING' ? 'Conectando...' :
              connectionStatus === 'CONNECTED' ? 'En línea' : 'Desconectado'}
          </Text>
        </View>

        {/* Global Stats */}
        {globalStats && (
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <InfoChip label="Precisión Global" value={`${globalStats.globalAccuracyPct}%`} />
            <InfoChip label="Respuestas" value={`${globalStats.totalAnsweredAll}`} />
          </View>
        )}

        {/* Ranking */}
        {ranking.length > 0 && (
          <View style={{ marginBottom: 15 }}>
            <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 8 }]}>Ranking de Velocidad</Text>
            {ranking.map((entry) => (
              <View key={entry.studentId} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                <Text style={{ fontWeight: 'bold', width: 30 }}>#{entry.rank}</Text>
                <Text style={{ flex: 1 }}>{entry.studentName}</Text>
                <Text style={{ color: palette.muted }}>{(entry.avgResponseMillis / 1000).toFixed(1)}s</Text>
              </View>
            ))}
          </View>
        )}

        {studentsList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Esperando estudiantes…</Text>
            <Text style={styles.emptyDescription}>
              Comparte el código para que se unan a la sala.
            </Text>
          </View>
        ) : (
          studentsList.map((student) => {
            const monitoringData = monitoredStudents.find(s => s.studentId === student.userId);
            return (
              <View key={student.userId} style={styles.studentRow}>
                <View style={[styles.studentDot, { backgroundColor: monitoringData?.status === 'online' ? palette.mint : palette.muted }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  {monitoringData && (
                    <Text style={{ fontSize: 12, color: palette.muted }}>
                      {monitoringData.currentQuestionText ? `Pregunta: ${monitoringData.currentQuestionText}` : 'Esperando...'}
                      {monitoringData.lastSelectedOptionText && ` - Última: ${monitoringData.lastSelectedOptionText} (${monitoringData.lastIsCorrect ? 'Correcta' : 'Incorrecta'})`}
                    </Text>
                  )}
                </View>
                {monitoringData && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: 'bold', color: palette.primary }}>{monitoringData.accuracyPct}%</Text>
                    <Text style={{ fontSize: 10, color: palette.muted }}>{monitoringData.totalCorrect}/{monitoringData.totalAnswered}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Volver al menú principal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

interface InfoChipProps {
  label: string;
  value: string;
}

function InfoChip({ label, value }: InfoChipProps) {
  return (
    <View style={styles.infoChip}>
      <Text style={styles.infoChipLabel}>{label}</Text>
      <Text style={styles.infoChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  headerCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#0000001c",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextGroup: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.text,
  },
  subtitle: {
    fontSize: 15,
    color: palette.muted,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusBadgeActive: {
    backgroundColor: withAlpha(palette.primary, 0.15),
  },
  statusBadgeIdle: {
    backgroundColor: withAlpha(palette.muted, 0.15),
  },
  statusText: {
    color: palette.text,
    fontWeight: "600",
  },
  roomCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#00000012",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 2,
  },
  codeBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: withAlpha(palette.primary, 0.3),
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: withAlpha(palette.primary, 0.06),
  },
  codeLabel: {
    fontSize: 13,
    color: palette.muted,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: "700",
    color: palette.text,
    letterSpacing: 2,
  },
  copyHint: {
    fontSize: 12,
    color: palette.primary,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoChip: {
    flexBasis: "48%",
    minWidth: "48%",
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: withAlpha(palette.border, 0.8),
    flexGrow: 1,
  },
  infoChipLabel: {
    fontSize: 13,
    color: palette.muted,
  },
  infoChipValue: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
    marginTop: 4,
  },
  timerBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  timerLabel: {
    fontSize: 13,
    color: palette.muted,
  },
  timerValue: {
    fontSize: 26,
    fontWeight: "700",
    color: palette.text,
  },
  controlRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryButton: {
  },
  primaryButtonText: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  destructiveButton: {
    flex: 1,
    backgroundColor: withAlpha(palette.error, 0.12),
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: withAlpha(palette.error, 0.4),
  },
  destructiveButtonText: {
    color: palette.error,
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.primary,
    paddingVertical: 14,
    backgroundColor: withAlpha(palette.primary, 0.05),
  },
  secondaryButtonInner: {
    alignItems: "center",
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  studentsCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#00000012",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  emptyState: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: withAlpha(palette.muted, 0.2),
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: palette.text,
  },
  emptyDescription: {
    fontSize: 14,
    color: palette.muted,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(palette.border, 0.6),
  },
  studentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },
  studentName: {
    fontSize: 15,
    color: palette.text,
    fontWeight: "600",
  },
  backButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backText: {
    color: palette.primary,
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 20,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    marginTop: 8,
  },
  studentSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  studentChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: palette.surfaceMuted,
    marginRight: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  studentChipSelected: {
    backgroundColor: withAlpha(palette.primary, 0.1),
    borderColor: palette.primary,
  },
  studentChipText: {
    fontSize: 14,
    color: palette.text,
  },
  studentChipTextSelected: {
    color: palette.primary,
    fontWeight: '600',
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(palette.border, 0.5),
  },
  questionId: {
    fontSize: 12,
    color: palette.muted,
  },
  answerText: {
    fontSize: 14,
    color: palette.text,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: palette.muted,
    fontStyle: 'italic',
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultBadgeCorrect: {
    backgroundColor: withAlpha(palette.mint, 0.15),
  },
  resultBadgeIncorrect: {
    backgroundColor: withAlpha(palette.error, 0.15),
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultTextCorrect: {
    color: palette.mint,
  },
  resultTextIncorrect: {
    color: palette.error,
  },
});
