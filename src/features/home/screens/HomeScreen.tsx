import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import GameLauncher from "@/features/home/components/GameLauncher";
import NavigationMenu from "@/features/home/components/NavigationMenu";
import RoomCreation from "@/features/home/components/RoomCreation";
import RoomDashboard from "@/features/home/components/RoomDashboard";
import StudentDashboard from "@/features/home/components/StudentDashboard";
import StudentResults from "@/features/home/components/StudentResults";
import TeacherLogin from "@/features/home/components/TeacherLogin";
import TeacherReports from "@/features/home/components/TeacherReports";
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
  const [navigationStack, setNavigationStack] = useState<AppState[]>([]);
  const [activeTab, setActiveTab] = useState<HomeTab>("student");
  const [studentName, setStudentName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentGameId, setCurrentGameId] = useState("image-word");
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const isStudentFormValid = useMemo(
    () => studentName.trim().length > 0 && roomCode.trim().length > 0,
    [studentName, roomCode],
  );

  const resetAppData = useCallback(() => {
    setStudentName("");
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

  const handleStudentJoin = () => {
    if (!isStudentFormValid) return;
    navigateTo("student-dashboard");
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
  // const gameCardBasis = isWeb ? "48%" : "100%"; // Removed in favor of NativeWind
  // const featureCardBasis = isWeb ? "30%" : "100%"; // Removed in favor of NativeWind

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
    if (isWeb) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackNavigation,
    );
    return () => subscription.remove();
  }, [handleBackNavigation, isWeb]);

  if (appState === "teacher-login") {
    const screen = (
      <TeacherLogin onLogin={handleTeacherLogin} onBack={handleBackNavigation} />
    );
    return isWeb ? (
      <WebLayout scrollable={false} onLogoPress={handleLogoPress}>
        {screen}
      </WebLayout>
    ) : (
      screen
    );
  }

  if (appState === "teacher-menu" && currentTeacher) {
    const screen = (
      <NavigationMenu
        userType="teacher"
        userName={currentTeacher.name}
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

  if (appState === "teacher-reports" && currentTeacher) {
    const screen = (
      <TeacherReports
        teacherName={currentTeacher.name}
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

  if (appState === "room-creation" && currentTeacher) {
    const screen = (
      <RoomCreation
        teacher={currentTeacher}
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
        roomCode={roomCode}
        onStartGame={handleStartGame}
        onLeaveRoom={handleReset}
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
            <TouchableOpacity
              className="flex-row items-center gap-3"
              activeOpacity={0.85}
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
            </TouchableOpacity>
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
                  onChangeText={setRoomCode}
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor={withAlpha(palette.muted, 0.6)}
                  maxLength={6}
                />
              </View>
              <NunitoButton disabled={!isStudentFormValid} onPress={handleStudentJoin}>
                <Feather name="play" size={18} color={palette.background} />
                <Text className="text-base font-bold text-primaryOn">
                  Unirse a la sala
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
                <TouchableOpacity
                  key={game.id}
                  activeOpacity={0.9}
                  className="rounded-2xl p-5 gap-3 border-2 shadow-lg w-full md:w-[48%] lg:w-[30%] active:scale-95 transition-transform"
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
                  <View
                    className="rounded-full px-4 py-2 border-2 self-start mt-2"
                    style={{
                      borderColor: theme.accent,
                      backgroundColor: withAlpha(theme.accent, 0.1),
                    }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Feather name="play" size={14} color={theme.accent} />
                      <Text className="text-sm font-semibold" style={{ color: theme.accent }}>
                        Probar Demo
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
    <TouchableOpacity
      className={`flex-1 items-center py-2.5 rounded-lg ${isActive ? "bg-white shadow-sm" : ""
        }`}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View className="flex-row items-center gap-2">
        <Feather
          name={icon}
          size={16}
          color={isActive ? palette.primaryOn : palette.muted}
        />
        <Text
          className={`text-base font-semibold ${isActive ? "text-primary" : "text-text"}`}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
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
        style={{ backgroundColor: withAlpha(palette.primary, 0.12) }}
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
