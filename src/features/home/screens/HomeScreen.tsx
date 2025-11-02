import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
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

  const handleTeacherLogin = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setAppState("teacher-menu");
  };

  const handleRoomCreated = (room: Room) => {
    setCurrentRoom(room);
    setAppState("room-dashboard");
  };

  const handleStudentJoin = () => {
    if (!isStudentFormValid) return;
    setAppState("student-dashboard");
  };

  const handleStartGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setDemoMode(false);
    setAppState("student-game");
  };

  const handleViewResults = () => {
    setAppState("teacher-reports");
  };

  const handleReset = () => {
    setAppState("home");
    setActiveTab("student");
    setStudentName("");
    setRoomCode("");
    setCurrentTeacher(null);
    setCurrentRoom(null);
    setCurrentGameId("image-word");
    setGameResults(null);
    setDemoMode(false);
  };

  const handleTeacherNavigate = (section: string) => {
    if (section === "rooms") {
      setAppState("room-creation");
    }

    if (section === "reports") {
      setAppState("teacher-reports");
    }
  };

  const handleDemoGameStart = (gameId: string) => {
    setCurrentGameId(gameId);
    setDemoMode(true);
    setAppState("student-game");
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

  if (appState === "teacher-login") {
    return <TeacherLogin onLogin={handleTeacherLogin} onBack={handleReset} />;
  }

  if (appState === "teacher-menu" && currentTeacher) {
    return (
      <NavigationMenu
        userType="teacher"
        userName={currentTeacher.name}
        onNavigate={handleTeacherNavigate}
        onLogout={handleReset}
      />
    );
  }

  if (appState === "teacher-reports" && currentTeacher) {
    return (
      <TeacherReports
        teacherName={currentTeacher.name}
        onBack={() => setAppState("teacher-menu")}
      />
    );
  }

  if (appState === "room-creation" && currentTeacher) {
    return (
      <RoomCreation
        teacher={currentTeacher}
        onRoomCreated={handleRoomCreated}
        onBack={() => setAppState("teacher-menu")}
      />
    );
  }

  if (appState === "room-dashboard" && currentRoom) {
    return (
      <RoomDashboard
        room={currentRoom}
        onStartGame={() =>
          setCurrentRoom((prev) => (prev ? { ...prev, isActive: true } : prev))
        }
        onEndGame={() =>
          setCurrentRoom((prev) => (prev ? { ...prev, isActive: false } : prev))
        }
        onViewResults={handleViewResults}
        onBack={() => setAppState("teacher-menu")}
      />
    );
  }

  if (appState === "student-dashboard") {
    return (
      <StudentDashboard
        studentName={studentName}
        roomCode={roomCode}
        onStartGame={handleStartGame}
        onLeaveRoom={handleReset}
      />
    );
  }

  if (appState === "student-game") {
    const difficulty = demoMode ? "easy" : (currentRoom?.difficulty ?? "easy");
    const timeLimit = demoMode ? 60 : (currentRoom?.duration ?? 10) * 60;

    return (
      <GameLauncher
        gameId={currentGameId}
        difficulty={difficulty}
        timeLimit={timeLimit}
        onGameComplete={(results) => {
          setGameResults(results);
          setAppState("student-results");
          if (!demoMode && currentRoom) {
            setCurrentRoom({ ...currentRoom, isActive: false });
          }
        }}
        onBack={handleReset}
      />
    );
  }

  if (appState === "student-results" && gameResults) {
    return (
      <StudentResults
        studentName={demoMode ? "Demo" : studentName}
        gameId={currentGameId}
        results={gameResults}
        onPlayAgain={() => setAppState("student-game")}
        onBackToHome={handleReset}
      />
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, headerPadding]}>
        <View style={styles.topBarContent}>
          <Image
            source={require("../../../../assets/images/nunito_logo.png")}
            style={styles.topBarLogo}
          />
          <View style={styles.topBarDivider} />
          <View style={styles.topBarTextGroup}>
            <Text style={styles.topBarTitle}>
              Mini juegos para conciencia fonológica
            </Text>
            <Text style={styles.topBarSubtitle}>
              Programa de Integración Escolar
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, scrollPadding]}
      >
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>¡Bienvenidos a Nunito!</Text>
          <Text style={styles.welcomeSubtitle}>
            Una aplicación diseñada para niños de 6 a 9 años del Programa de
            Integración Escolar. Aprende jugando con nuestros mini juegos
            educativos.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Acceso a la aplicación</Text>
            <Text style={styles.cardSubtitle}>
              Selecciona tu rol para comenzar
            </Text>
          </View>

          <View style={styles.tabContainer}>
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
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Tu nombre</Text>
                <TextInput
                  style={styles.input}
                  value={studentName}
                  onChangeText={setStudentName}
                  placeholder="Escribe tu nombre aquí"
                  placeholderTextColor={withAlpha(palette.muted, 0.6)}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Código de la sala</Text>
                <TextInput
                  style={styles.input}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor={withAlpha(palette.muted, 0.6)}
                  maxLength={6}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !isStudentFormValid && styles.disabledButton,
                ]}
                disabled={!isStudentFormValid}
                onPress={handleStudentJoin}
              >
                <Feather name="play" size={18} color={palette.primaryOn} />
                <Text style={styles.primaryButtonText}>Unirse a la sala</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setAppState("teacher-login")}
              >
                <Feather name="log-in" size={18} color={palette.primaryOn} />
                <Text style={styles.primaryButtonText}>
                  Iniciar sesión / Registrarse
                </Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Inicia sesión o crea una cuenta para acceder a las funciones de
                profesor.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Mini juegos disponibles</Text>
          <View style={styles.gamesGrid}>
            {gameDefinitions.map((game) => {
              const theme = gameThemeTokens[game.color];
              const iconName = GAME_ICON_MAP[game.id] ?? "star";
              return (
                <TouchableOpacity
                  key={game.id}
                  style={[
                    styles.gameCard,
                    {
                      backgroundColor: theme.container,
                      borderColor: withAlpha(theme.accent, 0.6),
                    },
                  ]}
                  onPress={() => handleDemoGameStart(game.id)}
                >
                  <View
                    style={[
                      styles.gameIconBadge,
                      {
                        backgroundColor: withAlpha(theme.accent, 0.12),
                        borderColor: withAlpha(theme.accent, 0.4),
                      },
                    ]}
                  >
                    <Feather name={iconName} size={26} color={theme.accent} />
                  </View>
                  <View style={styles.gameTextGroup}>
                    <Text style={[styles.gameTitle, { color: theme.accent }]}>
                      {game.name}
                    </Text>
                    <Text style={styles.gameDescription}>
                      {game.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.demoPill,
                      {
                        borderColor: theme.accent,
                        backgroundColor: withAlpha(theme.accent, 0.16),
                      },
                    ]}
                  >
                    <Text
                      style={[styles.demoPillText, { color: theme.accent }]}
                    >
                      Probar demo
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Características</Text>
          <View style={styles.featuresGrid}>
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
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <View style={styles.tabButtonContent}>
        <Feather
          name={icon}
          size={16}
          color={isActive ? palette.primaryOn : palette.muted}
        />
        <Text
          style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}
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
    <View style={styles.featureCard}>
      <View style={styles.featureIconBadge}>
        <Feather name={icon} size={20} color={palette.primary} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  topBar: {
    backgroundColor: palette.primary,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(palette.primaryOn, 0.25),
    shadowColor: "#00000033",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  topBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  topBarLogo: {
    width: 140,
    height: 48,
    resizeMode: "contain",
  },
  topBarDivider: {
    height: 40,
    borderLeftWidth: 1,
    borderLeftColor: withAlpha(palette.primaryOn, 0.35),
    marginLeft: 8,
    marginRight: 12,
  },
  topBarTextGroup: {
    flex: 1,
    gap: 2,
  },
  topBarTitle: {
    color: palette.primaryOn,
    fontSize: 16,
    fontWeight: "600",
  },
  topBarSubtitle: {
    color: withAlpha(palette.primaryOn, 0.8),
    fontSize: 13,
  },
  content: {
    gap: 28,
  },
  welcome: {
    alignItems: "center",
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: palette.muted,
    textAlign: "center",
    maxWidth: 520,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#0000001f",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 15,
    color: palette.muted,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: withAlpha(palette.primary, 0.06),
    padding: 4,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 999,
  },
  tabButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: palette.primary,
    shadowColor: "#0000001a",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.muted,
  },
  tabButtonTextActive: {
    color: palette.primaryOn,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  helperText: {
    fontSize: 14,
    color: withAlpha(palette.muted, 0.8),
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.text,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.surface,
    color: palette.text,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
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
  gamesSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: palette.text,
  },
  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gameCard: {
    flexBasis: "48%",
    minWidth: "48%",
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    shadowColor: "#00000014",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  gameIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  gameTextGroup: {
    gap: 6,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  gameDescription: {
    fontSize: 14,
    color: palette.muted,
  },
  demoPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  demoPillText: {
    fontWeight: "600",
    fontSize: 13,
  },
  features: {
    gap: 18,
    marginBottom: 48,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  featureCard: {
    flexBasis: "30%",
    minWidth: "30%",
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#00000014",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    flexGrow: 1,
    alignItems: "flex-start",
  },
  featureIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withAlpha(palette.primary, 0.12),
    justifyContent: "center",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  featureDescription: {
    fontSize: 14,
    color: palette.muted,
  },
});
