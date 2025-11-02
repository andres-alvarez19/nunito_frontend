import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { palette, withAlpha } from "@/theme/colors";
import type { Teacher } from "@/features/home/types";

interface TeacherLoginProps {
  onLogin: (teacher: Teacher) => void;
  onBack: () => void;
}

type Mode = "login" | "register";

export default function TeacherLogin({ onLogin, onBack }: TeacherLoginProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = () => {
    if (
      mode === "register" &&
      registerForm.password !== registerForm.confirmPassword
    ) {
      Alert.alert(
        "Contraseñas distintas",
        "Las contraseñas no coinciden. Vuelve a intentarlo.",
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const payload =
        mode === "login"
          ? { name: "Profesor Demo", email: loginForm.email }
          : {
              name: registerForm.name || "Profesor Nuevo",
              email: registerForm.email,
            };

      onLogin(payload);
      setIsLoading(false);
    }, 600);
  };

  const toggleMode = (newMode: Mode) => {
    setMode(newMode);
    setShowPassword(false);
  };

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.title}>Acceso para Profesores</Text>
        <Text style={styles.subtitle}>
          Inicia sesión o crea tu cuenta para administrar las salas virtuales.
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.tab, mode === "login" && styles.activeTab]}
            onPress={() => toggleMode("login")}
          >
            <Text
              style={[styles.tabText, mode === "login" && styles.activeTabText]}
            >
              Iniciar sesión
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.tab, mode === "register" && styles.activeTab]}
            onPress={() => toggleMode("register")}
          >
            <Text
              style={[
                styles.tabText,
                mode === "register" && styles.activeTabText,
              ]}
            >
              Registrarse
            </Text>
          </TouchableOpacity>
        </View>

        {mode === "login" ? (
          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                accessibilityLabel="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                value={loginForm.email}
                onChangeText={(value) =>
                  setLoginForm((prev) => ({ ...prev, email: value }))
                }
                placeholder="profesor@escuela.cl"
                placeholderTextColor={palette.muted}
              />
            </View>
            <View>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                accessibilityLabel="Contraseña"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={loginForm.password}
                onChangeText={(value) =>
                  setLoginForm((prev) => ({ ...prev, password: value }))
                }
                placeholder="••••••••"
                placeholderTextColor={palette.muted}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Text style={styles.link}>
                  {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                accessibilityLabel="Nombre completo"
                style={styles.input}
                value={registerForm.name}
                onChangeText={(value) =>
                  setRegisterForm((prev) => ({ ...prev, name: value }))
                }
                placeholder="María González"
                placeholderTextColor={palette.muted}
              />
            </View>
            <View>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                accessibilityLabel="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                value={registerForm.email}
                onChangeText={(value) =>
                  setRegisterForm((prev) => ({ ...prev, email: value }))
                }
                placeholder="profesor@escuela.cl"
                placeholderTextColor={palette.muted}
              />
            </View>
            <View>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                accessibilityLabel="Contraseña"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={registerForm.password}
                onChangeText={(value) =>
                  setRegisterForm((prev) => ({ ...prev, password: value }))
                }
                placeholder="••••••••"
                placeholderTextColor={palette.muted}
              />
            </View>
            <View>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                accessibilityLabel="Confirmar contraseña"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={registerForm.confirmPassword}
                onChangeText={(value) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    confirmPassword: value,
                  }))
                }
                placeholder="••••••••"
                placeholderTextColor={palette.muted}
              />
            </View>
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Text style={styles.link}>
                {showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={palette.primaryOn} />
          ) : (
            <View style={styles.primaryButtonContent}>
              <Feather
                name={mode === "login" ? "log-in" : "user-plus"}
                size={18}
                color={palette.primaryOn}
              />
              <Text style={styles.primaryButtonText}>
                {mode === "login" ? "Iniciar sesión" : "Registrarse"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={onBack}
        >
          <Feather name="arrow-left" size={18} color={palette.primary} />
          <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
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
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: "#00000022",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: palette.muted,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: withAlpha(palette.primary, 0.08),
    padding: 4,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: palette.primary,
    shadowColor: "#0000001a",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.muted,
  },
  activeTabText: {
    color: palette.primaryOn,
  },
  form: {
    gap: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.text,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: palette.text,
    backgroundColor: withAlpha(palette.primary, 0.02),
  },
  link: {
    marginTop: 6,
    color: palette.primary,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00000022",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    color: palette.primaryOn,
    fontWeight: "700",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.primary,
    backgroundColor: withAlpha(palette.primary, 0.04),
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: "600",
    fontSize: 15,
  },
  primaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
