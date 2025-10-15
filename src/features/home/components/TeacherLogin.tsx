import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { palette } from '@/theme/colors';
import type { Teacher } from '@/features/home/types';

interface TeacherLoginProps {
  onLogin: (teacher: Teacher) => void;
  onBack: () => void;
}

type Mode = 'login' | 'register';

export default function TeacherLogin({ onLogin, onBack }: TeacherLoginProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = () => {
    if (mode === 'register' && registerForm.password !== registerForm.confirmPassword) {
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const payload =
        mode === 'login'
          ? { name: 'Profesor Demo', email: loginForm.email }
          : { name: registerForm.name || 'Profesor Nuevo', email: registerForm.email };

      onLogin(payload);
      setIsLoading(false);
    }, 600);
  };

  const toggleMode = (newMode: Mode) => {
    setMode(newMode);
    setShowPassword(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>Acceso para Profesores</Text>
        <Text style={styles.subtitle}>
          Inicia sesión o crea tu cuenta para administrar las salas virtuales.
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.tab, mode === 'login' && styles.activeTab]}
            onPress={() => toggleMode('login')}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.tab, mode === 'register' && styles.activeTab]}
            onPress={() => toggleMode('register')}
          >
            <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        {mode === 'login' ? (
          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                accessibilityLabel="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                value={loginForm.email}
                onChangeText={(value) => setLoginForm((prev) => ({ ...prev, email: value }))}
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
                onChangeText={(value) => setLoginForm((prev) => ({ ...prev, password: value }))}
                placeholder="••••••••"
                placeholderTextColor={palette.muted}
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                <Text style={styles.link}>{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</Text>
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
                onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, name: value }))}
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
                onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, email: value }))}
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
                onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, password: value }))}
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
                onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, confirmPassword: value }))}
                placeholder="••••••••"
                placeholderTextColor={palette.muted}
              />
            </View>
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Text style={styles.link}>{showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color={palette.primaryOn} /> : <Text style={styles.primaryButtonText}>Continuar</Text>}
        </TouchableOpacity>

        <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 24,
    gap: 20,
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.text,
  },
  subtitle: {
    fontSize: 14,
    color: palette.muted,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 999,
    backgroundColor: palette.border,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: palette.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },
  activeTabText: {
    color: palette.primaryOn,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: palette.text,
    backgroundColor: '#FAFAFA',
  },
  link: {
    marginTop: 6,
    color: palette.primary,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: palette.primaryOn,
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
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
