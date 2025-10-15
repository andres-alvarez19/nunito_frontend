import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '@/theme/colors';
import { formatSeconds } from '@/utils/time';

interface StudentDashboardProps {
  studentName: string;
  roomCode: string;
  onStartGame: (gameId: string) => void;
  onLeaveRoom: () => void;
}

const connectedStudentsMock = ['Ana', 'Carlos', 'María'];

export default function StudentDashboard({ studentName, roomCode, onStartGame, onLeaveRoom }: StudentDashboardProps) {
  const [isWaiting, setIsWaiting] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [isActive, setIsActive] = useState(false);

  const totalStudents = useMemo(() => connectedStudentsMock.length + 1, []);

  useEffect(() => {
    const joinTimer = setTimeout(() => {
      setIsWaiting(false);
      setIsActive(true);
    }, 4000);

    return () => clearTimeout(joinTimer);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    if (timeRemaining === 0) {
      setIsActive(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const handlePlay = () => {
    onStartGame('image-word');
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{studentName.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.title}>¡Hola, {studentName}!</Text>
          <Text style={styles.subtitle}>Sala: {roomCode}</Text>
        </View>
        <TouchableOpacity style={styles.leaveButton} onPress={onLeaveRoom}>
          <Text style={styles.leaveButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {isWaiting ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Esperando que inicie el juego...</Text>
          <Text style={styles.cardSubtitle}>
            Tu profesor comenzará la actividad en breve. Hay {totalStudents} estudiantes conectados.
          </Text>
          <FlatList
            data={[studentName, ...connectedStudentsMock]}
            keyExtractor={(item) => item}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <View style={styles.studentChip}>
                <View style={styles.statusDot} />
                <Text style={[styles.studentName, item === studentName && styles.currentStudent]}>{item}</Text>
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Juego activo</Text>
          <Text style={styles.cardSubtitle}>Tiempo restante: {formatSeconds(timeRemaining)}</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handlePlay} disabled={!isActive}>
            <Text style={styles.primaryButtonText}>¡Comenzar a jugar!</Text>
          </TouchableOpacity>

          <View style={styles.tipsGrid}>
            <TipCard title="¡Tú puedes!" description="Haz tu mejor esfuerzo en cada pregunta." />
            <TipCard title="Aprende jugando" description="Cada respuesta correcta suma puntos." />
            <TipCard title="Diviértete" description="Recuerda disfrutar la actividad." />
          </View>
        </View>
      )}
    </View>
  );
}

interface TipCardProps {
  title: string;
  description: string;
}

function TipCard({ title, description }: TipCardProps) {
  return (
    <View style={styles.tipCard}>
      <Text style={styles.tipTitle}>{title}</Text>
      <Text style={styles.tipDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 24,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.primaryOn,
    fontWeight: '700',
    fontSize: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 14,
    color: palette.muted,
  },
  leaveButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  leaveButtonText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 20,
    gap: 16,
    shadowColor: '#00000022',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
  },
  cardSubtitle: {
    fontSize: 15,
    color: palette.muted,
  },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  studentName: {
    color: palette.text,
    fontWeight: '500',
  },
  currentStudent: {
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: palette.primaryOn,
    fontWeight: '700',
    fontSize: 16,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tipCard: {
    flexBasis: '31%',
    minWidth: '31%',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 12,
    flexGrow: 1,
  },
  tipTitle: {
    fontWeight: '700',
    color: palette.text,
    marginBottom: 6,
  },
  tipDescription: {
    color: palette.muted,
  },
});
