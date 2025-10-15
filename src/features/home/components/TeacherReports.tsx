import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '@/theme/colors';

interface TeacherReportsProps {
  teacherName: string;
  onBack: () => void;
}

const mockReports = [
  {
    id: '1',
    room: 'Clase 3°A',
    game: 'Asociación Imagen-Palabra',
    accuracy: 86,
    participants: 12,
  },
  {
    id: '2',
    room: 'Sala Refuerzo',
    game: 'Conteo de Sílabas',
    accuracy: 78,
    participants: 9,
  },
];

export default function TeacherReports({ teacherName, onBack }: TeacherReportsProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Reportes de aprendizaje</Text>
        <Text style={styles.subtitle}>Resumen de las sesiones recientes de {teacherName}.</Text>
      </View>

      <FlatList
        data={mockReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.room}</Text>
            <Text style={styles.cardSubtitle}>{item.game}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Participantes</Text>
                <Text style={styles.statValue}>{item.participants}</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Precisión</Text>
                <Text style={styles.statValue}>{item.accuracy}%</Text>
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Volver al menú</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 24,
  },
  header: {
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
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
    gap: 12,
    shadowColor: '#00000022',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
  },
  cardSubtitle: {
    fontSize: 15,
    color: palette.muted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statChip: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 12,
  },
  statLabel: {
    color: palette.muted,
    fontSize: 13,
  },
  statValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  backText: {
    color: palette.primary,
    fontWeight: '600',
  },
});
