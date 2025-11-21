import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { palette } from "@/theme/colors";
import NunitoButton from "@/features/home/components/NunitoButton";

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onNavigateToRegister: () => void;
    onBack: () => void;
}

export default function LoginScreen({
    onLoginSuccess,
    onNavigateToRegister,
    onBack,
}: LoginScreenProps) {
    const { login, loading, user } = useAuth();
    const { error: showError, success: showSuccess } = useNotification();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Watch for authentication success
    useEffect(() => {
        if (isLoggingIn && user) {
            console.log("User authenticated, calling onLoginSuccess");
            setIsLoggingIn(false);
            showSuccess("¡Sesión iniciada correctamente!");
            onLoginSuccess();
        }
    }, [user, isLoggingIn, onLoginSuccess, showSuccess]);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            showError("Por favor completa todos los campos");
            return;
        }

        try {
            setIsLoggingIn(true);
            await login({ email: email.trim(), password });
            // onLoginSuccess will be called by useEffect when user state updates
        } catch (error: any) {
            setIsLoggingIn(false);
            showError(error.message || "No se pudo iniciar sesión");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
            style={{ backgroundColor: palette.background }}
        >
            <ScrollView
                contentContainerClassName="flex-grow justify-center p-6"
                keyboardShouldPersistTaps="handled"
            >
                {/* Back Button */}
                <Pressable
                    className="flex-row items-center gap-2 mb-8 active:opacity-70"
                    onPress={onBack}
                >
                    <Feather name="arrow-left" size={20} color={palette.primary} />
                    <Text className="text-base font-semibold text-primary">
                        Volver
                    </Text>
                </Pressable>

                {/* Header */}
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-text mb-2">
                        Iniciar Sesión
                    </Text>
                    <Text className="text-base text-muted">
                        Accede a tu cuenta de profesor
                    </Text>
                </View>

                {/* Form */}
                <View className="gap-4 mb-6">
                    {/* Email */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">
                            Correo Electrónico
                        </Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="ejemplo@correo.com"
                            placeholderTextColor={palette.muted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            editable={!loading}
                        />
                    </View>

                    {/* Password */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">
                            Contraseña
                        </Text>
                        <View className="relative">
                            <TextInput
                                className="rounded-xl border border-border bg-surface px-4 py-3 pr-12 text-base text-text"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor={palette.muted}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete="password"
                                editable={!loading}
                            />
                            <Pressable
                                className="absolute right-4 top-3.5 active:opacity-70"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Feather
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color={palette.muted}
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Login Button */}
                <NunitoButton onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={palette.primaryOn} />
                    ) : (
                        <Text className="text-base font-bold text-primaryOn">
                            Iniciar Sesión
                        </Text>
                    )}
                </NunitoButton>

                {/* Register Link */}
                <View className="flex-row justify-center items-center mt-6 gap-1">
                    <Text className="text-sm text-muted">
                        ¿No tienes cuenta?
                    </Text>
                    <Pressable
                        onPress={onNavigateToRegister}
                        disabled={loading}
                        className="active:opacity-70"
                    >
                        <Text className="text-sm font-semibold text-primary">
                            Regístrate
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
