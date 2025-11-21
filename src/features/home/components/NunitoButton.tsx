import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { TouchableOpacity, View } from "react-native";

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
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        className={`min-h-10 w-full self-stretch rounded-lg px-4 py-2 flex-row items-center justify-center gap-2 shadow-sm bg-primary ${disabled ? "opacity-60" : "opacity-100"}`}
        style={contentStyle}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
}
