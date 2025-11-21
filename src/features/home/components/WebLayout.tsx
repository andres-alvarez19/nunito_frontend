import type { ReactNode } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette, withAlpha } from "@/theme/colors";

interface WebLayoutProps {
  children: ReactNode;
  /**
   * Cuando es true, el layout envuelve el contenido en un ScrollView.
   * Úsalo en pantallas sin ScrollView propio. Por defecto: true.
   */
  scrollable?: boolean;
  /**
   * Cuando es true, el contenido ocupa todo el ancho disponible
   * (sin maxWidth centrado). Útil para layouts con sidebar.
   */
  fullWidth?: boolean;
  /**
   * Acción al hacer clic en el logo de la barra superior.
   */
  onLogoPress?: () => void;
}

export default function WebLayout({
  children,
  scrollable = true,
  fullWidth = false,
  onLogoPress,
}: WebLayoutProps) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  const insets = useSafeAreaInsets();

  const headerPadding = {
    paddingTop: insets.top + 16,
    paddingBottom: 16,
    paddingLeft: 24 + insets.left,
    paddingRight: 24 + insets.right,
  };

  const contentPadding = {
    paddingTop: 24,
    paddingBottom: 40 + insets.bottom,
    paddingLeft: 24 + insets.left,
    paddingRight: 24 + insets.right,
  };

  const content = (
    <View
      className={`flex-1 w-full ${fullWidth ? "items-stretch" : "items-center"}`}
      style={contentPadding}
    >
      <View
        className={`w-full flex-1 gap-6 ${fullWidth ? "max-w-full" : "max-w-[896px]"}`}
      >
        {children}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <View
        className="border-b shadow-md bg-primary"
        style={{
          ...headerPadding,
          borderBottomColor: withAlpha(palette.primaryOn, 0.25),
        }}
      >
        <View className="flex-col items-start gap-4 md:flex-row md:items-center">
          <TouchableOpacity
            className="flex-row items-center gap-3"
            activeOpacity={0.85}
            onPress={onLogoPress}
            disabled={!onLogoPress}
          >
            <Image
              source={require("../../../../assets/images/nunito_logo.png")}
              style={{ width: 140, height: 48 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-extrabold tracking-tight">
              <Text style={{ color: "#E4483F" }}>N</Text>
              <Text style={{ color: "#F4A71D" }}>u</Text>
              <Text style={{ color: "#3F9D4C" }}>n</Text>
              <Text style={{ color: "#1E88E5" }}>i</Text>
              <Text style={{ color: "#F4A71D" }}>t</Text>
              <Text style={{ color: "#3F9D4C" }}>o</Text>
            </Text>
          </TouchableOpacity>
          <View
            className="hidden md:flex h-10 border-l"
            style={{ borderColor: withAlpha(palette.primaryOn, 0.35) }}
          />
          <View className="flex-1 gap-1">
            <Text
              className="text-base font-semibold text-primaryOn"
            >
              Mini juegos para conciencia fonológica
            </Text>
            <Text style={{ color: withAlpha(palette.primaryOn, 0.8) }}>
              Programa de Integración Escolar
            </Text>
          </View>
        </View>
      </View>

      {scrollable ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View className="flex-1">{content}</View>
      )}
    </View>
  );
}
