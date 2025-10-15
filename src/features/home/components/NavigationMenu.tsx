import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette } from '@/theme/colors';

interface NavigationMenuProps {
  userType: 'teacher' | 'student';
  userName: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

const teacherSections = [
  { id: 'rooms', label: 'Gestionar salas' },
  { id: 'reports', label: 'Ver reportes' },
];

const studentSections = [
  { id: 'dashboard', label: 'Mi sala' },
];

export default function NavigationMenu({ userType, userName, onNavigate, onLogout }: NavigationMenuProps) {
  const sections = userType === 'teacher' ? teacherSections : studentSections;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Hola, {userName}</Text>
        <Text style={styles.subtitle}>
          {userType === 'teacher'
            ? 'Selecciona una opción para continuar con tus clases.'
            : 'Explora las actividades disponibles para tu sala.'}
        </Text>
      </View>

      <View style={styles.card}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={styles.menuButton}
            onPress={() => onNavigate(section.id)}
          >
            <Text style={styles.menuButtonText}>{section.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity accessibilityRole="button" style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 24,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 16,
    color: palette.muted,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#00000022',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  menuButton: {
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  menuButtonText: {
    color: palette.primaryOn,
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: palette.primary,
    fontWeight: '600',
  },
});
