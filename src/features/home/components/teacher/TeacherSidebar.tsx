import type { ReactNode } from "react";
import { Text, View } from "react-native";

import NunitoButton from "@/features/home/components/NunitoButton";
import { palette, withAlpha } from "@/theme/colors";

export type TeacherSectionId = "home" | "rooms" | "reports" | "questions" | "settings";

export interface TeacherSidebarItem {
  id: TeacherSectionId;
  label: string;
}

interface TeacherSidebarProps {
  activeSection: TeacherSectionId;
  onSelectSection: (id: TeacherSectionId) => void;
  onLogout: () => void;
  footer?: ReactNode;
}

const ITEMS: TeacherSidebarItem[] = [
  { id: "home", label: "Inicio" },
  { id: "rooms", label: "Mis Salas" },
  { id: "reports", label: "Reportes" },
  { id: "questions", label: "Gestionar Preguntas" },
  { id: "settings", label: "Configuración" },
];

export default function TeacherSidebar({
  activeSection,
  onSelectSection,
  onLogout,
  footer,
}: TeacherSidebarProps) {
  return (
    <View className="w-[268px] bg-surface rounded-2xl py-5 px-4 border border-border shadow-sm justify-between">
      <View className="gap-3">
        {ITEMS.map((item) => {
          const isActive = item.id === activeSection;
          return (
            <NunitoButton
              key={item.id}
              style={{ borderRadius: 10 }}
              contentStyle={[
                {
                  borderRadius: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  backgroundColor: isActive ? palette.primary : palette.surface,
                  borderWidth: 1,
                  borderColor: isActive ? palette.primary : withAlpha(palette.border, 0.8),
                }
              ]}
              onPress={() => onSelectSection(item.id)}
            >
              <Text
                className={`text-base text-center ${isActive ? "text-primaryOn font-semibold" : "text-text"}`}
              >
                {item.label}
              </Text>
            </NunitoButton>
          );
        })}
        <View className="h-px mt-2 mb-1 bg-border/80" />
        <NunitoButton onPress={onLogout}>
          <Text className="text-base font-semibold text-primaryOn">Cerrar sesión</Text>
        </NunitoButton>
      </View>
      {footer ? <View className="mt-4">{footer}</View> : null}
    </View>
  );
}

const styles = {};
