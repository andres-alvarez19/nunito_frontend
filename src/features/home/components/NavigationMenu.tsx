import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  gameDefinitions,
  gameThemeTokens,
} from "@/features/home/constants/games";
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

const teacherMenuItems: MenuItem[] = [
  { id: "home", label: "Inicio", description: "Panel principal" },
  { id: "rooms", label: "Mis Salas", description: "Gestiona salas activas" },
  {
    id: "reports",
    label: "Reportes",
    description: "Resultados y estadísticas",
  },
  { id: "settings", label: "Configuración", description: "Ajustes de cuenta" },
];

const studentMenuItems: MenuItem[] = [
  { id: "home", label: "Inicio", description: "Información de la sala" },
  { id: "games", label: "Juegos", description: "Ver actividades disponibles" },
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

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    onNavigate(sectionId);
  };

  const renderTeacherSection = () => {
    switch (activeSection) {
      case "home":
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.panelTitle}>Panel del Profesor</Text>
            <Text style={styles.panelSubtitle}>
              Desde aquí puedes crear salas, gestionar actividades y ver
              reportes de tus estudiantes.
            </Text>
            <View style={styles.highlightGrid}>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightTitle}>Crear Nueva Sala</Text>
                <Text style={styles.highlightDescription}>
                  Configura una nueva sesión de juegos educativos.
                </Text>
              </View>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightTitle}>Ver Reportes</Text>
                <Text style={styles.highlightDescription}>
                  Revisa el progreso y resultados de tus estudiantes.
                </Text>
              </View>
            </View>
          </View>
        );
      case "rooms":
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.panelTitle}>Mis Salas</Text>
            <Text style={styles.panelSubtitle}>
              Mantén el control de las salas activas y planifica nuevas sesiones
              para tu curso.
            </Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                Aún no hay salas activas
              </Text>
              <Text style={styles.emptyStateDescription}>
                Crea una sala desde el panel principal para comenzar una
                actividad con tus estudiantes.
              </Text>
            </View>
          </View>
        );
      case "reports":
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.panelTitle}>Reportes y estadísticas</Text>
            <Text style={styles.panelSubtitle}>
              Los reportes aparecerán aquí una vez que tus estudiantes completen
              actividades.
            </Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                Sin reportes disponibles
              </Text>
              <Text style={styles.emptyStateDescription}>
                Invita a tus estudiantes a jugar para generar reportes de
                desempeño y progreso.
              </Text>
            </View>
          </View>
        );
      case "settings":
      default:
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.panelTitle}>Información de la cuenta</Text>
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>{userName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tipo de usuario</Text>
                <Text style={styles.infoValue}>Profesor</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  const renderStudentSection = () => {
    switch (activeSection) {
      case "games":
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.panelTitle}>Juegos disponibles</Text>
            <Text style={styles.panelSubtitle}>
              Explora los mini juegos que podrás disfrutar con tu curso.
            </Text>
            <View style={styles.gameList}>
              {gameDefinitions.map((game) => {
                const theme = gameThemeTokens[game.color];
                return (
                  <View
                    key={game.id}
                    style={[
                      styles.studentGameCard,
                      {
                        backgroundColor: theme.container,
                        borderColor: withAlpha(theme.accent, 0.4),
                      },
                    ]}
                  >
                    <Text
                      style={[styles.studentGameTitle, { color: theme.accent }]}
                    >
                      {game.name}
                    </Text>
                    <Text style={styles.studentGameDescription}>
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
          <View style={styles.sectionCard}>
            <Text style={styles.panelTitle}>Panel del Estudiante</Text>
            <Text style={styles.panelSubtitle}>
              Ingresa el código de tu sala y prepárate para divertirte
              aprendiendo con tus compañeros.
            </Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>¿Listo para jugar?</Text>
              <Text style={styles.emptyStateDescription}>
                Pídele a tu profesor el código de la sala y selecciónalo desde
                la pantalla principal.
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Image
            source={require("../../../../assets/images/nunito_logo.png")}
            style={styles.logo}
          />
          <View style={styles.headerDivider} />
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerGreeting}>Hola, {userName}</Text>
            <Text style={styles.headerSubtitle}>
              {userType === "teacher" ? "Profesor" : "Estudiante"} de Nunito
            </Text>
          </View>
          <View
            style={[
              styles.roleBadge,
              userType === "teacher"
                ? styles.roleBadgeTeacher
                : styles.roleBadgeStudent,
            ]}
          >
            <Text style={styles.roleBadgeText}>
              {userType === "teacher" ? "Profesor" : "Estudiante"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.layout}>
        <View style={styles.sidebar}>
          {menuItems.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuButton, isActive && styles.menuButtonActive]}
                onPress={() => handleSelectSection(item.id)}
              >
                <Text
                  style={[styles.menuLabel, isActive && styles.menuLabelActive]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.menuDescription,
                    isActive && styles.menuDescriptionActive,
                  ]}
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          {userType === "teacher"
            ? renderTeacherSection()
            : renderStudentSection()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  headerCard: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    shadowColor: "#0000001c",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: "contain",
  },
  headerDivider: {
    height: 40,
    borderLeftWidth: 1,
    borderLeftColor: palette.border,
  },
  headerTextGroup: {
    flex: 1,
    gap: 4,
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: palette.muted,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  roleBadgeTeacher: {
    backgroundColor: withAlpha(palette.primary, 0.12),
  },
  roleBadgeStudent: {
    backgroundColor: withAlpha(palette.accent, 0.18),
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.text,
  },
  layout: {
    gap: 20,
  },
  sidebar: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#00000012",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  menuButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: withAlpha(palette.border, 0.9),
    gap: 4,
  },
  menuButtonActive: {
    backgroundColor: withAlpha(palette.primary, 0.12),
    borderColor: palette.primary,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.text,
  },
  menuLabelActive: {
    color: palette.primary,
  },
  menuDescription: {
    fontSize: 13,
    color: palette.muted,
  },
  menuDescriptionActive: {
    color: withAlpha(palette.primary, 0.8),
  },
  logoutButton: {
    marginTop: 4,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: withAlpha(palette.primary, 0.06),
  },
  logoutText: {
    color: palette.primary,
    fontWeight: "600",
    fontSize: 15,
  },
  main: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
    shadowColor: "#00000012",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  sectionCard: {
    gap: 16,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.text,
  },
  panelSubtitle: {
    fontSize: 15,
    color: palette.muted,
  },
  highlightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  highlightCard: {
    flexBasis: "48%",
    minWidth: "48%",
    backgroundColor: withAlpha(palette.primary, 0.08),
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: withAlpha(palette.primary, 0.25),
    flexGrow: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.primary,
  },
  highlightDescription: {
    fontSize: 14,
    color: palette.muted,
  },
  emptyState: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: withAlpha(palette.muted, 0.2),
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: palette.muted,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: withAlpha(palette.border, 0.7),
  },
  infoLabel: {
    fontSize: 14,
    color: palette.muted,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: palette.text,
    fontWeight: "600",
  },
  gameList: {
    gap: 12,
  },
  studentGameCard: {
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
  },
  studentGameTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  studentGameDescription: {
    fontSize: 14,
    color: palette.text,
  },
});
