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

interface RegisterScreenProps {
    onRegisterSuccess: () => void;
    onNavigateToLogin: () => void;
    onBack: () => void;
}

export default function RegisterScreen({
    onRegisterSuccess,
    onNavigateToLogin,
    onBack,
}: RegisterScreenProps) {
    const { register, loading, user } = useAuth();
    const { error: showError, success: showSuccess } = useNotification();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // Watch for authentication success
    useEffect(() => {
        if (isRegistering && user) {
            console.log("User registered and authenticated, calling onRegisterSuccess");
            setIsRegistering(false);
            showSuccess("¡Cuenta creada exitosamente!");
            onRegisterSuccess();
        }
    }, [user, isRegistering, onRegisterSuccess, showSuccess]);

    const handleRegister = async () => {
        // Validation
        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            showError("Por favor completa todos los campos");
            return;
        }

        if (password !== confirmPassword) {
            showError("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            showError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        try {
            setIsRegistering(true);
            await register({
                name: name.trim(),
                email: email.trim(),
                password,
            });
            // onRegisterSuccess will be called by useEffect when user state updates
        } catch (error: any) {
            setIsRegistering(false);
            showError(error.message || "No se pudo registrar");
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
                        Crear Cuenta
                    </Text>
                    <Text className="text-base text-muted">
                        Regístrate como profesor
                    </Text>
                </View>

                {/* Form */}
                <View className="gap-4 mb-6">
                    {/* Name */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">
                            Nombre Completo
                        </Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={name}
                            onChangeText={setName}
                            placeholder="Juan Pérez"
                            placeholderTextColor={palette.muted}
                            autoCapitalize="words"
                            autoComplete="name"
                            editable={!loading}
                        />
                    </View>

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
                                placeholder="Mínimo 6 caracteres"
                                placeholderTextColor={palette.muted}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete="password-new"
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

                    {/* Confirm Password */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">
                            Confirmar Contraseña
                        </Text>
                        <View className="relative">
                            <TextInput
                                className="rounded-xl border border-border bg-surface px-4 py-3 pr-12 text-base text-text"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Repite tu contraseña"
                                placeholderTextColor={palette.muted}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoComplete="password-new"
                                editable={!loading}
                            />
                            <Pressable
                                className="absolute right-4 top-3.5 active:opacity-70"
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <Feather
                                    name={showConfirmPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color={palette.muted}
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Register Button */}
                <NunitoButton onPress={handleRegister} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={palette.primaryOn} />
                    ) : (
                        <Text className="text-base font-bold text-primaryOn">
                            Crear Cuenta
                        </Text>
                    )}
                </NunitoButton>

                {/* Login Link */}
                <View className="flex-row justify-center items-center mt-6 gap-1">
                    <Text className="text-sm text-muted">
                        ¿Ya tienes cuenta?
                    </Text>
                    <Pressable
                        onPress={onNavigateToLogin}
                        disabled={loading}
                        className="active:opacity-70"
                    >
                        <Text className="text-sm font-semibold text-primary">
                            Inicia Sesión
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
