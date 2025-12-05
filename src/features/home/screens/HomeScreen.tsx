import { useCallback, useEffect, useMemo, useState } from "react";
import { validateRoomCode } from "@/services/useRooms";
import { API_CONFIG } from "@/config/api";
import {
  BackHandler,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import GameLauncher from "@/features/home/components/GameLauncher";
import NavigationMenu from "@/features/home/components/NavigationMenu";
import RoomCreation from "@/features/home/components/RoomCreation";
import RoomDashboard from "@/features/home/components/RoomDashboard";
import StudentDashboard from "@/features/home/components/StudentDashboard";
import StudentResults from "@/features/home/components/StudentResults";
import TeacherReports from "@/features/home/components/TeacherReports";
import LoginScreen from "@/features/auth/screens/LoginScreen";
import RegisterScreen from "@/features/auth/screens/RegisterScreen";
import {
  gameDefinitions,
  gameThemeTokens,
} from "@/features/home/constants/games";
import type {
  AppState,
  GameResults,
  Room,
  Teacher,
} from "@/features/home/types";
import { palette, withAlpha } from "@/theme/colors";
import NunitoButton from "@/features/home/components/NunitoButton";
import WebLayout from "@/features/home/components/WebLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRoomSocket } from "@/hooks/useRoomSocket";

const HOME_TABS = {
  student: "student" as const,
  teacher: "teacher" as const,
};

type HomeTab = (typeof HOME_TABS)[keyof typeof HOME_TABS];
type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

const TAB_CONFIG: Record<HomeTab, { label: string; icon: FeatherIconName }> = {
  student: { label: "Estudiante", icon: "users" },
  teacher: { label: "Profesor", icon: "book-open" },
};

const FEATURE_ITEMS: Array<{
  title: string;
  description: string;
  icon: FeatherIconName;
}> = [
    {
      title: "Retroalimentación inmediata",
      description: "Recibe respuestas al instante para mejorar.",
      icon: "zap",
    },
    {
      title: "Salas virtuales",
      description: "Los profesores pueden crear y gestionar sesiones.",
      icon: "users",
    },
    {
      title: "Reportes detallados",
      description: "Consulta el progreso individual y grupal.",
      icon: "bar-chart-2",
    },
  ];

const GAME_ICON_MAP: Record<string, FeatherIconName> = {
  "image-word": "image",
  "syllable-count": "hash",
  "rhyme-identification": "volume-2",
  "audio-recognition": "mic",
};

export default function HomeScreen() {
  const [appState, setAppState] = useState<AppState>("home");
  const [roomCodeError, setRoomCodeError] = useState<string>("");
  const [isLoadingRoomCode, setIsLoadingRoomCode] = useState(false);
  const [navigationStack, setNavigationStack] = useState<AppState[]>([]);
  const [activeTab, setActiveTab] = useState<HomeTab>("student");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentGameId, setCurrentGameId] = useState("image-word");
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // WebSocket Integration for Student
  const { users: connectedUsers, roomStatus, status: connectionStatus, stompClient } = useRoomSocket({
    roomId: currentRoom?.id || "",
    userId: studentId,
    userName: studentName,
    enabled: !!currentRoom && activeTab === 'student' && !!studentId,
  });

  // Effect to handle room status changes for student
  useEffect(() => {
    if (activeTab === 'student' && roomStatus === 'STARTED' && appState === 'student-dashboard') {
      // Auto-start game if room starts
      // We need to know which game to start. Prioritize the first game in the list.
      const gameId = currentRoom?.games?.[0]?.id || (currentRoom as any)?.game || "image-word";
      handleStartGame(gameId);
    }
  }, [roomStatus, appState, activeTab, currentRoom]);

  const isStudentFormValid = useMemo(
    () => studentName.trim().length > 0 && roomCode.trim().length > 0,
    [studentName, roomCode],
  );

  const resetAppData = useCallback(() => {
    setStudentName("");
    setStudentId("");
    setRoomCode("");
    setCurrentTeacher(null);
    setCurrentRoom(null);
    setCurrentGameId("image-word");
    setGameResults(null);
    setDemoMode(false);
  }, []);

  const handleTeacherLogin = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    navigateTo("teacher-menu");
  };

  const handleRoomCreated = (room: Room) => {
    setCurrentRoom(room);
    navigateTo("room-dashboard");
  };

  const handleStudentJoin = async () => {
    if (!isStudentFormValid) return;
    setIsLoadingRoomCode(true);
    setRoomCodeError("");
    const roomId = await validateRoomCode(roomCode.trim());
    setIsLoadingRoomCode(false);
    if (!roomId) {
      setRoomCodeError("El código de sala no existe. Verifica e intenta nuevamente.");
      return;
    }
    // Buscar la sala por código y agregar el estudiante usando el id correcto
    try {
      // 1. Buscar la sala por código
      const resRoom = await fetch(`${API_CONFIG.BASE_URL}/rooms/code/${roomCode.trim()}`);
      if (!resRoom.ok) {
        setRoomCodeError("No se encontró la sala. Revisa el código e inténtalo de nuevo.");
        return;
      }
      const room = await resRoom.json();
      setCurrentRoom(room); // Store room details for student too (needed for socket roomId)

      // 2. Agregar el estudiante usando el id de la sala
      const resStudent = await fetch(`${API_CONFIG.BASE_URL}/rooms/${room.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: studentName.trim() })
      });
      if (!resStudent.ok) {
        setRoomCodeError("No se pudo agregar el estudiante a la sala.");
        return;
      }

      const studentData = await resStudent.json();
      // Assuming the backend returns the student object with an id
      if (studentData && studentData.id) {
        setStudentId(studentData.id);
      } else {
        // Fallback if no ID is returned
        setStudentId(`temp-${Date.now()}`);
      }

      // Check if room is already active
      if (room.status === 'active') {
        const gameId = room.games?.[0]?.id || (room as any).game || "image-word";
        handleStartGame(gameId);
      } else {
        navigateTo("student-dashboard");
      }
    } catch {
      setRoomCodeError("Error de red. Intenta nuevamente más tarde.");
    }
  };

  const handleStartGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setDemoMode(false);
    navigateTo("student-game");
  };

  const handleViewResults = () => {
    navigateTo("teacher-reports");
  };

  const handleLogoPress = () => {
    // Don't navigate to home if user is authenticated and in teacher menu
    if (appState === "teacher-menu" && (user || currentTeacher)) {
      return;
    }
    navigateTo("home");
  };

  const handleReset = () => {
    resetAppData();
    setNavigationStack([]);
    if (isWeb && typeof window !== "undefined") {
      window.history.replaceState({ appState: "home" }, "", window.location.pathname);
    }
    setAppState("home");
  };

  const handleTeacherNavigate = (section: string) => {
    if (Platform.OS !== "web") {
      if (section === "rooms") {
        navigateTo("room-creation");
      }

      if (section === "reports") {
        navigateTo("teacher-reports");
      }
    }
  };

  const handleDemoGameStart = (gameId: string) => {
    setCurrentGameId(gameId);
    setDemoMode(true);
    navigateTo("student-game");
  };

  const handleNextGame = () => {
    if (!currentRoom || !currentRoom.games || currentRoom.games.length === 0) {
      handleReset();
      return;
    }

    const currentGameIndex = currentRoom.games.findIndex(g => g.id === currentGameId);
    if (currentGameIndex !== -1 && currentGameIndex < currentRoom.games.length - 1) {
      const nextGame = currentRoom.games[currentGameIndex + 1];
      setCurrentGameId(nextGame.id);
      navigateTo("student-game");
    } else {
      handleReset();
    }
  };
  const insets = useSafeAreaInsets();
  const headerPadding = useMemo(
    () => ({
      paddingTop: insets.top + 16,
      paddingLeft: 24 + insets.left,
      paddingRight: 24 + insets.right,
      paddingBottom: 16,
    }),
    [insets.left, insets.right, insets.top],
  );
  const scrollPadding = useMemo(
    () => ({
      paddingTop: 24,
      paddingBottom: 40 + insets.bottom,
      paddingLeft: 24 + insets.left,
      paddingRight: 24 + insets.right,
    }),
    [insets.bottom, insets.left, insets.right],
  );

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;
    window.history.replaceState({ appState: "home" }, "", window.location.pathname);
  }, [isWeb]);

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;
    const handlePopState = (event: any) => {
      const targetState = (event.state?.appState as AppState) ?? "home";
      setNavigationStack((prev) =>
        prev.length > 0 ? prev.slice(0, prev.length - 1) : prev,
      );
      setAppState(targetState);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isWeb]);

  const navigateTo = useCallback(
    (nextState: AppState) => {
      if (nextState === appState) return;
      setNavigationStack((prev) => [...prev, appState]);
      if (isWeb && typeof window !== "undefined") {
        window.history.pushState({ appState: nextState }, "", window.location.pathname);
      }
      setAppState(nextState);
    },
    [appState, isWeb],
  );

  const handleBackNavigation = useCallback(() => {
    if (navigationStack.length === 0) return false;

    if (isWeb && typeof window !== "undefined") {
      window.history.back();
      return true;
    }

    setNavigationStack((prev) => {
      const previousState = prev[prev.length - 1];
      setAppState(previousState);
      return prev.slice(0, -1);
    });
    return true;
  }, [isWeb, navigationStack.length]);

  useEffect(() => {
    if (!isWeb) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackNavigation,
    );
    return () => subscription.remove();
  }, [handleBackNavigation, isWeb]);

  // Auto-navigate authenticated users to teacher menu if they're on home screen
  useEffect(() => {
    console.log("Auth check effect - appState:", appState, "user:", user, "isAuthenticated:", isAuthenticated);
    if (user && isAuthenticated && appState === "home") {
      console.log("User is authenticated but on home screen, navigating to teacher-menu");
      setAppState("teacher-menu");
    }
  }, [user, isAuthenticated, appState]);

  // Login Screen
  if (appState === "teacher-login" && !showRegister) {
    console.log("Rendering login screen");
    const screen = (
      <LoginScreen
        onLoginSuccess={() => {
          console.log("Login success callback called, navigating to teacher-menu");
          // After successful login, the user will be in the auth context
          // We can safely navigate to teacher menu
          navigateTo("teacher-menu");
        }}
        onNavigateToRegister={() => setShowRegister(true)}
        onBack={handleBackNavigation}
      />
    );
    return isWeb ? (
      <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  // Register Screen
  if (appState === "teacher-login" && showRegister) {
    const screen = (
      <RegisterScreen
        onRegisterSuccess={() => {
          // After successful registration, the user will be in the auth context
          // We can safely navigate to teacher menu
          navigateTo("teacher-menu");
        }}
        onNavigateToLogin={() => setShowRegister(false)}
        onBack={() => setShowRegister(false)}
      />
    );
    return isWeb ? (
      <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  if (appState === "teacher-menu" && (currentTeacher || user)) {
    console.log("Rendering teacher-menu, user:", user, "currentTeacher:", currentTeacher);
    const teacherName = user?.name || currentTeacher?.name || "Profesor";
    const screen = (
      <NavigationMenu
        userType="teacher"
        userName={teacherName}
        onNavigate={handleTeacherNavigate}
        onLogout={handleReset}
      />
    );
    return isWeb ? (
      <WebLayout scrollable={false} fullWidth onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  if (appState === "teacher-reports" && (currentTeacher || user)) {
    const teacherName = user?.name || currentTeacher?.name || "Profesor";
    const screen = (
      <TeacherReports
        teacherName={teacherName}
        onBack={handleBackNavigation}
      />
    );
    return isWeb ? (
      <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  if (appState === "room-creation" && (currentTeacher || user)) {
    const teacher = currentTeacher || (user ? { name: user.name, email: user.email } : null);
    if (!teacher) return null;

    const screen = (
      <RoomCreation
        teacher={teacher}
        onRoomCreated={handleRoomCreated}
        onBack={handleBackNavigation}
      />
    );
    return isWeb ? (
      <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  if (appState === "room-dashboard" && currentRoom) {
    const screen = (
      <RoomDashboard
        room={currentRoom}
        onStartGame={() =>
          setCurrentRoom((prev) => (prev ? { ...prev, isActive: true } : prev))
        }
        onEndGame={() =>
          setCurrentRoom((prev) => (prev ? { ...prev, isActive: false } : prev))
        }
        onViewResults={handleViewResults}
        onBack={handleBackNavigation}
      />
    );
    return isWeb ? (
      <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  if (appState === "student-dashboard") {
    const screen = (
      <StudentDashboard
        studentName={studentName}
        studentId={studentId}
        roomCode={roomCode}
        roomId={currentRoom?.id || ""}
        teacherId={currentRoom?.teacherId}
        onStartGame={handleStartGame}
        onLeaveRoom={handleReset}
        // Pass socket data
        connectedUsers={connectedUsers}
        roomStatus={roomStatus}
        connectionStatus={connectionStatus}
      />
    );
    return isWeb ? (
      <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  if (appState === "student-game") {
    const difficulty = demoMode ? "easy" : (currentRoom?.difficulty ?? "easy");
    const timeLimit = demoMode ? 60 : (currentRoom?.duration ?? 10) * 60;

    const screen = (
      <GameLauncher
        gameId={currentGameId}
        difficulty={difficulty}
        timeLimit={timeLimit}
        onGameComplete={(results) => {
          setGameResults(results);
          navigateTo("student-results");
          if (!demoMode && currentRoom) {
            setCurrentRoom({ ...currentRoom, isActive: false });
          }
        }}
        onBack={handleReset}
        // Pass socket client
        stompClient={stompClient}
        studentId={studentId}
        studentName={studentName}
        roomId={currentRoom?.id}
        testSuiteId={currentRoom?.testSuiteId}
      />
    );
    return isWeb ? (
      <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  if (appState === "student-results" && gameResults) {
    const screen = (
      <StudentResults
        studentName={demoMode ? "Demo" : studentName}
        gameId={currentGameId}
        results={gameResults}
        onPlayAgain={() => navigateTo("student-game")}
        onBackToHome={handleReset}
        isLastGame={
          !currentRoom?.games ||
          currentRoom.games.length === 0 ||
          currentRoom.games.findIndex(g => g.id === currentGameId) === currentRoom.games.length - 1
        }
        onNextGame={handleNextGame}
      />
    );
    return isWeb ? (
      <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  const homeContent = (
    <View className="flex-1 bg-background">
      {!isWeb && (
        <View
          style={[
            headerPadding,
            {
              backgroundColor: palette.primary,
              borderBottomColor: withAlpha(palette.primaryOn, 0.25),
            },
          ]}
          className="border-b shadow-md"
        >
          <View className="flex-row items-center gap-4">
            <Pressable
              className="flex-row items-center gap-3 active:opacity-70"
              onPress={handleLogoPress}
            >
              <Image
                source={require("../../../../assets/images/nunito_logo.png")}
                style={{ width: 140, height: 48 }}
                resizeMode="contain"
              />
              <Text className="text-2xl font-extrabold tracking-tight">
                <Text style={{ color: "#E4483F" }}>N</Text>
                <Text style={{ color: "#F4A71D" }}>
                  u
                </Text>
                <Text style={{ color: "#3F9D4C" }}>
                  n
                </Text>
                <Text style={{ color: "#1E88E5" }}>
                  i
                </Text>
                <Text style={{ color: "#F4A71D" }}>
                  t
                </Text>
                <Text style={{ color: "#3F9D4C" }}>
                  o
                </Text>
              </Text>
            </Pressable>
            <View
              className="h-10 border-l"
              style={{ borderColor: withAlpha(palette.primaryOn, 0.35) }}
            />
            <View className="flex-1 gap-1">
              <Text
                className="text-base font-semibold"
                style={{ color: palette.primaryOn }}
              >
                Mini juegos para conciencia fonológica
              </Text>
              <Text style={{ color: withAlpha(palette.primaryOn, 0.8) }}>
                Programa de Integración Escolar
              </Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={scrollPadding}
        contentContainerClassName="flex-grow gap-7"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center gap-3 px-1">
          <Text className="text-3xl font-bold text-center text-text">
            ¡Bienvenidos a Nunito!
          </Text>
          <Text
            className="text-base text-center max-w-[520px] text-muted"
          >
            Una aplicación diseñada para niños de 6 a 9 años del Programa de
            Integración Escolar. Aprende jugando con nuestros mini juegos
            educativos.
          </Text>
        </View>

        <View
          className="rounded-3xl p-6 space-y-5 border shadow-md bg-surface border-border"
        >
          <View className="items-center gap-1">
            <Text className="text-[22px] font-bold text-center text-text">
              Acceso a la aplicación
            </Text>
            <Text
              className="text-base text-center text-muted"
            >
              Selecciona tu rol para comenzar
            </Text>
          </View>

          <View
            className="flex-row rounded-xl p-1.5 bg-surfaceMuted"
          >
            {(Object.keys(TAB_CONFIG) as HomeTab[]).map((tabKey) => {
              const config = TAB_CONFIG[tabKey];
              return (
                <TabButton
                  key={tabKey}
                  label={config.label}
                  icon={config.icon}
                  isActive={activeTab === tabKey}
                  onPress={() => setActiveTab(tabKey)}
                />
              );
            })}
          </View>

          {activeTab === "student" ? (
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-base font-semibold text-text">
                  Tu nombre
                </Text>
                <TextInput
                  className="rounded-xl border px-4 py-3 text-base border-border bg-surface text-text"
                  value={studentName}
                  onChangeText={setStudentName}
                  placeholder="Escribe tu nombre aquí"
                  placeholderTextColor={withAlpha(palette.muted, 0.6)}
                />
              </View>
              <View className="gap-2">
                <Text className="text-base font-semibold text-text">
                  Código de la sala
                </Text>
                <TextInput
                  className="rounded-xl border px-4 py-3 text-base border-border bg-surface text-text"
                  value={roomCode}
                  onChangeText={text => {
                    setRoomCode(text);
                    setRoomCodeError("");
                  }}
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor={withAlpha(palette.muted, 0.6)}
                  maxLength={6}
                />
                {roomCodeError ? (
                  <Text className="text-sm text-red-500 mt-1">{roomCodeError}</Text>
                ) : null}
              </View>
              <NunitoButton disabled={!isStudentFormValid || isLoadingRoomCode} onPress={handleStudentJoin}>
                <Feather name="play" size={18} color={palette.background} />
                <Text className="text-base font-bold text-primaryOn">
                  {isLoadingRoomCode ? "Validando..." : "Unirse a la sala"}
                </Text>
              </NunitoButton>
            </View>
          ) : (
            <View className="gap-4">
              <NunitoButton onPress={() => navigateTo("teacher-login")}>
                <Feather name="log-in" size={18} color={palette.background} />
                <Text className="text-base font-bold text-primaryOn">
                  Iniciar sesión / Registrarse
                </Text>
              </NunitoButton>
            </View>
          )}
        </View>

        <View className="gap-4 mb-12">
          <Text
            className="text-2xl font-bold text-text"
          >
            Características
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {FEATURE_ITEMS.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </View>
        </View>


        <View className="gap-4">
          <Text
            className="text-2xl font-bold text-text"
          >
            Mini juegos disponibles
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {gameDefinitions.map((game) => {
              const theme = gameThemeTokens[game.color];
              const iconName = GAME_ICON_MAP[game.id] ?? "star";
              return (
                <Pressable
                  key={game.id}
                  className="rounded-2xl p-5 gap-3 border-2 shadow-lg w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(50%-0.5rem)] active:scale-95 transition-transform active:opacity-90"
                  style={{
                    backgroundColor: theme.container,
                    borderColor: theme.accent,
                  }}
                  onPress={() => handleDemoGameStart(game.id)}
                >
                  <View
                    className="h-16 w-16 rounded-full items-center justify-center mb-2"
                    style={{
                      backgroundColor: theme.accent,
                    }}
                  >
                    <Feather name={iconName} size={28} color={theme.on} />
                  </View>
                  <View className="gap-1.5">
                    <Text className="text-lg font-bold" style={{ color: theme.accent }}>
                      {game.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {game.description}
                    </Text>
                  </View>

                </Pressable>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );

  return isWeb ? (
    <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
      {homeContent}
    </WebLayout>
  ) : (
    homeContent
  );
}

interface TabButtonProps {
  label: string;
  icon: FeatherIconName;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ label, icon, isActive, onPress }: TabButtonProps) {
  return (
    <Pressable
      className={`flex-1 items-center py-2.5 rounded-lg ${isActive ? "bg-white" : ""
        } active:opacity-70`}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-2">
        <Feather
          name={icon}
          size={16}
          color={isActive ? palette.primary : palette.muted}
        />
        <Text
          className={`text-base font-semibold ${isActive ? "text-primary" : "text-text"}`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: FeatherIconName;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <View
      className="rounded-2xl p-4 gap-2 border shadow-sm flex-grow w-full md:w-[30%] bg-surface border-border"
    >
      <View
        className="h-10 w-10 rounded-full items-center justify-center"
        style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 2 }}
      >
        <Feather name={icon} size={20} color={palette.primary} />
      </View>
      <Text className="text-base font-bold text-text">
        {title}
      </Text>
      <Text className="text-sm text-muted">
        {description}
      </Text>
    </View>
  );
}
