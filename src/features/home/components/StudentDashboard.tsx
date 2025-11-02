import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { palette, withAlpha } from "@/theme/colors";
import { formatSeconds } from "@/utils/time";

interface StudentDashboardProps {
  studentName: string;
  roomCode: string;
  onStartGame: (gameId: string) => void;
  onLeaveRoom: () => void;
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
    shadowColor: "#00000012",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: palette.primaryOn,
    fontWeight: "700",
    fontSize: 22,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: palette.text,
  },
  roomCodeLabel: {
    fontSize: 14,
    color: palette.muted,
  },
  leaveButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withAlpha(palette.error, 0.5),
    backgroundColor: withAlpha(palette.error, 0.12),
  },
  leaveButtonText: {
    color: palette.error,
    fontWeight: "600",
  },
  waitingCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#00000012",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: palette.muted,
  },
  studentCountBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: withAlpha(palette.primary, 0.12),
  },
  studentCountText: {
    color: palette.primary,
    fontWeight: "600",
  },
  studentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  studentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: withAlpha(palette.primary, 0.05),
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexGrow: 1,
    minWidth: "45%",
    borderWidth: 1,
    borderColor: withAlpha(palette.primary, 0.15),
  },
  studentChipCurrent: {
    borderColor: palette.primary,
    backgroundColor: withAlpha(palette.primary, 0.18),
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  studentChipText: {
    color: palette.text,
    fontWeight: "500",
  },
  studentChipTextCurrent: {
    fontWeight: "700",
  },
  gameCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#00000012",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerLabel: {
    fontSize: 14,
    color: palette.muted,
  },
  timerValue: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.primary,
  },
  progressBar: {
    height: 10,
    backgroundColor: withAlpha(palette.primary, 0.08),
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: palette.primary,
    borderRadius: 999,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#00000022",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    color: palette.primaryOn,
    fontWeight: "700",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  motivationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  motivationCard: {
    flexBasis: "31%",
    minWidth: "31%",
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: withAlpha(palette.border, 0.8),
    flexGrow: 1,
  },
  motivationTitle: {
    fontWeight: "700",
    color: palette.text,
    marginBottom: 6,
  },
  motivationDescription: {
    color: palette.muted,
    fontSize: 13,
  },
  instructionsCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#00000012",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  instructionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: withAlpha(palette.primary, 0.14),
    alignItems: "center",
    justifyContent: "center",
  },
  instructionBadgeText: {
    color: palette.primary,
    fontWeight: "700",
  },
  instructionText: {
    flex: 1,
    color: palette.text,
  },
});

const connectedStudentsMock = ["Ana", "Carlos", "María"];

const MOTIVATION_CARDS = [
  {
    title: "¡Tú puedes!",
    description: "Haz tu mejor esfuerzo en cada pregunta.",
  },
  {
    title: "Aprende jugando",
    description: "Cada respuesta correcta suma puntos.",
  },
  {
    title: "Diviértete",
    description: "Lo importante es disfrutar la actividad.",
  },
];

const GAME_INSTRUCTIONS = [
  "Observa cuidadosamente cada imagen que aparezca en pantalla.",
  "Lee todas las opciones de palabras disponibles.",
  "Selecciona la palabra que mejor corresponda a la imagen.",
  "Recibirás retroalimentación inmediata sobre tu respuesta.",
];

export default function StudentDashboard({
  studentName,
  roomCode,
  onStartGame,
  onLeaveRoom,
}: StudentDashboardProps) {
  const totalTime = 600;
  const [isWaiting, setIsWaiting] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(totalTime);
  const [isActive, setIsActive] = useState(false);

  const studentList = useMemo(() => {
    const others = connectedStudentsMock.filter((name) => name !== studentName);
    return [studentName, ...others];
  }, [studentName]);

  const totalStudents = studentList.length;
  const progress = useMemo(
    () => ((totalTime - timeRemaining) / totalTime) * 100,
    [timeRemaining, totalTime],
  );
  const formattedTime = formatSeconds(timeRemaining);
  const avatarInitial = studentName.charAt(0).toUpperCase();

  useEffect(() => {
    const joinTimer = setTimeout(() => {
      setIsWaiting(false);
      setIsActive(true);
    }, 4000);

    return () => clearTimeout(joinTimer);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    if (timeRemaining === 0) {
      setIsActive(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const handlePlay = () => {
    onStartGame("image-word");
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>¡Hola, {studentName}!</Text>
            <Text style={styles.roomCodeLabel}>Sala {roomCode}</Text>
          </View>
          <TouchableOpacity style={styles.leaveButton} onPress={onLeaveRoom}>
            <Text style={styles.leaveButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isWaiting ? (
        <View style={styles.waitingCard}>
          <Text style={styles.sectionTitle}>
            Esperando que inicie el juego…
          </Text>
          <Text style={styles.sectionSubtitle}>
            Tu profesor iniciará la actividad pronto.
          </Text>
          <View style={styles.studentCountBadge}>
            <Text style={styles.studentCountText}>
              Estudiantes conectados: {totalStudents}
            </Text>
          </View>
          <View style={styles.studentGrid}>
            {studentList.map((student) => (
              <View
                key={student}
                style={[
                  styles.studentChip,
                  student === studentName && styles.studentChipCurrent,
                ]}
              >
                <View style={styles.statusDot} />
                <Text
                  style={[
                    styles.studentChipText,
                    student === studentName && styles.studentChipTextCurrent,
                  ]}
                >
                  {student}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.gameCard}>
          <Text style={styles.sectionTitle}>La actividad ha comenzado</Text>
          <Text style={styles.sectionSubtitle}>
            Presiona el botón cuando estés listo para jugar.
          </Text>

          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>Tiempo restante</Text>
            <Text style={styles.timerValue}>{formattedTime}</Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(Math.max(progress, 0), 100)}%` },
              ]}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, !isActive && styles.disabledButton]}
            onPress={handlePlay}
            disabled={!isActive}
          >
            <Text style={styles.primaryButtonText}>
              {isActive ? "¡Comenzar a jugar!" : "Esperando instrucciones…"}
            </Text>
          </TouchableOpacity>

          <View style={styles.motivationGrid}>
            {MOTIVATION_CARDS.map((card) => (
              <View key={card.title} style={styles.motivationCard}>
                <Text style={styles.motivationTitle}>{card.title}</Text>
                <Text style={styles.motivationDescription}>
                  {card.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.instructionsCard}>
        <Text style={styles.sectionTitle}>Instrucciones del juego</Text>
        {GAME_INSTRUCTIONS.map((step, index) => (
          <View key={step} style={styles.instructionRow}>
            <View style={styles.instructionBadge}>
              <Text style={styles.instructionBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
