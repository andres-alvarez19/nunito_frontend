import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { gameDefinitions } from '@/features/home/constants/games';
import { palette } from '@/theme/colors';
import type { Room } from '@/features/home/types';

interface RoomDashboardProps {
  room: Room;
  onStartGame: () => void;
  onEndGame: () => void;
  onViewResults: () => void;
  onBack: () => void;
}

export default function RoomDashboard({ room, onStartGame, onEndGame, onViewResults, onBack }: RoomDashboardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>{room.name}</Text>
        <Text style={styles.subtitle}>Código de sala: {room.code}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Configuración de la sala</Text>
        <View style={styles.gridRow}>
          <InfoChip
            label="Juego"
            value={gameDefinitions.find((definition) => definition.id === room.game)?.name ?? room.game}
          />
          <InfoChip label="Dificultad" value={room.difficulty} />
        </View>
        <View style={styles.gridRow}>
          <InfoChip label="Duración" value={`${room.duration} min`} />
          <InfoChip label="Estudiantes" value={room.students.length.toString()} />
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.primaryButton} onPress={onStartGame}>
            <Text style={styles.primaryButtonText}>Iniciar juego</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onEndGame}>
            <Text style={styles.secondaryButtonText}>Finalizar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.linkButton} onPress={onViewResults}>
        <Text style={styles.linkText}>Ver reportes de desempeño</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={onBack}>
        <Text style={styles.linkText}>Volver al menú</Text>
      </TouchableOpacity>
    </View>
  );
}

interface InfoChipProps {
  label: string;
  value: string;
}

function InfoChip({ label, value }: InfoChipProps) {
  return (
    <View style={styles.infoChip}>
      <Text style={styles.infoChipLabel}>{label}</Text>
      <Text style={styles.infoChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 24,
    gap: 24,
    backgroundColor: palette.background,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 15,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoChip: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 12,
  },
  infoChipLabel: {
    fontSize: 13,
    color: palette.muted,
  },
  infoChipValue: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  buttonGroup: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: palette.primaryOn,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: '600',
  },
  linkButton: {
    alignSelf: 'center',
  },
  linkText: {
    color: palette.primary,
    fontWeight: '600',
  },
});
