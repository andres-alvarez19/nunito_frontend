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
import type { GameResults } from "@/features/home/types";
import { palette, withAlpha } from "@/theme/colors";

interface StudentResultsProps {
  studentName: string;
  gameId: string;
  results: GameResults;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export default function StudentResults({
  studentName,
  gameId,
  results,
  onPlayAgain,
  onBackToHome,
}: StudentResultsProps) {
  const gameDefinition = gameDefinitions.find(
    (definition) => definition.id === gameId,
  );
  const fallbackTheme = {
    accent: palette.primary,
    container: withAlpha(palette.primary, 0.12),
    on: palette.primaryOn,
  };
  const theme = gameDefinition
    ? gameThemeTokens[gameDefinition.color]
    : fallbackTheme;
  const gameName = gameDefinition?.name ?? "mini juego";

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "¡Excelente trabajo!";
    if (score >= 70) return "¡Muy bien hecho!";
    if (score >= 50) return "¡Buen esfuerzo!";
    return "¡Sigue practicando!";
  };

  const getStarRating = (score: number) => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    return 1;
  };

  const starRating = getStarRating(results.score);
  const performanceMessage = getPerformanceMessage(results.score);

  const stats = [
    { label: "Total de preguntas", value: results.totalQuestions.toString() },
    { label: "Correctas", value: results.correctAnswers.toString() },
    { label: "Incorrectas", value: results.incorrectAnswers.toString() },
    { label: "Tiempo promedio", value: `${results.averageTime}s` },
  ];

  const achievements: Array<{
    title: string;
    description: string;
    accent: string;
  }> = [];
  if (results.score >= 90) {
    achievements.push({
      title: "¡Maestro del juego!",
      description: "Obtuviste más del 90% de respuestas correctas.",
      accent: "#F59E0B",
    });
  }
  if (results.correctAnswers === results.totalQuestions) {
    achievements.push({
      title: "¡Perfecto!",
      description: "Respondiste todas las preguntas correctamente.",
      accent: "#22C55E",
    });
  }
  if (results.averageTime <= 10) {
    achievements.push({
      title: "¡Rápido como el rayo!",
      description: "Tu tiempo promedio fue menor a 10 segundos.",
      accent: "#3B82F6",
    });
  }
  if (results.score >= 50) {
    achievements.push({
      title: "¡Buen trabajo!",
      description: "Completaste el juego exitosamente.",
      accent: "#8B5CF6",
    });
  }

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: theme.accent }]}>
        <Text style={styles.heroTitle}>¡Juego completado!</Text>
        <Text style={styles.heroSubtitle}>
          {gameName} • {studentName}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.performanceMessage}>{performanceMessage}</Text>
        <Text style={styles.performanceSubtitle}>
          Has obtenido {results.score} puntos
        </Text>
        <View style={styles.starRow}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Text
              key={index}
              style={[
                styles.star,
                index < starRating ? { color: theme.accent } : styles.starEmpty,
              ]}
            >
              ★
            </Text>
          ))}
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${results.score}%`, backgroundColor: theme.accent },
            ]}
          />
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.achievementsCard}>
        <Text style={styles.sectionTitle}>Logros obtenidos</Text>
        {achievements.length === 0 ? (
          <Text style={styles.noAchievementsText}>
            Sigue practicando para desbloquear logros especiales.
          </Text>
        ) : (
          achievements.map((achievement) => (
            <View
              key={achievement.title}
              style={[
                styles.achievementRow,
                {
                  backgroundColor: withAlpha(achievement.accent, 0.12),
                  borderColor: withAlpha(achievement.accent, 0.45),
                },
              ]}
            >
              <View
                style={[
                  styles.achievementBadge,
                  { backgroundColor: achievement.accent },
                ]}
              />
              <View style={styles.achievementTextGroup}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={onPlayAgain}>
          <Text style={styles.primaryButtonText}>Jugar nuevamente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBackToHome}>
          <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  heroCard: {
    borderRadius: 24,
    padding: 28,
    shadowColor: "#00000022",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: palette.primaryOn,
  },
  heroSubtitle: {
    marginTop: 6,
    color: withAlpha(palette.primaryOn, 0.85),
    fontSize: 15,
  },
  summaryCard: {
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
  performanceMessage: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
  },
  performanceSubtitle: {
    fontSize: 15,
    color: palette.muted,
  },
  starRow: {
    flexDirection: "row",
    gap: 8,
  },
  star: {
    fontSize: 22,
  },
  starEmpty: {
    color: withAlpha(palette.muted, 0.4),
  },
  progressBar: {
    height: 12,
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexBasis: "48%",
    minWidth: "48%",
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    flexGrow: 1,
    shadowColor: "#0000000d",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 1,
  },
  statLabel: {
    fontSize: 13,
    color: palette.muted,
  },
  statValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
  },
  achievementsCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  noAchievementsText: {
    color: palette.muted,
    fontSize: 14,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  achievementBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  achievementTextGroup: {
    flex: 1,
    gap: 2,
  },
  achievementTitle: {
    fontWeight: "700",
    color: palette.text,
  },
  achievementDescription: {
    color: palette.muted,
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 14,
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
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.primary,
    alignItems: "center",
    backgroundColor: withAlpha(palette.primary, 0.05),
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: "600",
    fontSize: 16,
  },
});
