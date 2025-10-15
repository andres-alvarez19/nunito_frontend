import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { palette } from '@/theme/colors';
import type { Room, Teacher } from '@/features/home/types';

interface RoomCreationProps {
  teacher: Teacher;
  onRoomCreated: (room: Room) => void;
  onBack: () => void;
}

const gameOptions = [
  { id: 'image-word', label: 'Asociación Imagen-Palabra' },
  { id: 'syllable-count', label: 'Conteo de Sílabas' },
  { id: 'rhyme-identification', label: 'Identificación de Rimas' },
  { id: 'audio-recognition', label: 'Reconocimiento Auditivo' },
];

const difficultyOptions = [
  { id: 'easy', label: 'Fácil' },
  { id: 'medium', label: 'Intermedio' },
  { id: 'hard', label: 'Difícil' },
];

const durationOptions = [5, 10, 15, 20, 30];

export default function RoomCreation({ teacher, onRoomCreated, onBack }: RoomCreationProps) {
  const [roomName, setRoomName] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');
  const [duration, setDuration] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => {
    return Boolean(roomName && selectedGame && difficulty);
  }, [roomName, selectedGame, difficulty]);

  const handleSubmit = () => {
    if (!isValid || !difficulty) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newRoom: Room = {
        id: Date.now().toString(),
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: roomName,
        game: selectedGame,
        difficulty,
        duration,
        teacher,
        students: [],
        isActive: false,
      };

      onRoomCreated(newRoom);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear nueva sala</Text>
        <Text style={styles.subtitle}>Hola {teacher.name}, completa la información para tu sesión.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Detalles de la sala</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Nombre de la sala</Text>
          <TextInput
            style={styles.input}
            value={roomName}
            onChangeText={setRoomName}
            placeholder="Ej: Clase 3°A - Fonología"
            placeholderTextColor={palette.muted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Selecciona un juego</Text>
          <View style={styles.optionList}>
            {gameOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionButton, selectedGame === option.id && styles.optionButtonActive]}
                onPress={() => setSelectedGame(option.id)}
              >
                <Text
                  style={[styles.optionText, selectedGame === option.id && styles.optionTextActive]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nivel de dificultad</Text>
          <View style={styles.optionRow}>
            {difficultyOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.chip, difficulty === option.id && styles.chipActive]}
                onPress={() => setDifficulty(option.id as typeof difficulty)}
              >
                <Text style={[styles.chipText, difficulty === option.id && styles.chipTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Duración (minutos)</Text>
          <View style={styles.optionRow}>
            {durationOptions.map((value) => (
              <TouchableOpacity
                key={value}
                style={[styles.chip, duration === value && styles.chipActive]}
                onPress={() => setDuration(value)}
              >
                <Text style={[styles.chipText, duration === value && styles.chipTextActive]}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.primaryButton, (!isValid || isSubmitting) && styles.disabledButton]}
          disabled={!isValid || isSubmitting}
          onPress={handleSubmit}
        >
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Creando sala...' : 'Crear sala'}</Text>
        </TouchableOpacity>

        <TouchableOpacity accessibilityRole="button" onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: palette.background,
  },
  header: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
  field: {
    gap: 12,
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
    fontSize: 16,
    color: palette.text,
  },
  optionList: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: palette.surface,
  },
  optionButtonActive: {
    borderColor: palette.primary,
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    color: palette.text,
    fontWeight: '600',
  },
  optionTextActive: {
    color: palette.primary,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: palette.primary,
    backgroundColor: '#EEF2FF',
  },
  chipText: {
    color: palette.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: palette.primary,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: palette.primaryOn,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});
