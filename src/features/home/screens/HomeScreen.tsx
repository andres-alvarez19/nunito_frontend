import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GameLauncher from '@/features/home/components/GameLauncher';
import NavigationMenu from '@/features/home/components/NavigationMenu';
import RoomCreation from '@/features/home/components/RoomCreation';
import RoomDashboard from '@/features/home/components/RoomDashboard';
import StudentDashboard from '@/features/home/components/StudentDashboard';
import StudentResults from '@/features/home/components/StudentResults';
import TeacherLogin from '@/features/home/components/TeacherLogin';
import TeacherReports from '@/features/home/components/TeacherReports';
import { gameDefinitions } from '@/features/home/constants/games';
import type { AppState, GameResults, Room, Teacher } from '@/features/home/types';
import { palette } from '@/theme/colors';

const HOME_TABS = {
  student: 'student' as const,
  teacher: 'teacher' as const,
};

type HomeTab = (typeof HOME_TABS)[keyof typeof HOME_TABS];

export default function HomeScreen() {
  const [appState, setAppState] = useState<AppState>('home');
  const [activeTab, setActiveTab] = useState<HomeTab>('student');
  const [studentName, setStudentName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentGameId, setCurrentGameId] = useState('image-word');
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const isStudentFormValid = useMemo(() => studentName.trim().length > 0 && roomCode.trim().length > 0, [studentName, roomCode]);

  const handleTeacherLogin = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setAppState('teacher-menu');
  };

  const handleRoomCreated = (room: Room) => {
    setCurrentRoom(room);
    setAppState('room-dashboard');
  };

  const handleStudentJoin = () => {
    if (!isStudentFormValid) return;
    setAppState('student-dashboard');
  };

  const handleStartGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setDemoMode(false);
    setAppState('student-game');
  };

  const handleViewResults = () => {
    setAppState('teacher-reports');
  };

  const handleReset = () => {
    setAppState('home');
    setActiveTab('student');
    setStudentName('');
    setRoomCode('');
    setCurrentTeacher(null);
    setCurrentRoom(null);
    setCurrentGameId('image-word');
    setGameResults(null);
    setDemoMode(false);
  };

  const handleTeacherNavigate = (section: string) => {
    if (section === 'rooms') {
      setAppState('room-creation');
    }

    if (section === 'reports') {
      setAppState('teacher-reports');
    }
  };

  const handleDemoGameStart = (gameId: string) => {
    setCurrentGameId(gameId);
    setDemoMode(true);
    setAppState('student-game');
  };

  if (appState === 'teacher-login') {
    return <TeacherLogin onLogin={handleTeacherLogin} onBack={handleReset} />;
  }

  if (appState === 'teacher-menu' && currentTeacher) {
    return (
      <NavigationMenu
        userType="teacher"
        userName={currentTeacher.name}
        onNavigate={handleTeacherNavigate}
        onLogout={handleReset}
      />
    );
  }

  if (appState === 'teacher-reports' && currentTeacher) {
    return <TeacherReports teacherName={currentTeacher.name} onBack={() => setAppState('teacher-menu')} />;
  }

  if (appState === 'room-creation' && currentTeacher) {
    return <RoomCreation teacher={currentTeacher} onRoomCreated={handleRoomCreated} onBack={() => setAppState('teacher-menu')} />;
  }

  if (appState === 'room-dashboard' && currentRoom) {
    return (
      <RoomDashboard
        room={currentRoom}
        onStartGame={() => setCurrentRoom((prev) => (prev ? { ...prev, isActive: true } : prev))}
        onEndGame={() => setCurrentRoom((prev) => (prev ? { ...prev, isActive: false } : prev))}
        onViewResults={handleViewResults}
        onBack={() => setAppState('teacher-menu')}
      />
    );
  }

  if (appState === 'student-dashboard') {
    return (
      <StudentDashboard
        studentName={studentName}
        roomCode={roomCode}
        onStartGame={handleStartGame}
        onLeaveRoom={handleReset}
      />
    );
  }

  if (appState === 'student-game') {
    const difficulty = demoMode ? 'easy' : currentRoom?.difficulty ?? 'easy';
    const timeLimit = demoMode ? 60 : (currentRoom?.duration ?? 10) * 60;

    return (
      <GameLauncher
        gameId={currentGameId}
        difficulty={difficulty}
        timeLimit={timeLimit}
        onGameComplete={(results) => {
          setGameResults(results);
          setAppState('student-results');
          if (!demoMode && currentRoom) {
            setCurrentRoom({ ...currentRoom, isActive: false });
          }
        }}
        onBack={handleReset}
      />
    );
  }

  if (appState === 'student-results' && gameResults) {
    return (
      <StudentResults
        studentName={demoMode ? 'Demo' : studentName}
        gameId={currentGameId}
        results={gameResults}
        onPlayAgain={() => setAppState('student-game')}
        onBackToHome={handleReset}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>PIE Educativo</Text>
          <Text style={styles.appSubtitle}>Mini juegos para conciencia fonológica</Text>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>¡Bienvenidos a PIE Educativo!</Text>
          <Text style={styles.welcomeSubtitle}>
            Aprende jugando con nuestros mini juegos educativos diseñados para estudiantes del Programa de Integración Escolar.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acceso a la aplicación</Text>
          <View style={styles.tabContainer}>
            <TabButton label="Estudiante" isActive={activeTab === 'student'} onPress={() => setActiveTab('student')} />
            <TabButton label="Profesor" isActive={activeTab === 'teacher'} onPress={() => setActiveTab('teacher')} />
          </View>

          {activeTab === 'student' ? (
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Tu nombre</Text>
                <TextInput
                  style={styles.input}
                  value={studentName}
                  onChangeText={setStudentName}
                  placeholder="Escribe tu nombre"
                  placeholderTextColor={palette.muted}
                />
              </View>
              <View>
                <Text style={styles.label}>Código de la sala</Text>
                <TextInput
                  style={styles.input}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor={palette.muted}
                  maxLength={6}
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, !isStudentFormValid && styles.disabledButton]}
                disabled={!isStudentFormValid}
                onPress={handleStudentJoin}
              >
                <Text style={styles.primaryButtonText}>Unirse a la sala</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setAppState('teacher-login')}>
                <Text style={styles.primaryButtonText}>Crear nueva sala</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setAppState('teacher-login')}>
                <Text style={styles.secondaryButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Mini juegos disponibles</Text>
          <View style={styles.gamesGrid}>
            {gameDefinitions.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, styles[`${game.color}Background` as const]]}
                onPress={() => handleDemoGameStart(game.id)}
              >
                <Image source={game.demoImage} style={styles.gameImage} resizeMode="cover" />
                <Text style={styles.gameTitle}>{game.name}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
                <Text style={styles.demoText}>Probar demo</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Características</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard title="Retroalimentación inmediata" description="Recibe respuestas al instante para mejorar." />
            <FeatureCard title="Salas virtuales" description="Los profesores pueden crear y gestionar sesiones." />
            <FeatureCard title="Reportes detallados" description="Consulta el progreso individual y grupal." />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ label, isActive, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity style={[styles.tabButton, isActive && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.text,
  },
  appSubtitle: {
    fontSize: 16,
    color: palette.muted,
  },
  welcome: {
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.text,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: palette.muted,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 20,
    gap: 20,
    shadowColor: '#00000022',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 4,
    borderRadius: 999,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: palette.primary,
  },
  tabButtonText: {
    color: palette.text,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: palette.primaryOn,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    color: palette.text,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: palette.primaryOn,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  gamesSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gameCard: {
    flexBasis: '47%',
    minWidth: '47%',
    padding: 16,
    borderRadius: 18,
    gap: 12,
    backgroundColor: palette.surface,
    shadowColor: '#00000011',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
  },
  gameImage: {
    width: '100%',
    height: 120,
    borderRadius: 14,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  gameDescription: {
    fontSize: 14,
    color: palette.muted,
  },
  demoText: {
    color: palette.primary,
    fontWeight: '600',
  },
  mintBackground: {
    backgroundColor: '#ECFEFF',
  },
  pastelBackground: {
    backgroundColor: '#FDF2F8',
  },
  violetBackground: {
    backgroundColor: '#F5F3FF',
  },
  blueBackground: {
    backgroundColor: '#EFF6FF',
  },
  features: {
    gap: 16,
    marginBottom: 40,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    flexBasis: '31%',
    minWidth: '31%',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    flexGrow: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  featureDescription: {
    fontSize: 14,
    color: palette.muted,
  },
});
