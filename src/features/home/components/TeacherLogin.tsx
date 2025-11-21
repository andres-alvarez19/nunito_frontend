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

import NunitoButton from "@/features/home/components/NunitoButton";
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
          Inicia sesión o regístrate para crear salas virtuales.
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
              <View style={styles.passwordInputContainer}>
                <TextInput
                  accessibilityLabel="Contraseña"
                  secureTextEntry={!showPassword}
                  style={[styles.input, { paddingRight: 40 }]}
                  value={loginForm.password}
                  onChangeText={(value) =>
                    setLoginForm((prev) => ({ ...prev, password: value }))
                  }
                  placeholder="••••••••"
                  placeholderTextColor={palette.muted}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={palette.muted} />
                </TouchableOpacity>
              </View>
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
              <View style={styles.passwordInputContainer}>
                <TextInput
                  accessibilityLabel="Contraseña"
                  secureTextEntry={!showPassword}
                  style={[styles.input, { paddingRight: 40 }]}
                  value={registerForm.password}
                  onChangeText={(value) =>
                    setRegisterForm((prev) => ({ ...prev, password: value }))
                  }
                  placeholder="••••••••"
                  placeholderTextColor={palette.muted}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={palette.muted} />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  accessibilityLabel="Confirmar contraseña"
                  secureTextEntry={!showPassword}
                  style={[styles.input, { paddingRight: 40 }]}
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
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={palette.muted} />
                </TouchableOpacity>
              </View>
            </View>
            {/* Eliminado el texto para mostrar/ocultar contraseñas, ahora se usa el icono de ojo */}
          </View>
        )}

        <NunitoButton
          style={isLoading && styles.disabledButton}
          contentStyle={styles.primaryButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={palette.muted} />
          ) : (
            <View style={styles.primaryButtonContent}>
              <Feather
                name={mode === "login" ? "log-in" : "user-plus"}
                size={18}
                color={palette.background}
              />
              <Text style={styles.primaryButtonText}>
                {mode === "login" ? "Iniciar sesión" : "Registrarse"}
              </Text>
            </View>
          )}
        </NunitoButton>

        <NunitoButton contentStyle={[styles.secondaryButton, { backgroundColor: "#FFFFFF", borderColor: palette.border, borderWidth: 1, shadowColor: "transparent", shadowOpacity: 0, elevation: 0 }]}> 
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.secondaryButtonInner}
            onPress={onBack}
          >
            <Feather name="arrow-left" size={18} color={palette.background} />
            <Text style={[styles.secondaryButtonText, { color: "#6b6b6b" }]}>Volver al inicio</Text>
          </TouchableOpacity>
        </NunitoButton>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
    passwordInputContainer: {
      position: "relative",
      justifyContent: "center",
    },
    eyeIcon: {
      position: "absolute",
      right: 12,
      top: "50%",
      marginTop: -15,
      padding: 4,
      zIndex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
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
    borderRadius: 12,
    backgroundColor: palette.surfaceMuted,
    padding: 3,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: palette.background,
    shadowColor: "rgba(0, 0, 0, 0.10)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.text,
  },
  activeTabText: {
    color: palette.text,
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
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: palette.text,
    backgroundColor: palette.surface,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  link: {
    marginTop: 6,
    color: palette.primary,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#197870",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.primary,
    backgroundColor: withAlpha(palette.primary, 0.04),
  },
  secondaryButtonInner: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
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
