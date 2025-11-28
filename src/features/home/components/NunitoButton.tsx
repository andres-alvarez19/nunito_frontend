import type { ReactNode } from "react";
import { StyleProp, ViewStyle, View, Pressable } from "react-native";

import { palette } from "@/theme/colors";

interface NunitoButtonProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * Estilos adicionales para el contenedor externo.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Estilos adicionales para el área clicable interna.
   */
  contentStyle?: StyleProp<ViewStyle>;
}

export default function NunitoButton({
  children,
  onPress,
  disabled,
  style,
  contentStyle,
}: NunitoButtonProps) {
  return (
    <View
      className="w-full rounded-xl p-1.5 justify-center items-stretch bg-surfaceMuted"
      style={style}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        className={`min-h-10 w-full self-stretch rounded-lg px-4 py-2 flex-row items-center justify-center gap-2 bg-primary border border-primary/20 ${disabled ? "opacity-60" : "opacity-100"} active:opacity-70`}
        style={[
          // { elevation: 4 }, // Android shadow - Removed for debugging
          contentStyle
        ]}
      >
        {children}
      </Pressable>
    </View>
  );
}
