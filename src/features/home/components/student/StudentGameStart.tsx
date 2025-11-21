import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette, withAlpha } from '@/theme/colors';

interface StudentGameStartProps {
    gameName: string;
    difficulty: string;
    timeLimit: number; // in seconds
    onStart: () => void;
}

export default function StudentGameStart({ gameName, difficulty, timeLimit, onStart }: StudentGameStartProps) {
    // Mock color theme for "mint" as per dashboard example
    const theme = {
        color: 'mint',
        container: palette.mintContainer, // Assuming these exist or similar
        accent: palette.mint,
        onAccent: palette.mintOn,
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
            {/* Game Status Card */}
            <View
                className="rounded-xl border overflow-hidden shadow-sm"
                style={{
                    backgroundColor: theme.container,
                    borderColor: theme.accent,
                    shadowColor: theme.accent,
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 2
                }}
            >
                <View className="p-6 pb-4 flex-row justify-between items-start">
                    <View>
                        <Text className="text-2xl font-bold mb-1" style={{ color: theme.accent }}>
                            {gameName}
                        </Text>
                        <Text className="text-lg" style={{ color: palette.text }}>
                            Nivel: {difficulty}
                        </Text>
                    </View>
                    <View className="px-4 py-2 rounded-full bg-white/50">
                        <Text className="font-bold" style={{ color: theme.accent }}>Activo</Text>
                    </View>
                </View>

                <View className="px-6 py-4 gap-4">
                    <View className="flex-row items-center gap-4">
                        <Feather name="clock" size={24} color={palette.primary} />
                        <View className="flex-1">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-sm font-medium" style={{ color: palette.text }}>Tiempo restante</Text>
                                <Text className="text-lg font-mono font-bold" style={{ color: palette.text }}>
                                    {formatTime(timeLimit)}
                                </Text>
                            </View>
                            {/* Progress Bar Placeholder - Full since it hasn't started counting down for student yet in this view */}
                            <View className="h-3 rounded-full bg-white/50 overflow-hidden">
                                <View className="h-full w-full bg-primary" />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={onStart}
                        className="w-full py-4 rounded-xl flex-row items-center justify-center gap-3 mt-2"
                        style={{ backgroundColor: palette.primary }}
                    >
                        <Feather name="zap" size={24} color={palette.primaryOn} />
                        <Text className="text-xl font-bold" style={{ color: palette.primaryOn }}>
                            ¡Comenzar a Jugar!
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Motivation Cards Grid */}
            <View className="flex-row flex-wrap gap-4">
                <MotivationCard
                    icon="trophy"
                    iconColor="#eab308" // yellow-500
                    title="¡Tú puedes!"
                    subtitle="Haz tu mejor esfuerzo"
                />
                <MotivationCard
                    icon="star"
                    iconColor="#3b82f6" // blue-500
                    title="Aprende jugando"
                    subtitle="Cada respuesta te ayuda a crecer"
                />
                <MotivationCard
                    icon="heart"
                    iconColor="#ef4444" // red-500
                    title="Diviértete"
                    subtitle="Lo importante es participar"
                />
            </View>

            {/* Instructions Card */}
            <View
                className="rounded-xl border p-6 shadow-sm bg-surface"
                style={{ borderColor: palette.border }}
            >
                <Text className="text-lg font-bold mb-4" style={{ color: palette.text }}>
                    Instrucciones del Juego
                </Text>
                <View className="gap-4">
                    <InstructionStep number={1} text="Observa cuidadosamente cada imagen que aparezca en pantalla" />
                    <InstructionStep number={2} text="Lee todas las opciones de palabras disponibles" />
                    <InstructionStep number={3} text="Selecciona la palabra que mejor corresponda a la imagen" />
                    <InstructionStep number={4} text="Recibirás retroalimentación inmediata sobre tu respuesta" />
                </View>
            </View>
        </ScrollView>
    );
}

function MotivationCard({ icon, iconColor, title, subtitle }: { icon: any, iconColor: string, title: string, subtitle: string }) {
    return (
        <View
            className="flex-1 min-w-[150px] p-6 items-center rounded-xl border bg-surface shadow-sm"
            style={{ borderColor: palette.border }}
        >
            <Feather name={icon} size={48} color={iconColor} style={{ marginBottom: 12 }} />
            <Text className="text-lg font-bold text-center mb-1" style={{ color: palette.text }}>{title}</Text>
            <Text className="text-sm text-center" style={{ color: palette.muted }}>{subtitle}</Text>
        </View>
    );
}

function InstructionStep({ number, text }: { number: number, text: string }) {
    return (
        <View className="flex-row items-start gap-3">
            <View
                className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
                style={{ backgroundColor: palette.primary }}
            >
                <Text className="text-xs font-bold" style={{ color: palette.primaryOn }}>{number}</Text>
            </View>
            <Text className="flex-1 text-base" style={{ color: palette.text }}>{text}</Text>
        </View>
    );
}
