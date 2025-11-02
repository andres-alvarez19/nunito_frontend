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
import { palette, withAlpha } from "@/theme/colors";
import type { Room } from "@/features/home/types";
import { formatSeconds } from "@/utils/time";

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
  const [timeRemaining, setTimeRemaining] = useState(room.duration * 60);
  const [copied, setCopied] = useState(false);

  const gameDefinition = useMemo(
    () => gameDefinitions.find((definition) => definition.id === room.game),
    [room.game],
  );
  const gameName = gameDefinition?.name ?? "Actividad";
  const gameTheme = gameDefinition
    ? gameThemeTokens[gameDefinition.color]
    : null;
  const difficultyLabel = difficultyLabels[room.difficulty] ?? room.difficulty;

  useEffect(() => {
    setTimeRemaining(room.duration * 60);
  }, [room.duration, room.code]);

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
      setTimeRemaining(room.duration * 60);
    }
  }, [room.isActive, room.duration]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleStartPress = () => {
    setTimeRemaining(room.duration * 60);
    onStartGame();
  };

  const handleEndPress = () => {
    onEndGame();
  };

  const handleCopyCode = () => {
    setCopied(true);
  };

  const formattedTimer = formatSeconds(timeRemaining);

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.title}>{room.name}</Text>
            <Text style={styles.subtitle}>
              Sala creada por {room.teacher.name}
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
          <InfoChip label="Duración" value={`${room.duration} minutos`} />
          <InfoChip
            label="Estudiantes"
            value={room.students.length.toString()}
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
            <TouchableOpacity
              style={[
                styles.primaryButton,
                room.students.length === 0 && styles.disabledButton,
              ]}
              disabled={room.students.length === 0}
              onPress={handleStartPress}
            >
              <Text style={styles.primaryButtonText}>Iniciar juego</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.destructiveButton}
              onPress={handleEndPress}
            >
              <Text style={styles.destructiveButtonText}>Finalizar sesión</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onViewResults}
          >
            <Text style={styles.secondaryButtonText}>Ver reportes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.studentsCard}>
        <Text style={styles.sectionTitle}>Estudiantes conectados</Text>
        {room.students.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Esperando estudiantes…</Text>
            <Text style={styles.emptyDescription}>
              Comparte el código para que se unan a la sala.
            </Text>
          </View>
        ) : (
          room.students.map((student) => (
            <View key={student} style={styles.studentRow}>
              <View style={styles.studentDot} />
              <Text style={styles.studentName}>{student}</Text>
            </View>
          ))
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
    flex: 1,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.primary,
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: withAlpha(palette.primary, 0.05),
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
});
