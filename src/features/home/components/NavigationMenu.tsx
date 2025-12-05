import { useMemo, useState, useEffect } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';


import {
  gameDefinitions,
  gameThemeTokens,
} from "@/features/home/constants/games";
import NunitoButton from "@/features/home/components/NunitoButton";
import TeacherSidebar, {
  type TeacherSectionId,
} from "@/features/home/components/teacher/TeacherSidebar";
import RoomSummaryCard from "@/features/home/components/teacher/RoomSummaryCard";
import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";
import CourseManager from "@/features/home/components/teacher/CourseManager";
import TestSuiteManager from "@/features/home/components/teacher/TestSuiteManager";
import { TestSuite } from "@/models/testSuites";
import GameQuestionEditor from "@/features/home/components/teacher/GameQuestionEditor";
import { useAuth } from "@/contexts/AuthContext";
import StudentWaitingRoom from "./student/StudentWaitingRoom";
import StudentGameStart from "./student/StudentGameStart";
import RoomCreationFlow from "@/features/home/components/teacher/RoomCreationFlow";
import ProgressBar from "@/features/home/components/teacher/ProgressBar";
import { palette, withAlpha } from "@/theme/colors";
import TeacherDashboard from "@/features/home/components/TeacherDashboard";
import MyRooms from "@/features/home/components/MyRooms";
import { RoomSummaryItem, StudentResult, DifficultyOption, Room } from "@/features/home/types";
import { useReports } from "@/services/useReports";

import ConnectedUsersList from "@/features/home/components/ConnectedUsersList";
import TeacherWaitingRoom from "@/features/home/components/teacher/TeacherWaitingRoom";
import TeacherLiveSession from "@/features/home/components/teacher/TeacherLiveSession";
import { useDashboard } from "@/services/useDashboard";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { useRoomMonitoring } from "@/hooks/useRoomMonitoring";
import { updateRoomStatus } from "@/services/useRooms";

interface NavigationMenuProps {
  userType: "teacher" | "student";
  userName: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

type MenuItem = {
  id: string;
  label: string;
  description: string;
};

const teacherMenuItems: MenuItem[] = [
  { id: "home", label: "Inicio", description: "Panel principal" },
  { id: "rooms", label: "Mis Salas", description: "Gestiona salas activas" },
  {
    id: "reports",
    label: "Reportes",
    description: "Resultados y estadísticas",
  },
  {
    id: "questions",
    label: "Gestionar Preguntas",
    description: "Editar preguntas de juegos",
  },
  { id: "settings", label: "Configuración", description: "Ajustes de cuenta" },
];

const studentMenuItems: MenuItem[] = [
  { id: "home", label: "Inicio", description: "Información de la sala" },
  { id: "games", label: "Juegos", description: "Ver actividades disponibles" },
];

type TeacherConfigSettings = {
  availableGames: Record<string, boolean>;
  defaultDifficulty: DifficultyOption;
  questionTime: number;
  feedback: Record<string, boolean>;
};

const GAME_OPTIONS = [
  {
    id: "image-word",
    title: "Asociación Imagen-Palabra",
    description: "Relaciona imágenes con palabras",
  },
  {
    id: "syllable-count",
    title: "Conteo de Sílabas",
    description: "Cuenta las sílabas de cada palabra",
  },
  {
    id: "rhyme-identification",
    title: "Identificación de Rimas",
    description: "Encuentra palabras que riman",
  },
  {
    id: "audio-recognition",
    title: "Reconocimiento Auditivo",
    description: "Escucha y selecciona la palabra",
  },
] as const;

const DIFFICULTY_OPTIONS: Array<{
  id: DifficultyOption;
  title: string;
  description: string;
  textStyle?: "easyText" | "mediumText" | "hardText";
}> = [
    {
      id: "easy",
      title: "Fácil",
      description: "3 opciones, palabras simples",
      textStyle: "easyText",
    },
    {
      id: "medium",
      title: "Medio",
      description: "4 opciones, palabras variadas",
      textStyle: "mediumText",
    },
    {
      id: "hard",
      title: "Difícil",
      description: "5 opciones, palabras complejas",
      textStyle: "hardText",
    },
  ];

const TIME_OPTIONS = [
  { value: 30, title: "30 segundos", description: "Más tiempo para pensar" },
  { value: 45, title: "45 segundos", description: "Tiempo moderado" },
  { value: 60, title: "60 segundos", description: "Ritmo relajado" },
] as const;

const FEEDBACK_OPTIONS = [
  {
    id: "sounds",
    title: "Sonidos de feedback",
    description: "Reproducir sonidos para respuestas correctas/incorrectas",
  },
  {
    id: "animations",
    title: "Animaciones visuales",
    description: "Mostrar efectos visuales y celebraciones",
  },
  {
    id: "hints",
    title: "Habilitar pistas",
    description: "Permitir que estudiantes pidan pistas",
  },
] as const;

const createDefaultSettings = (): TeacherConfigSettings => ({
  availableGames: GAME_OPTIONS.reduce<Record<string, boolean>>((acc, option) => {
    acc[option.id] = true;
    return acc;
  }, {}),
  defaultDifficulty: "easy",
  questionTime: TIME_OPTIONS[0].value,
  feedback: FEEDBACK_OPTIONS.reduce<Record<string, boolean>>((acc, option) => {
    acc[option.id] = true;
    return acc;
  }, {}),
});

export default function NavigationMenu({
  userType,
  userName,
  onNavigate,
  onLogout,
}: NavigationMenuProps) {
  const { user, logout } = useAuth();

  const menuItems = useMemo(
    () => (userType === "teacher" ? teacherMenuItems : studentMenuItems),
    [userType],
  );
  const [activeSection, setActiveSection] = useState(
    menuItems[0]?.id ?? "home",
  );
  const [savedSettings, setSavedSettings] = useState<TeacherConfigSettings>(
    () => createDefaultSettings(),
  );
  const [settings, setSettings] = useState<TeacherConfigSettings>(
    () => createDefaultSettings(),
  );
  const [selectedRoom, setSelectedRoom] = useState<RoomSummaryItem | null>(null);

  // Question management state
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(undefined);
  const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | undefined>(undefined);
  const [selectedGameEditor, setSelectedGameEditor] = useState<string | undefined>(undefined);

  // Session state
  const [sessionStatus, setSessionStatus] = useState<"idle" | "waiting" | "live">("idle");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  // Removed local connectedUsers state as we use the socket now
  const [activeSessionRoomId, setActiveSessionRoomId] = useState<string | null>(null);

  // Room creation state
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
  };

  // Dashboard hook
  const { activeRooms, pendingRooms, pastRooms, fetchRooms } = useDashboard();
  const { getRoomFullResults } = useReports();

  // WebSocket Integration
  // Determine which room to connect to: active session room OR selected room details (if active/pending)
  const socketRoomId = useMemo(() => {
    if (activeSessionRoomId) return activeSessionRoomId;
    if (selectedRoom && (selectedRoom.status === 'active' || selectedRoom.status === 'pending')) {
      return selectedRoom.id;
    }
    return null;
  }, [activeSessionRoomId, selectedRoom]);

  const { users: liveConnectedUsers, answers: liveAnswers, roomStatus, status: connectionStatus, startActivity, stompClient } = useRoomSocket({
    roomId: socketRoomId || "",
    userId: user?.id || "teacher-temp-id",
    userName: user?.name || userName || "Profesor",
    isTeacher: userType === "teacher",
    enabled: !!socketRoomId,
  });

  const { students: monitoredStudents, globalStats, ranking } = useRoomMonitoring({
    roomId: socketRoomId || "",
    stompClient
  });

  const liveMonitoring = useMemo(() => {
    if (!socketRoomId) return null;
    const totalAnsweredAll = liveAnswers.length;
    const totalCorrectAll = liveAnswers.filter(a => a.isCorrect ?? a.correct).length;
    const globalAccuracyPct = totalAnsweredAll > 0 ? Math.round((totalCorrectAll / totalAnsweredAll) * 100) : 0;

    const studentsMap = new Map<string, any>();
    liveAnswers.forEach(ans => {
      const entry = studentsMap.get(ans.studentId) || {
        studentId: ans.studentId,
        studentName: ans.studentName || ans.studentId,
        answers: 0,
        correctAnswers: 0,
        totalQuestions: 0,
      };
      entry.answers += 1;
      entry.totalQuestions += 1;
      entry.correctAnswers += (ans.isCorrect ?? ans.correct) ? 1 : 0;
      studentsMap.set(ans.studentId, entry);
    });

    const liveStudents = Array.from(studentsMap.values());

    return {
      students: liveStudents,
      globalStats: {
        activeStudentsCount: liveStudents.length,
        totalAnsweredAll,
        totalCorrectAll,
        globalAccuracyPct,
      },
    };
  }, [liveAnswers, socketRoomId]);

  // Re-destructure useRoomSocket to get stompClient
  // I'll do this in the next chunk or fix the previous one.
  // Actually, I can't easily change the previous chunk's destructuring without replacing the whole block.
  // I will replace the useRoomSocket call block.

  // Effect to handle room status changes
  useEffect(() => {
    if (roomStatus === 'STARTED') {
      setSessionStatus('live');
    }
  }, [roomStatus]);

  const connectedUserNames = useMemo(() => {
    return liveConnectedUsers
      .filter(u => u.userId !== user?.id)
      .map(u => u.name);
  }, [liveConnectedUsers, user?.id]);

  // Fetch rooms when entering "rooms" section or on mount if needed
  // For now, let's fetch when user is teacher
  useEffect(() => {
    if (userType === "teacher" && user?.id) {
      fetchRooms(user.id);
    }
  }, [userType, user?.id, fetchRooms]);

  const hasChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  );

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    onNavigate(sectionId);
    setSelectedRoom(null);
  };

  const handleToggleGame = (gameId: string) => {
    setSettings((prev) => ({
      ...prev,
      availableGames: {
        ...prev.availableGames,
        [gameId]: !prev.availableGames[gameId],
      },
    }));
  };

  const handleSelectDifficulty = (difficulty: DifficultyOption) => {
    setSettings((prev) => ({
      ...prev,
      defaultDifficulty: difficulty,
    }));
  };

  const handleSelectTime = (seconds: number) => {
    setSettings((prev) => ({
      ...prev,
      questionTime: seconds,
    }));
  };

  const handleToggleFeedback = (feedbackId: string) => {
    setSettings((prev) => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        [feedbackId]: !prev.feedback[feedbackId],
      },
    }));
  };

  const handleResetDefaults = () => {
    const defaults = createDefaultSettings();
    setSettings(defaults);
  };

  const handleSaveSettings = () => {
    setSavedSettings(settings);
  };

  const handleRoomDetails = (room: RoomSummaryItem) => {
    setSelectedRoom(room);
  };

  // Load full students results (with answers) when a room is selected
  useEffect(() => {
    let cancelled = false;
    const loadFullResults = async () => {
      if (!selectedRoom?.id) return;
      const results = await getRoomFullResults(selectedRoom.id);
      if (cancelled) return;
      if (results && results.length > 0) {
        setSelectedRoom((prev) => {
          if (!prev || prev.id !== selectedRoom.id) return prev;
          return {
            ...prev,
            studentsResults: results,
            students: results.length,
            studentsCount: results.length,
          };
        });
      }
    };
    void loadFullResults();
    return () => { cancelled = true; };
  }, [selectedRoom?.id, getRoomFullResults]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatSeconds = (seconds: number) => `${seconds.toFixed(1)}s`;

  const handleStartActivity = (roomId: string) => {
    // Check active rooms first - if found, go straight to live session
    const activeRoom = activeRooms.find((r) => r.id === roomId);
    if (activeRoom) {
      setActiveSessionRoomId(roomId);
      setSessionStatus("live");
      return;
    }

    // Check pending rooms - if found, go to waiting room
    const pendingRoom = pendingRooms.find((r) => r.id === roomId);
    if (pendingRoom) {
      setActiveSessionRoomId(roomId);
      setSessionStatus("waiting");
      return;
    }
  };

  const handleLaunchGame = async () => {
    // In a real app, this would trigger the countdown and then start the game
    if (activeSessionRoomId) {
      // Notify backend that room is active
      await updateRoomStatus(activeSessionRoomId, 'active', true);
      // Start via socket
      startActivity();
    }
    setSessionStatus("live");
  };

  const handleEndActivity = async () => {
    if (activeSessionRoomId) {
      // Notify backend that room is finished
      await updateRoomStatus(activeSessionRoomId, 'finished', false);
    }
    setSessionStatus("idle");
    setActiveSessionRoomId(null);
    // Optionally navigate to reports or show a summary
    setActiveSection("reports");
    // Refresh rooms list
    if (user?.id) fetchRooms(user.id);
  };

  const renderRoomDetailView = (backTarget: "rooms" | "reports") => {
    if (!selectedRoom) return null;
    console.log("Detalles de la sala seleccionada:", JSON.stringify(selectedRoom, null, 2));
    const difficultyLabel =
      selectedRoom.difficulty === "easy"
        ? "Fácil"
        : selectedRoom.difficulty === "medium"
          ? "Intermedio"
          : "Difícil";
    const gameName =
      gameDefinitions.find((g) => g.id === selectedRoom.gameId)?.name ??
      selectedRoom.gameLabel;
    const isLiveRoom = socketRoomId === selectedRoom.id && !!liveAnswers;
    const liveRoomAnswers = isLiveRoom ? liveAnswers : [];

    const liveStats = (() => {
      const total = liveRoomAnswers.length;
      const correct = liveRoomAnswers.filter(a => a.isCorrect ?? a.correct).length;
      const globalAccuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;

      const byStudent = new Map<string, any>();
      liveRoomAnswers.forEach(ans => {
        const entry = byStudent.get(ans.studentId) || {
          name: ans.studentName || ans.studentId,
          score: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          averageTime: 0,
          completedAt: ans.answeredAt || ans.sentAt || new Date().toISOString(),
          answers: [] as any[],
        };
        entry.totalQuestions += 1;
        entry.correctAnswers += (ans.isCorrect ?? ans.correct) ? 1 : 0;
        entry.averageTime += ans.elapsedMs ? ans.elapsedMs : 0;
        entry.answers.push({
          id: ans.id || `${ans.studentId}-${ans.questionId}-${entry.answers.length}`,
          roomId: ans.roomId || selectedRoom.id,
          studentId: ans.studentId,
          gameId: (ans as any).gameId,
          questionId: ans.questionId?.toString?.() ?? "",
          questionText: ans.questionText ?? null,
          answer: ans.selectedOptionText || ans.selectedOptionId || ans.answer || "",
          isCorrect: ans.isCorrect ?? ans.correct,
          elapsedMs: ans.elapsedMs,
          attempt: ans.attempt,
          createdAt: ans.createdAt,
          sentAt: (ans as any).sentAt,
        });
        byStudent.set(ans.studentId, entry);
      });

      const liveStudents = Array.from(byStudent.values()).map((s) => ({
        ...s,
        averageTime: s.totalQuestions > 0 ? Math.round(s.averageTime / s.totalQuestions / 1000) : 0,
        score: s.totalQuestions > 0 ? Math.round((s.correctAnswers / s.totalQuestions) * 100) : 0,
      }));

      return { liveStudents, globalAccuracyPct };
    })();

    return (
      <TeacherSectionCard
        title="Detalle de sala"
        subtitle={selectedRoom.title}
      >
        <View className="mb-1.5 flex-row justify-start">
          <NunitoButton
            style={{ backgroundColor: "transparent", padding: 0 }}
            contentStyle={[
              {
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.border,
                shadowOpacity: 0,
                elevation: 0,
              }
            ]}
            onPress={() => setSelectedRoom(null)}
          >
            <Text className="text-sm font-semibold text-text">
              Volver a {backTarget === "rooms" ? "Mis salas" : "Reportes"}
            </Text>
          </NunitoButton>
        </View>

        <View className="mt-3.5 p-4 rounded-2xl border border-border/80 bg-surface shadow-sm gap-3">
          <View className="flex-row justify-between items-center gap-3">
            <View>
              <Text className="text-lg font-extrabold text-text">{selectedRoom.title}</Text>
              <Text className="text-sm text-muted">
                {difficultyLabel} • {formatDate(selectedRoom.createdAt)}
              </Text>
            </View>
            <View className="px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/50">
              <Text className="text-xs font-bold text-primary">
                {selectedRoom.status === "active" ? "Activa" : selectedRoom.status === "pending" ? "Pendiente" : "Finalizada"}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2.5">
            {selectedRoom.code && (
              <View className="w-full p-3 rounded-xl border border-border/70 bg-surfaceMuted flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-muted mb-1">Código de sala</Text>
                  <Text className="text-2xl font-mono font-bold text-primary tracking-widest">
                    {selectedRoom.code}
                  </Text>
                </View>
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 active:bg-primary/20"
                  onPress={() => handleCopyCode(selectedRoom.code!)}
                >
                  <Text className="text-sm font-bold text-primary">
                    {copied ? "¡Copiado!" : "Copiar"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <View className="flex-1 min-w-[150px] p-3 rounded-xl border border-border/70 bg-surfaceMuted">
              <Text className="text-xs text-muted mb-1">Estudiantes</Text>
              <Text className="text-lg font-bold text-text">
                {selectedRoom.students}
              </Text>
            </View>
            <View className="flex-1 min-w-[150px] p-3 rounded-xl border border-border/70 bg-surfaceMuted">
              <Text className="text-xs text-muted mb-1">Promedio</Text>
              <Text className="text-lg font-bold text-text">
                {selectedRoom.average}%
              </Text>
            </View>
            <View className="flex-1 min-w-[150px] p-3 rounded-xl border border-border/70 bg-surfaceMuted">
              <Text className="text-xs text-muted mb-1">Completado</Text>
              <Text className="text-lg font-bold text-text">
                {selectedRoom.completion}%
              </Text>
            </View>
            <View className="flex-1 min-w-[150px] p-3 rounded-xl border border-border/70 bg-surfaceMuted">
              <Text className="text-xs text-muted mb-1">Fecha</Text>
              <Text className="text-lg font-bold text-text">
                {formatDate(selectedRoom.createdAt)}
              </Text>
            </View>
            <View className="w-full p-3 rounded-xl border border-border/70 bg-surfaceMuted">
              <Text className="text-xs text-muted mb-1">Juegos seleccionados</Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedRoom.gameLabels?.map((label, index) => (
                  <View key={index} className="bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                    <Text className="text-sm font-bold text-text">{label}</Text>
                  </View>
                )) || <Text className="text-lg font-bold text-text">{gameName}</Text>}
              </View>
            </View>
          </View>

          <View className="gap-2.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-text">Resultados por estudiante</Text>
              {isLiveRoom && (
                <Text className="text-sm font-semibold text-primary">
                  Precisión global: {liveStats.globalAccuracyPct}%
                </Text>
              )}
            </View>
            {(isLiveRoom ? liveStats.liveStudents : (selectedRoom.studentsResults || [])).map((student) => (
              <View key={student.name} className="border border-border/80 rounded-xl p-3 gap-2.5 bg-surface shadow-sm">
                <View className="flex-row justify-between items-center">
                  <Text className="text-[15px] font-bold text-text">{student.name}</Text>
                  <View className="px-2.5 py-1.5 rounded-full bg-primary/12 border border-primary/60">
                    <Text className="font-bold text-primary">{student.score}%</Text>
                  </View>
                </View>
                <View className="flex-row flex-wrap gap-3">
                  <View className="flex-1 min-w-[140px] gap-1">
                    <Text className="text-xs text-muted">Correctas</Text>
                    <Text className="text-sm font-bold text-text">
                      {student.correctAnswers}/{student.totalQuestions}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[140px] gap-1">
                    <Text className="text-xs text-muted">Tiempo prom.</Text>
                    <Text className="text-sm font-bold text-text">
                      {formatSeconds(student.averageTime)}
                    </Text>
                  </View>
                  {!isLiveRoom && (
                    <View className="flex-1 min-w-[140px] gap-1">
                      <Text className="text-xs text-muted">Completado</Text>
                      <Text className="text-sm font-bold text-text">
                        {formatDate(student.completedAt)}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1 min-w-[140px] gap-1">
                    <Text className="text-xs text-muted">Progreso</Text>
                    <View className="h-1.5 rounded-full bg-primary/18 overflow-hidden">
                      <View
                        className="h-full bg-primary"
                        style={{ width: `${student.score}%` }}
                      />
                    </View>
                  </View>
                </View>
                {student.answers && student.answers.length > 0 && (
                  <View className="mt-2 gap-1.5">
                    <Text className="text-xs text-muted font-semibold">Respuestas</Text>
                    {student.answers.map((ans) => (
                      <View key={ans.id || `${ans.questionId}-${ans.sentAt}`} className="p-2 rounded-lg border border-border/60 bg-surfaceMuted">
                        <Text className="text-xs text-muted">
                          Pregunta {ans.questionId}{ans.questionText ? `: ${ans.questionText}` : ""}
                        </Text>
                        <Text className="text-sm font-semibold text-text">
                          Respuesta: {ans.answer}
                        </Text>
                        <View className="flex-row justify-between mt-1">
                          <Text className="text-xs text-muted">
                            Correcta: {ans.isCorrect ? "Sí" : "No"}
                          </Text>
                          <Text className="text-xs text-muted">
                            Tiempo: {ans.elapsedMs ? `${Math.round(ans.elapsedMs / 1000)}s` : "-"}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {(selectedRoom.status === "active" || selectedRoom.status === "pending") && (
            <View className="mt-4">
              <ConnectedUsersList
                connectedUsers={connectedUserNames}
                connectingUsers={[]}
              />
              <View className="mt-4">
                <TouchableOpacity
                  className="h-12 rounded-xl bg-primary items-center justify-center shadow-md active:opacity-90"
                  onPress={() => handleStartActivity(selectedRoom.id)}
                >
                  <Text className="text-base font-bold text-primaryOn">
                    {selectedRoom.status === "active" ? "Ver estado" : "Iniciar Actividad"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TeacherSectionCard>
    );
  };

  const renderTeacherSection = () => {
    // Handle active session views
    if (sessionStatus === "waiting" && activeSessionRoomId) {
      const room = activeRooms.find((r) => r.id === activeSessionRoomId) || pendingRooms.find((r) => r.id === activeSessionRoomId);
      if (room) {
        return (
          <TeacherWaitingRoom
            roomCode={room.code || "----"}
            gameName={room.gameLabel}
            selectedGames={[room.gameLabel]}
            connectedUsers={connectedUserNames}
            connectingUsers={[]}
            onStartActivity={handleLaunchGame}
            connectionStatus={connectionStatus}
            onCancel={() => {
              setSessionStatus("idle");
              setActiveSessionRoomId(null);
            }}
            status={room.status}
          />
        );
      }
    }

    if (sessionStatus === "live" && activeSessionRoomId) {
      const room = activeRooms.find((r) => r.id === activeSessionRoomId) || pendingRooms.find((r) => r.id === activeSessionRoomId);
      if (room) {
        return (
          <TeacherLiveSession
            roomCode={room.code || "----"}
            gameName={room.gameLabel}
            connectedCount={connectedUserNames.length}
            connectedUsers={connectedUserNames}
            monitoringData={{
              roomId: room.id,
              timestamp: new Date().toISOString(),
              students: liveMonitoring?.students || monitoredStudents,
              globalStats: liveMonitoring?.globalStats || globalStats || {
                activeStudentsCount: 0,
                totalAnsweredAll: 0,
                totalCorrectAll: 0,
                globalAccuracyPct: 0,
              },
              ranking: ranking
            }}
            onEndActivity={handleEndActivity}
          />
        );
      }
    }

    switch (activeSection) {
      case "home":
        return (
          <TeacherDashboard
            onNavigateToRoom={(room) => {
              setSelectedRoom(room);
              setActiveSection("rooms");
            }}
            onCreateRoom={() => setIsCreatingRoom(true)}
            onNavigateToReports={() => setActiveSection("reports")}
            onNavigateToRooms={() => setActiveSection("rooms")}
          />
        );
      case "rooms":
        if (selectedRoom) {
          return renderRoomDetailView("rooms");
        }

        // Show room creation flow
        if (isCreatingRoom) {
          return (
            <RoomCreationFlow
              teacherName={userName || "Profesor Demo"}
              teacherEmail="profesor@example.com"
              onRoomCreated={(newRoom: Room) => {
                console.log("Nueva sala creada:", newRoom);
                setIsCreatingRoom(false);
                // Add new room to pendingRooms so it appears immediately
                if (typeof pendingRooms !== "undefined") {
                  // Transform Room to RoomSummaryItem for immediate display
                  const now = new Date();
                  const summary: RoomSummaryItem = {
                    id: newRoom.id,
                    title: newRoom.name,
                    gameLabel: newRoom.game ? (gameDefinitions.find(def => def.id === newRoom.game)?.name || newRoom.game) : "Sin juegos",
                    gameId: (newRoom.game as any) || "image-word",
                    difficulty: newRoom.difficulty,
                    createdAt: now.toISOString(),
                    dateTime: now.toLocaleString(),
                    students: newRoom.students.length,
                    average: 0,
                    completion: 0,
                    status: "pending",
                    studentsResults: [],
                    code: newRoom.code,
                    gameLabels: (newRoom as any).games
                      ? (newRoom as any).games.map((gId: string) => gameDefinitions.find(def => def.id === gId)?.name || gId)
                      : newRoom.game
                        ? [gameDefinitions.find(def => def.id === newRoom.game)?.name || newRoom.game]
                        : ["Sin juegos"],
                  };
                  pendingRooms.push(summary);
                }
              }}
              onCancel={() => setIsCreatingRoom(false)}
              onNavigateToQuestions={() => {
                setIsCreatingRoom(false);
                setActiveSection("questions");
              }}
            />
          );
        }

        // Show room list
        return (
          <MyRooms
            activeRooms={activeRooms}
            pendingRooms={pendingRooms}
            pastRooms={pastRooms}
            onNavigateToRoom={setSelectedRoom}
            onCreateRoom={() => setIsCreatingRoom(true)}
            onStartActivity={handleStartActivity}
          />
        );
      case "reports":
        if (selectedRoom) {
          return renderRoomDetailView("reports");
        }
        return (
          <TeacherSectionCard
            title="Reportes y estadísticas"
            subtitle={`Profesor: ${userName || "Profesor Demo"}`}
          >
            <View className="flex-row gap-3 mt-2 mb-3">
              <View className="px-3.5 py-1.5 rounded-xl bg-surfaceMuted border border-border/90">
                <Text className="text-sm font-medium text-text">Todos los juegos</Text>
              </View>
              <View className="px-3.5 py-1.5 rounded-xl bg-surfaceMuted border border-border/90">
                <Text className="text-sm font-medium text-text">Última semana</Text>
              </View>
              <View className="px-3.5 py-1.5 rounded-xl bg-surfaceMuted border border-border/90">
                <Text className="text-sm font-medium text-text">Exportar todo</Text>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-4">
              {[...activeRooms, ...pastRooms].map((room) => (
                <RoomSummaryCard
                  key={`${room.id}-reports`}
                  title={room.title}
                  gameLabel={room.gameLabel}
                  dateTime={room.dateTime}
                  students={room.students}
                  average={room.average}
                  completion={room.completion}
                  onPressDetails={() => handleRoomDetails(room)}
                />
              ))}
            </View>
          </TeacherSectionCard>
        );
      case "questions":
        // Determine current step
        const currentStep = !selectedCourse
          ? 1
          : !selectedTestSuite
            ? 2
            : !selectedGameEditor
              ? 3
              : 4;

        return (
          <View className="gap-4">
            <ProgressBar currentStep={currentStep as 1 | 2 | 3 | 4} />
            {!selectedCourse ? (
              <CourseManager onSelectCourse={setSelectedCourse} />
            ) : !selectedTestSuite ? (
              <TeacherSectionCard
                title="Conjuntos de Preguntas"
                subtitle="Selecciona un conjunto para editar"
              >
                <Pressable
                  className="flex-row items-center gap-2 mb-4 active:opacity-70"
                  onPress={() => {
                    setSelectedCourse(undefined);
                    setSelectedTestSuite(undefined);
                    setSelectedGameEditor(undefined);
                  }}
                >
                  <Feather name="arrow-left" size={20} color={palette.primary} />
                  <Text className="text-base font-semibold text-primary">
                    Volver a Cursos
                  </Text>
                </Pressable>
                <TestSuiteManager
                  courseId={selectedCourse}
                  onSelectTestSuite={setSelectedTestSuite}
                />
              </TeacherSectionCard>
            ) : !selectedGameEditor ? (
              <TeacherSectionCard
                title="Seleccionar Juego"
                subtitle="Elige un juego para editar sus preguntas"
              >
                <Pressable
                  className="flex-row items-center gap-2 mb-4 active:opacity-70"
                  onPress={() => {
                    setSelectedTestSuite(undefined);
                    setSelectedGameEditor(undefined);
                  }}
                >
                  <Feather name="arrow-left" size={20} color={palette.primary} />
                  <Text className="text-base font-semibold text-primary">
                    Volver a Conjuntos
                  </Text>
                </Pressable>
                <View className="gap-3">
                  <Text className="text-lg font-bold text-text">
                    {selectedTestSuite.name}
                  </Text>
                  <Text className="text-sm text-muted mb-2">
                    Selecciona un juego para gestionar sus preguntas
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {(selectedTestSuite.games || []).map((gameId) => {
                      const game = [
                        { id: "image-word", title: "Asociación Imagen-Palabra" },
                        { id: "syllable-count", title: "Conteo de Sílabas" },
                        { id: "rhyme-identification", title: "Identificación de Rimas" },
                        { id: "audio-recognition", title: "Reconocimiento Auditivo" },
                      ].find((g) => g.id === gameId);
                      return (
                        <Pressable
                          key={gameId}
                          className="flex-1 min-w-[45%] p-4 rounded-xl border-2 border-primary bg-primary/5 active:scale-95"
                          onPress={() => setSelectedGameEditor(gameId)}
                        >
                          <Text className="text-base font-semibold text-primary text-center">
                            {game?.title}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </TeacherSectionCard>
            ) : (
              <TeacherSectionCard
                title="Editor de Preguntas"
                subtitle={`Gestiona las preguntas del juego`}
              >
                <Pressable
                  className="flex-row items-center gap-2 mb-4 active:opacity-70"
                  onPress={() => setSelectedGameEditor(undefined)}
                >
                  <Feather name="arrow-left" size={20} color={palette.primary} />
                  <Text className="text-base font-semibold text-primary">
                    Volver a Juegos
                  </Text>
                </Pressable>
                <GameQuestionEditor
                  testSuiteId={selectedTestSuite.id}
                  gameType={selectedGameEditor as any}
                  gameTitle={
                    {
                      "image-word": "Asociación Imagen-Palabra",
                      "syllable-count": "Conteo de Sílabas",
                      "rhyme-identification": "Identificación de Rimas",
                      "audio-recognition": "Reconocimiento Auditivo",
                    }[selectedGameEditor] || ""
                  }
                />
              </TeacherSectionCard>
            )}
          </View>
        );
      case "settings":
      default:
        return (
          <TeacherSectionCard title="Configuración">
            <View className="gap-3">
              <View className="flex-row justify-between py-2 border-b border-border/70">
                <Text className="text-sm font-semibold text-muted">Nombre</Text>
                <Text className="text-base font-semibold text-text">{userName}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-border/70">
                <Text className="text-sm font-semibold text-muted">Correo</Text>
                <Text className="text-base font-semibold text-text">{user?.email || "N/A"}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-border/70">
                <Text className="text-sm font-semibold text-muted">Tipo de usuario</Text>
                <Text className="text-base font-semibold text-text">Profesor</Text>
              </View>
            </View>

            <View className="mt-5 p-5 rounded-2xl border border-border/80 bg-surface shadow-sm">
              <Text className="text-lg font-bold text-text mb-1">Configuración de juegos</Text>
              <Text className="text-sm text-muted mb-5">
                Personaliza los juegos educativos para tus salas
              </Text>

              <View className="mb-6">
                <Text className="text-base font-semibold text-text mb-1">Juegos disponibles</Text>
                <Text className="text-sm text-muted mb-3">
                  Selecciona qué juegos deseas usar en tus salas
                </Text>

                <View className="gap-2">
                  {GAME_OPTIONS.map((option) => {
                    const isChecked = settings.availableGames[option.id];
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => handleToggleGame(option.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isChecked }}
                        className={`flex-row items-center p-3 rounded-xl border transition-all ${isChecked ? "bg-primary/5 border-primary" : "bg-surface border-border/60"} hover:bg-surfaceMuted active:bg-surfaceMuted`}
                      >
                        <View
                          className={`w-5 h-5 rounded border mr-3 items-center justify-center ${isChecked ? "bg-primary border-primary" : "bg-surface border-muted"}`}
                        >
                          {isChecked ? <View className="w-2.5 h-2.5 bg-white rounded-sm" /> : null}
                        </View>
                        <View className="flex-1 gap-0.5">
                          <Text className="text-base font-semibold text-text">
                            {option.title}
                          </Text>
                          <Text className="text-sm text-muted">
                            {option.description}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="mb-6 pt-5 border-t border-border/60">
                <Text className="text-base font-semibold text-text mb-1">
                  Nivel de dificultad predeterminado
                </Text>
                <Text className="text-sm text-muted mb-3">
                  Elige el nivel de dificultad para nuevas salas
                </Text>

                <View className="gap-2">
                  {DIFFICULTY_OPTIONS.map((option) => {
                    const isSelected = settings.defaultDifficulty === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => handleSelectDifficulty(option.id)}
                        className={`flex-row items-center p-3 rounded-xl border transition-all ${isSelected ? "bg-primary/5 border-primary" : "bg-surface border-border/60"} hover:bg-surfaceMuted active:bg-surfaceMuted`}
                      >
                        <View
                          className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${isSelected ? "border-primary" : "border-muted"}`}
                        >
                          {isSelected ? <View className="w-2.5 h-2.5 bg-primary rounded-full" /> : null}
                        </View>
                        <View className="flex-1 gap-0.5">
                          <Text
                            className={`text-base font-semibold ${option.textStyle === "easyText" ? "text-green-600" : option.textStyle === "mediumText" ? "text-blue-600" : option.textStyle === "hardText" ? "text-red-600" : "text-text"}`}
                          >
                            {option.title}
                          </Text>
                          <Text className="text-sm text-muted">
                            {option.description}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="mb-6 pt-5 border-t border-border/60">
                <Text className="text-base font-semibold text-text mb-1">Tiempo por pregunta</Text>
                <Text className="text-sm text-muted mb-3">
                  Define el tiempo límite en segundos
                </Text>

                <View className="gap-2">
                  {TIME_OPTIONS.map((option) => {
                    const isSelected = settings.questionTime === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => handleSelectTime(option.value)}
                        className={`flex-row items-center p-3 rounded-xl border transition-all ${isSelected ? "bg-primary/5 border-primary" : "bg-surface border-border/60"} hover:bg-surfaceMuted active:bg-surfaceMuted`}
                      >
                        <View
                          className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${isSelected ? "border-primary" : "border-muted"}`}
                        >
                          {isSelected ? <View className="w-2.5 h-2.5 bg-primary rounded-full" /> : null}
                        </View>
                        <View className="flex-1 gap-0.5">
                          <Text className="text-base font-semibold text-text">
                            {option.title}
                          </Text>
                          <Text className="text-sm text-muted">
                            {option.description}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="mb-6 pt-5 border-t border-border/60">
                <Text className="text-base font-semibold text-text mb-1">
                  Configuración de retroalimentación
                </Text>
                <Text className="text-sm text-muted mb-3">
                  Personaliza cómo recibirán feedback los estudiantes
                </Text>

                <View className="gap-2">
                  {FEEDBACK_OPTIONS.map((option) => {
                    const isChecked = settings.feedback[option.id];
                    return (
                      <Pressable
                        key={option.id}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isChecked }}
                        onPress={() => handleToggleFeedback(option.id)}
                        className={`flex-row items-center p-3 rounded-xl border transition-all ${isChecked ? "bg-primary/5 border-primary" : "bg-surface border-border/60"} hover:bg-surfaceMuted active:bg-surfaceMuted`}
                      >
                        <View
                          className={`w-5 h-5 rounded border mr-3 items-center justify-center ${isChecked ? "bg-primary border-primary" : "bg-surface border-muted"}`}
                        >
                          {isChecked ? <View className="w-2.5 h-2.5 bg-white rounded-sm" /> : null}
                        </View>
                        <View className="flex-1 gap-0.5">
                          <Text className="text-base font-semibold text-text">
                            {option.title}
                          </Text>
                          <Text className="text-sm text-muted">
                            {option.description}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View className="mt-4 flex-row gap-2.5">
              <NunitoButton
                style={{ flex: 1, width: "auto", backgroundColor: "transparent", padding: 0 }}
                contentStyle={[
                  {
                    backgroundColor: palette.primary,
                    opacity: !hasChanges ? 0.5 : 1,
                    shadowOpacity: 0,
                    elevation: 0,
                  }
                ]}
                disabled={!hasChanges}
                onPress={handleSaveSettings}
              >
                <Text
                  className={`text-sm font-semibold ${!hasChanges ? "text-primaryOn/80" : "text-primaryOn"}`}
                >
                  Guardar configuración
                </Text>
              </NunitoButton>
              <NunitoButton
                style={{ flex: 1, width: "auto", backgroundColor: "transparent", padding: 0 }}
                contentStyle={[
                  {
                    backgroundColor: palette.surface,
                    borderWidth: 1,
                    borderColor: palette.border,
                    shadowOpacity: 0,
                    elevation: 0,
                  }
                ]}
                onPress={handleResetDefaults}
              >
                <Text className="text-sm font-semibold text-text">
                  Restablecer valores predeterminados
                </Text>
              </NunitoButton>
            </View>

            {/* Logout Button */}
            <View className="mt-4">
              <NunitoButton
                onPress={async () => {
                  await logout();
                  onLogout();
                }}
                contentStyle={{
                  backgroundColor: palette.error,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="log-out" size={18} color={palette.primaryOn} />
                  <Text className="text-base font-bold text-primaryOn">
                    Cerrar Sesión
                  </Text>
                </View>
              </NunitoButton>
            </View>
          </TeacherSectionCard>
        );
    }
  };

  const renderStudentSection = () => {
    // If session is waiting, show Waiting Room
    if (sessionStatus === 'waiting') {
      return (
        <StudentWaitingRoom
          roomCode={roomCode || "----"}
          connectedStudents={connectedUserNames}
          studentName={userName}
          connectionStatus={connectionStatus}
        />
      );
    }

    // If session is live, show Game Start / Active Lobby
    if (sessionStatus === 'live') {
      return (
        <StudentGameStart
          gameName="Asociación Imagen-Palabra" // Placeholder, should come from session data
          difficulty="Fácil" // Placeholder
          timeLimit={600} // Placeholder
          onStart={() => {
            // Logic to actually enter the game view
            // For now, we can just set activeSection to 'games' or handle it via a specific game launcher
            // But based on current flow, 'games' section lists games. 
            // If 'live', we probably want to force them into the game or show this start screen.
            // Let's assume clicking start here launches the specific game.
            // For this task, we just need to show the screen.
            console.log("Start Game Pressed");
          }}
        />
      );
    }

    switch (activeSection) {
      case "games":
        return (
          <View className="gap-4">
            <Text className="text-[22px] font-bold text-text">Juegos disponibles</Text>
            <Text className="text-[15px] text-muted">
              Explora los mini juegos que podrás disfrutar con tu curso.
            </Text>
            <View className="gap-3">
              {gameDefinitions.map((game) => {
                const theme = gameThemeTokens[game.color];
                return (
                  <View
                    key={game.id}
                    className="rounded-2xl p-4 gap-1.5 border"
                    style={{
                      backgroundColor: theme.container,
                      borderColor: withAlpha(theme.accent, 0.4),
                    }}
                  >
                    <Text
                      className="text-base font-bold"
                      style={{ color: theme.accent }}
                    >
                      {game.name}
                    </Text>
                    <Text className="text-sm text-text">
                      {game.description}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      case "home":
      default:
        return (
          <View className="gap-4">
            <Text className="text-[22px] font-bold text-text">Panel del Estudiante</Text>
            <Text className="text-[15px] text-muted">
              Ingresa el código de tu sala y prepárate para divertirte
              aprendiendo con tus compañeros.
            </Text>
            <View className="mt-1.5 p-2.5 rounded-xl bg-background/70">
              <Text className="text-sm font-semibold text-text mb-1">¿Listo para jugar?</Text>
              <Text className="text-xs text-muted">
                Pídele a tu profesor el código de la sala y selecciónalo desde
                la pantalla principal.
              </Text>
            </View>

            {/* Temporary Debug Controls for Student Flow */}
            <View className="mt-4 p-4 bg-gray-100 rounded-lg">
              <Text className="font-bold mb-2">Debug Controls:</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => { setSessionStatus('waiting'); setRoomCode('ABC-123'); }} className="bg-blue-500 px-3 py-2 rounded">
                  <Text className="text-white">Simulate Join Room</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSessionStatus('live')} className="bg-green-500 px-3 py-2 rounded">
                  <Text className="text-white">Simulate Game Start</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setSessionStatus('idle'); setRoomCode(null); }} className="bg-red-500 px-3 py-2 rounded">
                  <Text className="text-white">Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
    }
  };

  return (

    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 24, gap: 20, flexGrow: 1 }}
    >
      <View className="bg-surface rounded-[20px] p-5 shadow-sm" style={{ elevation: 2 }}>
        <View className="flex-row items-center gap-4">
          <Image
            source={require("../../../../assets/images/nunito_logo.png")}
            style={{ width: 120, height: 40 }}
            resizeMode="contain"
          />
          {/* Separator removed */}
          <View className="flex-1 gap-1 ml-2">
            <Text className="text-[22px] font-bold text-text">Hola, {userName}</Text>
            <Text className="text-sm text-muted">
              {userType === "teacher" ? "Profesor" : "Estudiante"} de Nunito
            </Text>
          </View>
          <View
            className={`px-3.5 py-2 rounded-full ${userType === "teacher" ? "bg-primary/12" : "bg-accent/18"}`}
          >
            <Text className="text-[13px] font-semibold text-text">
              {userType === "teacher" ? "Profesor" : "Estudiante"}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1 flex-col md:flex-row gap-5">
        {userType === "teacher" ? (
          <>
            <View className="w-full md:w-[268px] gap-3">
              <TeacherSidebar
                activeSection={activeSection as TeacherSectionId}
                onSelectSection={(id) => handleSelectSection(id)}
                onLogout={async () => {
                  await logout();
                  onLogout();
                }}
              />
            </View>
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              <View className="flex-1 bg-surface rounded-[20px] border border-border p-5 shadow-sm">{renderTeacherSection()}</View>
            </ScrollView>
          </>
        ) : (
          <>
            <View className="bg-surface rounded-[20px] p-5 gap-3 border border-border shadow-sm">
              {menuItems.map((item) => {
                const isActive = item.id === activeSection;
                return (
                  <TouchableOpacity
                    key={item.id}
                    className={`py-3 px-3.5 rounded-[14px] border gap-1 ${isActive ? "bg-primary/12 border-primary" : "bg-surface border-border/90"}`}
                    onPress={() => handleSelectSection(item.id)}
                  >
                    <Text
                      className={`text-base font-semibold ${isActive ? "text-primary" : "text-text"}`}
                    >
                      {item.label}
                    </Text>
                    <Text
                      className={`text-[13px] ${isActive ? "text-primary/80" : "text-muted"}`}
                    >
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                className="mt-1 py-3 items-center rounded-[14px] bg-primary/6"
                onPress={async () => {
                  await logout();
                  onLogout();
                }}
              >
                <Text className="text-primary font-semibold text-[15px]">Cerrar sesión</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              <View className="flex-1 bg-surface rounded-[20px] border border-border p-5 shadow-sm">{renderStudentSection()}</View>
            </ScrollView>
          </>
        )}
      </View>
    </ScrollView>
  );
}
