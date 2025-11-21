import { useMemo, useState } from "react";
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

interface StudentResult {
  name: string;
  gameId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  averageTime: number;
  completedAt: string;
}

interface RoomReport {
  roomId: string;
  roomName: string;
  gameId: string;
  difficulty: string;
  studentsCount: number;
  averageScore: number;
  completionRate: number;
  createdAt: string;
  students: StudentResult[];
}

const mockReports: RoomReport[] = [
  {
    roomId: "1",
    roomName: "Clase 3°A - Fonología",
    gameId: "image-word",
    difficulty: "easy",
    studentsCount: 8,
    averageScore: 85,
    completionRate: 100,
    createdAt: "2024-01-15T10:30:00Z",
    students: [
      {
        name: "Ana García",
        gameId: "image-word",
        score: 95,
        correctAnswers: 19,
        totalQuestions: 20,
        averageTime: 8.5,
        completedAt: "2024-01-15T10:45:00Z",
      },
      {
        name: "Carlos López",
        gameId: "image-word",
        score: 80,
        correctAnswers: 16,
        totalQuestions: 20,
        averageTime: 12.3,
        completedAt: "2024-01-15T10:47:00Z",
      },
      {
        name: "María Rodríguez",
        gameId: "image-word",
        score: 90,
        correctAnswers: 18,
        totalQuestions: 20,
        averageTime: 9.8,
        completedAt: "2024-01-15T10:46:00Z",
      },
      {
        name: "Diego Martínez",
        gameId: "image-word",
        score: 75,
        correctAnswers: 15,
        totalQuestions: 20,
        averageTime: 15.2,
        completedAt: "2024-01-15T10:48:00Z",
      },
    ],
  },
  {
    roomId: "2",
    roomName: "Clase 2°B - Sílabas",
    gameId: "syllable-count",
    difficulty: "medium",
    studentsCount: 6,
    averageScore: 78,
    completionRate: 83,
    createdAt: "2024-01-14T14:15:00Z",
    students: [
      {
        name: "Sofía Hernández",
        gameId: "syllable-count",
        score: 85,
        correctAnswers: 17,
        totalQuestions: 20,
        averageTime: 11.2,
        completedAt: "2024-01-14T14:30:00Z",
      },
      {
        name: "Mateo Silva",
        gameId: "syllable-count",
        score: 70,
        correctAnswers: 14,
        totalQuestions: 20,
        averageTime: 18.5,
        completedAt: "2024-01-14T14:32:00Z",
      },
    ],
  },
];

const difficultyLabels = {
  easy: "Fácil",
  medium: "Intermedio",
  hard: "Difícil",
};

export default function TeacherReports({
  teacherName,
  onBack,
}: TeacherReportsProps) {
  const [selectedReport, setSelectedReport] = useState<RoomReport | null>(null);

  const overallStats = useMemo(() => {
    const totalRooms = mockReports.length;
    const totalStudents = mockReports.reduce(
      (sum, report) => sum + report.studentsCount,
      0,
    );
    const averageScore = Math.round(
      mockReports.reduce((sum, report) => sum + report.averageScore, 0) /
        (totalRooms || 1),
    );
    const completionRate = Math.round(
      mockReports.reduce((sum, report) => sum + report.completionRate, 0) /
        (totalRooms || 1),
    );

    return { totalRooms, totalStudents, averageScore, completionRate };
  }, []);

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
        {mockReports.map((report) => (
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
        ))}
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
});
