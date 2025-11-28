import { useMemo, useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { gameDefinitions } from "@/features/home/constants/games";
import NunitoButton from "@/features/home/components/NunitoButton";
import { palette, withAlpha } from "@/theme/colors";

interface TeacherReportsProps {
  teacherName: string;
  onBack: () => void;
}

// Interface definitions removed as they are imported or not needed locally if using imported types
// But we need to keep them if they are not exported from useReports or types
// Actually useReports exports RoomReport, but we need to remove local definition to avoid conflict
// or just rely on imports.
// Let's remove local interfaces that collide.

import { useReports, RoomReport } from "@/services/useReports";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator } from "react-native";

// Mock data removed

const difficultyLabels = {
  easy: "Fácil",
  medium: "Intermedio",
  hard: "Difícil",
};

export default function TeacherReports({
  teacherName,
  onBack,
}: TeacherReportsProps) {
  const { user } = useAuth();
  const { getTeacherReports } = useReports();
  const [reports, setReports] = useState<RoomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<RoomReport | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (user?.id) {
        try {
          const data = await getTeacherReports(user.id);
          setReports(data);
        } catch (error) {
          console.error("Failed to fetch reports", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReports();
  }, [user?.id]);

  const overallStats = useMemo(() => {
    const totalRooms = reports.length;
    const totalStudents = reports.reduce(
      (sum, report) => sum + report.studentsCount,
      0,
    );
    const averageScore = Math.round(
      reports.reduce((sum, report) => sum + report.averageScore, 0) /
      (totalRooms || 1),
    );
    const completionRate = Math.round(
      reports.reduce((sum, report) => sum + report.completionRate, 0) /
      (totalRooms || 1),
    );

    return { totalRooms, totalStudents, averageScore, completionRate };
  }, [reports]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resolveGameName = (gameId: string) =>
    gameDefinitions.find((game) => game.id === gameId)?.name ?? "Actividad";

  if (selectedReport) {
    const gameName = resolveGameName(selectedReport.gameId);
    const difficultyLabel =
      difficultyLabels[
      selectedReport.difficulty as keyof typeof difficultyLabels
      ] ?? selectedReport.difficulty;

    return (
      <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{selectedReport.roomName}</Text>
          <Text style={styles.subtitle}>
            {gameName} • {difficultyLabel}
          </Text>
          <Text style={styles.subtitle}>
            Creada el {formatDate(selectedReport.createdAt)}
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Estudiantes</Text>
            <Text style={styles.summaryValue}>
              {selectedReport.studentsCount}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Promedio</Text>
            <Text style={styles.summaryValue}>
              {selectedReport.averageScore}%
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Completado</Text>
            <Text style={styles.summaryValue}>
              {selectedReport.completionRate}%
            </Text>
          </View>
        </View>

        <View style={styles.studentList}>
          <Text style={styles.sectionTitle}>Resultados por estudiante</Text>
          {selectedReport.students.map((student) => (
            <View key={student.name} style={styles.studentRow}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentMeta}>
                  Completado el {formatDate(student.completedAt)}
                </Text>
              </View>
              <View style={styles.studentStats}>
                <Text style={styles.studentScore}>{student.score}%</Text>
                <Text style={styles.studentDetail}>
                  {student.correctAnswers}/{student.totalQuestions}
                </Text>
                <Text style={styles.studentDetail}>{student.averageTime}s</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <NunitoButton
            style={styles.actionButton}
            contentStyle={styles.secondaryButton}
          >
            <TouchableOpacity
              onPress={() => setSelectedReport(null)}
              style={styles.secondaryButtonInner}
            >
              <Text style={styles.secondaryButtonText}>Volver a reportes</Text>
            </TouchableOpacity>
          </NunitoButton>
          <NunitoButton style={styles.actionButton} onPress={onBack}>
            <Text style={styles.primaryButtonText}>Volver al menú</Text>
          </NunitoButton>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Reportes de aprendizaje</Text>
        <Text style={styles.subtitle}>
          Resumen de las sesiones recientes de {teacherName}.
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Salas analizadas</Text>
          <Text style={styles.summaryValue}>{overallStats.totalRooms}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Estudiantes</Text>
          <Text style={styles.summaryValue}>{overallStats.totalStudents}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Promedio general</Text>
          <Text style={styles.summaryValue}>{overallStats.averageScore}%</Text>
        </View>
      </View>

      <View style={styles.reportList}>
        {loading ? (
          <ActivityIndicator size="large" color={palette.primary} />
        ) : reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay reportes disponibles.</Text>
          </View>
        ) : (
          reports.map((report) => (
            <TouchableOpacity
              key={report.roomId}
              style={styles.reportCard}
              onPress={() => setSelectedReport(report)}
            >
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{report.roomName}</Text>
                <Text style={styles.reportDate}>
                  {formatDate(report.createdAt)}
                </Text>
              </View>
              <Text style={styles.reportSubtitle}>
                {resolveGameName(report.gameId)} •{" "}
                {difficultyLabels[
                  report.difficulty as keyof typeof difficultyLabels
                ] ?? report.difficulty}
              </Text>
              <View style={styles.reportStatsRow}>
                <View style={styles.statChip}>
                  <Text style={styles.statLabel}>Participantes</Text>
                  <Text style={styles.statValue}>{report.studentsCount}</Text>
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statLabel}>Promedio</Text>
                  <Text style={styles.statValue}>{report.averageScore}%</Text>
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statLabel}>Completado</Text>
                  <Text style={styles.statValue}>{report.completionRate}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Volver al menú</Text>
      </TouchableOpacity>
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
  header: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: palette.text,
  },
  subtitle: {
    fontSize: 15,
    color: palette.muted,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    flexBasis: "31%",
    minWidth: "31%",
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    flexGrow: 1,
    shadowColor: "#0000000f",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
  },
  summaryLabel: {
    color: palette.muted,
    fontSize: 13,
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
  },
  reportList: {
    gap: 16,
  },
  reportCard: {
    backgroundColor: palette.surface,
    borderRadius: 20,
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
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
    flex: 1,
  },
  reportDate: {
    fontSize: 12,
    color: palette.muted,
    marginLeft: 12,
  },
  reportSubtitle: {
    fontSize: 14,
    color: palette.muted,
  },
  reportStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statChip: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: withAlpha(palette.border, 0.8),
  },
  statLabel: {
    fontSize: 13,
    color: palette.muted,
  },
  statValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
  },
  studentList: {
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
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(palette.border, 0.6),
  },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontWeight: "600",
    color: palette.text,
  },
  studentMeta: {
    fontSize: 12,
    color: palette.muted,
  },
  studentStats: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  studentScore: {
    fontWeight: "700",
    color: palette.primary,
  },
  studentDetail: {
    fontSize: 13,
    color: palette.muted,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  primaryButton: {
  },
  primaryButtonText: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.primary,
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
  backButton: {
    alignSelf: "center",
  },
  backText: {
    color: palette.primary,
    fontWeight: "600",
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
  },
  emptyStateText: {
    color: palette.muted,
    fontSize: 16,
  },
});
