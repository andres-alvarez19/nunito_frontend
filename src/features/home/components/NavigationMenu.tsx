import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

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
import TestSuiteManager, {
  type TestSuite,
} from "@/features/home/components/teacher/TestSuiteManager";
import GameQuestionEditor from "@/features/home/components/teacher/GameQuestionEditor";
import RoomCreationFlow, {
  type Room,
} from "@/features/home/components/teacher/RoomCreationFlow";
import ProgressBar from "@/features/home/components/teacher/ProgressBar";
import { palette, withAlpha } from "@/theme/colors";

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

type RoomSummaryItem = {
  id: string;
  title: string;
  gameLabel: string;
  gameId: "image-word" | "syllable-count" | "rhyme-identification" | "audio-recognition";
  difficulty: DifficultyOption;
  createdAt: string;
  dateTime: string;
  students: number;
  average: number;
  completion: number;
  status: "active" | "past";
  studentsResults: StudentResult[];
};

type StudentResult = {
  name: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  averageTime: number;
  completedAt: string;
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

type DifficultyOption = "easy" | "medium" | "hard";

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

const ACTIVE_ROOMS: RoomSummaryItem[] = [
  {
    id: "room-a",
    title: "Clase 3°A - Fonología",
    gameLabel: "Asociación Imagen-Palabra",
    gameId: "image-word",
    difficulty: "easy",
    createdAt: "2024-01-15T10:30:00Z",
    dateTime: "15 de enero de 2024, 07:30",
    students: 8,
    average: 85,
    completion: 100,
    status: "active",
    studentsResults: [
      {
        name: "Ana García",
        score: 95,
        correctAnswers: 19,
        totalQuestions: 20,
        averageTime: 8.5,
        completedAt: "2024-01-15T10:45:00Z",
      },
      {
        name: "Carlos López",
        score: 80,
        correctAnswers: 16,
        totalQuestions: 20,
        averageTime: 12.3,
        completedAt: "2024-01-15T10:47:00Z",
      },
      {
        name: "María Rodríguez",
        score: 90,
        correctAnswers: 18,
        totalQuestions: 20,
        averageTime: 9.8,
        completedAt: "2024-01-15T10:46:00Z",
      },
      {
        name: "Diego Martínez",
        score: 75,
        correctAnswers: 15,
        totalQuestions: 20,
        averageTime: 15.2,
        completedAt: "2024-01-15T10:48:00Z",
      },
    ],
  },
];

const PAST_ROOMS: RoomSummaryItem[] = [
  {
    id: "room-b",
    title: "Clase 2°B - Sílabas",
    gameLabel: "Conteo de Sílabas",
    gameId: "syllable-count",
    difficulty: "medium",
    createdAt: "2024-01-14T14:15:00Z",
    dateTime: "14 de enero de 2024, 11:15",
    students: 6,
    average: 78,
    completion: 83,
    status: "past",
    studentsResults: [
      {
        name: "Sofía Hernández",
        score: 85,
        correctAnswers: 17,
        totalQuestions: 20,
        averageTime: 11.2,
        completedAt: "2024-01-14T14:30:00Z",
      },
      {
        name: "Mateo Silva",
        score: 70,
        correctAnswers: 14,
        totalQuestions: 20,
        averageTime: 18.5,
        completedAt: "2024-01-14T14:32:00Z",
      },
    ],
  },
];

export default function NavigationMenu({
  userType,
  userName,
  onNavigate,
  onLogout,
}: NavigationMenuProps) {
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

  // Room creation state
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatSeconds = (seconds: number) => `${seconds.toFixed(1)}s`;

  const renderRoomDetailView = (backTarget: "rooms" | "reports") => {
    if (!selectedRoom) return null;
    const difficultyLabel =
      selectedRoom.difficulty === "easy"
        ? "Fácil"
        : selectedRoom.difficulty === "medium"
          ? "Intermedio"
          : "Difícil";
    const gameName =
      gameDefinitions.find((g) => g.id === selectedRoom.gameId)?.name ??
      selectedRoom.gameLabel;

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
              <Text className="text-lg font-extrabold text-text">{gameName}</Text>
              <Text className="text-sm text-muted">
                {difficultyLabel} • {formatDate(selectedRoom.createdAt)}
              </Text>
            </View>
            <View className="px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/50">
              <Text className="text-xs font-bold text-primary">
                {selectedRoom.status === "active" ? "Activa" : "Finalizada"}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2.5">
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
          </View>

          <View className="gap-2.5">
            <Text className="text-base font-bold text-text">Resultados por estudiante</Text>
            {selectedRoom.studentsResults.map((student) => (
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
                  <View className="flex-1 min-w-[140px] gap-1">
                    <Text className="text-xs text-muted">Completado</Text>
                    <Text className="text-sm font-bold text-text">
                      {formatDate(student.completedAt)}
                    </Text>
                  </View>
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
              </View>
            ))}
          </View>
        </View>
      </TeacherSectionCard>
    );
  };

  const renderTeacherSection = () => {
    switch (activeSection) {
      case "home":
        return (
          <TeacherSectionCard title="Inicio" subtitle="Panel principal">
            <View className="mt-4 mb-6 gap-2 items-center">
              <Text className="text-[22px] font-bold text-text">Panel Profesor</Text>
              <Text className="text-sm text-muted text-center">
                Desde aquí puedes crear salas, gestionar actividades y ver
                reportes de tus estudiantes.
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-3 mt-2 mb-5">
              <View className="flex-1 min-w-[48%] rounded-2xl py-3.5 px-4 border border-accent/30 bg-accent/5 shadow-md grow">
                <Text className="text-[13px] font-semibold text-primary mb-1">
                  Salas activas
                </Text>
                <Text className="text-3xl font-bold text-primary">
                  0
                </Text>
                <Text className="mt-1 text-xs text-muted">sesiones en progreso</Text>
              </View>
              <View className="flex-1 min-w-[48%] rounded-2xl py-3.5 px-4 border border-mintContainer/50 bg-mintContainer/30 shadow-md grow">
                <Text className="text-[13px] font-semibold text-mint mb-1">
                  Estudiantes
                </Text>
                <Text className="text-3xl font-bold text-mint">
                  0
                </Text>
                <Text className="mt-1 text-xs text-muted">
                  conectados esta semana
                </Text>
              </View>
              <View className="flex-1 min-w-[48%] rounded-2xl py-3.5 px-4 border border-violetContainer/50 bg-violetContainer/30 shadow-md grow">
                <Text className="text-[13px] font-semibold text-violet mb-1">
                  Actividades
                </Text>
                <Text
                  className="text-3xl font-bold text-violet"
                >
                  0
                </Text>
                <Text className="mt-1 text-xs text-muted">completadas</Text>
              </View>
              <View className="flex-1 min-w-[48%] rounded-2xl py-3.5 px-4 border border-blueContainer/50 bg-blueContainer/30 shadow-md grow">
                <Text className="text-[13px] font-semibold text-blue mb-1">
                  Progreso
                </Text>
                <Text className="text-3xl font-bold text-blue">
                  0%
                </Text>
                <Text className="mt-1 text-xs text-muted">promedio general</Text>
              </View>
            </View>
            <View className="mt-2 mb-1 rounded-2xl border border-border/80 bg-surface py-3.5 px-4 gap-2 shadow-sm">
              <View className="gap-1">
                <View className="flex-row items-center gap-2">
                  <Feather
                    name="bar-chart-2"
                    size={18}
                    color={palette.primary}
                  />
                  <Text className="text-base font-bold text-text">Actividad reciente</Text>
                </View>
                <Text className="text-[13px] text-muted">
                  Últimas salas y reportes
                </Text>
              </View>
              <View className="mt-1.5 p-2.5 rounded-xl bg-background/70">
                <View className="gap-0.5">
                  <Text className="text-sm font-semibold text-text">
                    No hay actividad reciente
                  </Text>
                  <Text className="text-xs text-muted">
                    Crea una nueva sala para comenzar
                  </Text>
                </View>
              </View>
            </View>
          </TeacherSectionCard>
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
                // TODO: Add room to list
              }}
              onCancel={() => setIsCreatingRoom(false)}
            />
          );
        }

        // Show room list
        return (
          <TeacherSectionCard
            title="Mis Salas"
            subtitle="Salas activas y anteriores"
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-semibold text-text">Salas activas</Text>
              <Pressable
                className="flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-xl active:scale-95"
                onPress={() => setIsCreatingRoom(true)}
              >
                <Feather name="plus" size={18} color={palette.primaryOn} />
                <Text className="text-sm font-semibold text-primaryOn">
                  Nueva Sala
                </Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-4">
              {ACTIVE_ROOMS.map((room) => (
                <RoomSummaryCard
                  key={room.id}
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
            <Text className="mt-4 mb-1 text-base font-semibold text-text">Salas anteriores</Text>
            <View className="flex-row flex-wrap gap-4">
              {PAST_ROOMS.map((room) => (
                <RoomSummaryCard
                  key={room.id}
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
              {[...ACTIVE_ROOMS, ...PAST_ROOMS].map((room) => (
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
                <TestSuiteManager onSelectTestSuite={setSelectedTestSuite} />
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
                    {selectedTestSuite.games.map((gameId) => {
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
          </TeacherSectionCard>
        );
    }
  };

  const renderStudentSection = () => {
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
          </View>
        );
    }
  };

  return (

    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 24, gap: 20, flexGrow: 1 }}
    >
      <View className="bg-surface rounded-[20px] border border-border p-5 shadow-sm">
        <View className="flex-row items-center gap-4">
          <Image
            source={require("../../../../assets/images/nunito_logo.png")}
            style={{ width: 120, height: 40 }}
            resizeMode="contain"
          />
          <View className="h-10 border-l border-border" />
          <View className="flex-1 gap-1">
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

      <View className="flex-1 flex-row gap-5">
        {userType === "teacher" ? (
          <>
            <View className="w-[268px] gap-3">
              <TeacherSidebar
                activeSection={activeSection as TeacherSectionId}
                onSelectSection={(id) => handleSelectSection(id)}
                onLogout={onLogout}
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
                onPress={onLogout}
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


