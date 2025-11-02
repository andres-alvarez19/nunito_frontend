# Safe Area

## ¿Por qué `react-native-safe-area-context`?

- Expone los insets reales del dispositivo (notch, barras de navegación, indicadores).
- Permite un manejo coherente en iOS, Android y web sin cálculos manuales.
- El provider es ligero y compatible con el modo Expo administrado.

## Implementación en Nunito

- `SafeAreaProvider` envuelve el árbol completo en `app/_layout.tsx` para que todos los componentes puedan leer los insets.
- Solo se usa un `SafeAreaView` en la raíz para evitar colisiones de paddings y mantener un único punto de ajuste.
- `StatusBar` se configura como translúcido (Expo la gestiona internamente) y se delega el relleno a los insets.

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
```

## Ejemplos con `useSafeAreaInsets()`

- Usa los insets para aplicar padding dinámico en contenedores principales.
- Ideal para headers custom, listas con scroll o modales de pantalla completa.

```tsx
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {children}
    </View>
  );
}
```

## Notas Expo vs bare React Native

- **Expo (managed)**: usa `expo install react-native-safe-area-context` para mantener versiones compatibles y sin configuración nativa adicional.
- **Bare / React Native CLI**: instala con el gestor preferido (`pnpm add react-native-safe-area-context`) y ejecuta `pod install` en iOS tras la instalación.
- En ambos casos, evita anidar múltiples `SafeAreaView`; la combinación `SafeAreaProvider` + `useSafeAreaInsets()` cubre los escenarios habituales.
