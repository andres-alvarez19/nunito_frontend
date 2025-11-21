import { useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import NunitoButton from "@/features/home/components/NunitoButton";
import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";
import { palette, withAlpha } from "@/theme/colors";

export interface RoomConfig {
    name: string;
    games: string[];
    difficulty: string;
    duration: number;
}

export interface Room {
    id: string;
    code: string;
    name: string;
    games: string[];
    difficulty: string;
    duration: number;
    testSuiteId: string;
    teacher: {
        name: string;
        email: string;
    };
    students: string[];
    isActive: boolean;
}

interface RoomCreationFlowProps {
    teacherName: string;
    teacherEmail: string;
    onRoomCreated: (room: Room) => void;
    onCancel: () => void;
}

const GAMES = [
    { id: "image-word", name: "Asociación Imagen-Palabra", color: "mint" },
    { id: "syllable-count", name: "Conteo de Sílabas", color: "pastel" },
    { id: "rhyme-identification", name: "Identificación de Rimas", color: "violet" },
    { id: "audio-recognition", name: "Reconocimiento Auditivo", color: "blue" },
];

const DIFFICULTIES = [
    { value: "easy", label: "Fácil" },
    { value: "medium", label: "Intermedio" },
    { value: "hard", label: "Difícil" },
];

const DURATIONS = [
    { value: 5, label: "5 min" },
    { value: 10, label: "10 min" },
    { value: 15, label: "15 min" },
    { value: 20, label: "20 min" },
    { value: 30, label: "30 min" },
];

// Mock test suites - in real app, these would come from the question management system
const MOCK_TEST_SUITES = [
    {
        id: "1",
        name: "Prueba Fonológica Básica",
        description: "Prueba con los 4 juegos para evaluación inicial",
        games: ["image-word", "syllable-count"],
        questionCount: 24,
    },
    {
        id: "2",
        name: "Prueba Avanzada",
        description: "Prueba con enfoque en rimas y audio",
        games: ["rhyme-identification", "audio-recognition"],
        questionCount: 18,
    },
    {
        id: "3",
        name: "Evaluación Completa",
        description: "Incluye todos los juegos con preguntas variadas",
        games: ["image-word", "syllable-count", "rhyme-identification", "audio-recognition"],
        questionCount: 40,
    },
];

export default function RoomCreationFlow({
    teacherName,
    teacherEmail,
    onRoomCreated,
    onCancel,
}: RoomCreationFlowProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [roomConfig, setRoomConfig] = useState<RoomConfig>({
        name: "",
        games: [],
        difficulty: "",
        duration: 10,
    });
    const [selectedTestSuite, setSelectedTestSuite] = useState<string>("");
    const [isCreating, setIsCreating] = useState(false);

    const toggleGameSelection = (gameId: string) => {
        if (roomConfig.games.includes(gameId)) {
            setRoomConfig({
                ...roomConfig,
                games: roomConfig.games.filter((g) => g !== gameId),
            });
        } else {
            setRoomConfig({
                ...roomConfig,
                games: [...roomConfig.games, gameId],
            });
        }
    };

    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleContinueToTestSuiteSelection = () => {
        setStep(2);
    };

    const handleCreateRoom = () => {
        if (!selectedTestSuite) return;

        setIsCreating(true);

        // Simulate API call
        setTimeout(() => {
            const newRoom: Room = {
                id: Date.now().toString(),
                code: generateRoomCode(),
                name: roomConfig.name,
                games: roomConfig.games,
                difficulty: roomConfig.difficulty,
                duration: roomConfig.duration,
                testSuiteId: selectedTestSuite,
                teacher: {
                    name: teacherName,
                    email: teacherEmail,
                },
                students: [],
                isActive: false,
            };

            onRoomCreated(newRoom);
            setIsCreating(false);
        }, 1000);
    };

    const isStep1Valid =
        roomConfig.name.trim() &&
        roomConfig.games.length > 0 &&
        roomConfig.difficulty;

    // Filter test suites that have at least one game in common with selected games
    const compatibleTestSuites = MOCK_TEST_SUITES.filter((suite) =>
        suite.games.some((game) => roomConfig.games.includes(game))
    );

    if (step === 1) {
        return (
            <TeacherSectionCard
                title="Crear Nueva Sala - Paso 1 de 2"
                subtitle="Configuración de la sala"
            >
                <ScrollView className="gap-4" showsVerticalScrollIndicator={false}>
                    {/* Room Name */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">
                            Nombre de la sala
                        </Text>
                        <TextInput
                            className="rounded-xl border border-border bg-background px-4 py-3 text-base text-text"
                            value={roomConfig.name}
                            onChangeText={(text) =>
                                setRoomConfig({ ...roomConfig, name: text })
                            }
                            placeholder="Ej: Clase 3°A - Fonología"
                            placeholderTextColor={palette.muted}
                        />
                    </View>

                    {/* Game Selection */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">
                            Seleccionar juegos (al menos 1)
                        </Text>
                        <View className="gap-2">
                            {GAMES.map((game) => (
                                <Pressable
                                    key={game.id}
                                    className={`flex-row items-center gap-3 p-3 rounded-xl border ${roomConfig.games.includes(game.id)
                                            ? "bg-primary/10 border-primary"
                                            : "border-border bg-surface"
                                        }`}
                                    onPress={() => toggleGameSelection(game.id)}
                                >
                                    <View
                                        className="h-5 w-5 rounded border-2 items-center justify-center"
                                        style={{
                                            borderColor: roomConfig.games.includes(game.id)
                                                ? palette.primary
                                                : palette.border,
                                            backgroundColor: roomConfig.games.includes(game.id)
                                                ? palette.primary
                                                : "transparent",
                                        }}
                                    >
                                        {roomConfig.games.includes(game.id) && (
                                            <Feather name="check" size={14} color={palette.primaryOn} />
                                        )}
                                    </View>
                                    <Text
                                        className={`flex-1 text-base font-semibold ${roomConfig.games.includes(game.id)
                                                ? "text-primary"
                                                : "text-text"
                                            }`}
                                    >
                                        {game.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Difficulty & Duration */}
                    <View className="flex-row gap-3">
                        {/* Difficulty */}
                        <View className="flex-1 gap-2">
                            <Text className="text-sm font-semibold text-text">Dificultad</Text>
                            <View className="gap-2">
                                {DIFFICULTIES.map((diff) => (
                                    <Pressable
                                        key={diff.value}
                                        className={`p-2.5 rounded-xl border ${roomConfig.difficulty === diff.value
                                                ? "bg-primary/10 border-primary"
                                                : "border-border bg-surface"
                                            }`}
                                        onPress={() =>
                                            setRoomConfig({ ...roomConfig, difficulty: diff.value })
                                        }
                                    >
                                        <Text
                                            className={`text-sm font-medium text-center ${roomConfig.difficulty === diff.value
                                                    ? "text-primary"
                                                    : "text-text"
                                                }`}
                                        >
                                            {diff.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Duration */}
                        <View className="flex-1 gap-2">
                            <Text className="text-sm font-semibold text-text">Duración</Text>
                            <View className="gap-2">
                                {DURATIONS.map((dur) => (
                                    <Pressable
                                        key={dur.value}
                                        className={`p-2.5 rounded-xl border ${roomConfig.duration === dur.value
                                                ? "bg-primary/10 border-primary"
                                                : "border-border bg-surface"
                                            }`}
                                        onPress={() =>
                                            setRoomConfig({ ...roomConfig, duration: dur.value })
                                        }
                                    >
                                        <Text
                                            className={`text-sm font-medium text-center ${roomConfig.duration === dur.value
                                                    ? "text-primary"
                                                    : "text-text"
                                                }`}
                                        >
                                            {dur.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Selected Games Preview */}
                    {roomConfig.games.length > 0 && (
                        <View className="p-4 bg-surfaceMuted/50 rounded-xl border border-border">
                            <Text className="text-sm font-semibold text-text mb-2">
                                Juegos seleccionados ({roomConfig.games.length}):
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {roomConfig.games.map((gameId) => {
                                    const gameData = GAMES.find((g) => g.id === gameId);
                                    if (!gameData) return null;
                                    return (
                                        <View
                                            key={gameId}
                                            className="px-3 py-1.5 rounded-lg"
                                            style={{
                                                backgroundColor: withAlpha(
                                                    (palette[gameData.color as keyof typeof palette] as string) ||
                                                    palette.primary,
                                                    0.2
                                                ),
                                            }}
                                        >
                                            <Text className="text-sm font-semibold text-primary">
                                                {gameData.name}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Actions */}
                <View className="flex-row gap-3 mt-4">
                    <View className="flex-1">
                        <NunitoButton
                            onPress={handleContinueToTestSuiteSelection}
                            disabled={!isStep1Valid}
                        >
                            <View className="flex-row items-center gap-2">
                                <Text className="text-base font-bold text-primaryOn">
                                    Continuar
                                </Text>
                                <Feather name="arrow-right" size={18} color={palette.primaryOn} />
                            </View>
                        </NunitoButton>
                    </View>
                    <View className="flex-1">
                        <NunitoButton
                            onPress={onCancel}
                            contentStyle={{ backgroundColor: palette.surface }}
                        >
                            <Text className="text-base font-semibold text-text">Cancelar</Text>
                        </NunitoButton>
                    </View>
                </View>
            </TeacherSectionCard>
        );
    }

    // Step 2: Test Suite Selection
    return (
        <TeacherSectionCard
            title="Crear Nueva Sala - Paso 2 de 2"
            subtitle="Seleccionar conjunto de preguntas"
        >
            <Pressable
                className="flex-row items-center gap-2 mb-4 active:opacity-70"
                onPress={() => setStep(1)}
            >
                <Feather name="arrow-left" size={20} color={palette.primary} />
                <Text className="text-base font-semibold text-primary">
                    Volver a configuración
                </Text>
            </Pressable>

            <ScrollView className="gap-3" showsVerticalScrollIndicator={false}>
                <Text className="text-base text-text mb-2">
                    Selecciona el conjunto de preguntas que se usará en esta sala:
                </Text>

                {compatibleTestSuites.length === 0 ? (
                    <View className="p-6 bg-surfaceMuted/50 rounded-xl border border-border items-center">
                        <Feather name="alert-circle" size={48} color={palette.muted} />
                        <Text className="text-base text-text text-center mt-3">
                            No hay conjuntos de preguntas compatibles con los juegos seleccionados.
                        </Text>
                        <Text className="text-sm text-muted text-center mt-2">
                            Crea un conjunto de preguntas en "Gestionar Preguntas" o vuelve atrás para cambiar los juegos.
                        </Text>
                    </View>
                ) : (
                    compatibleTestSuites.map((suite) => (
                        <Pressable
                            key={suite.id}
                            className={`p-4 rounded-xl border-2 active:scale-[0.98] ${selectedTestSuite === suite.id
                                    ? "bg-primary/10 border-primary"
                                    : "border-border bg-surface"
                                }`}
                            onPress={() => setSelectedTestSuite(suite.id)}
                        >
                            <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-1">
                                    <Text
                                        className={`text-lg font-bold ${selectedTestSuite === suite.id
                                                ? "text-primary"
                                                : "text-text"
                                            }`}
                                    >
                                        {suite.name}
                                    </Text>
                                    <Text className="text-sm text-muted mt-1">
                                        {suite.description}
                                    </Text>
                                </View>
                                <View
                                    className="h-6 w-6 rounded-full border-2 items-center justify-center"
                                    style={{
                                        borderColor:
                                            selectedTestSuite === suite.id
                                                ? palette.primary
                                                : palette.border,
                                        backgroundColor:
                                            selectedTestSuite === suite.id
                                                ? palette.primary
                                                : "transparent",
                                    }}
                                >
                                    {selectedTestSuite === suite.id && (
                                        <View className="h-3 w-3 rounded-full bg-primaryOn" />
                                    )}
                                </View>
                            </View>

                            <View className="flex-row items-center gap-2 mt-2">
                                <Text className="text-xs text-muted">
                                    {suite.questionCount} preguntas
                                </Text>
                                <Text className="text-xs text-muted">•</Text>
                                <Text className="text-xs text-muted">
                                    {suite.games.length} juego{suite.games.length !== 1 ? "s" : ""}
                                </Text>
                            </View>

                            <View className="flex-row flex-wrap gap-2 mt-2">
                                {suite.games.map((gameId) => {
                                    const game = GAMES.find((g) => g.id === gameId);
                                    if (!game) return null;
                                    const isSelected = roomConfig.games.includes(gameId);
                                    return (
                                        <View
                                            key={gameId}
                                            className={`px-2 py-1 rounded ${isSelected ? "bg-primary/20" : "bg-surfaceMuted/50"
                                                }`}
                                        >
                                            <Text
                                                className={`text-xs font-medium ${isSelected ? "text-primary" : "text-muted"
                                                    }`}
                                            >
                                                {game.name}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </Pressable>
                    ))
                )}
            </ScrollView>

            {/* Actions */}
            <View className="flex-row gap-3 mt-4">
                <View className="flex-1">
                    <NunitoButton
                        onPress={handleCreateRoom}
                        disabled={!selectedTestSuite || isCreating}
                    >
                        <View className="flex-row items-center gap-2">
                            <Feather name="play" size={18} color={palette.primaryOn} />
                            <Text className="text-base font-bold text-primaryOn">
                                {isCreating ? "Creando..." : "Crear Sala"}
                            </Text>
                        </View>
                    </NunitoButton>
                </View>
                <View className="flex-1">
                    <NunitoButton
                        onPress={() => setStep(1)}
                        contentStyle={{ backgroundColor: palette.surface }}
                    >
                        <Text className="text-base font-semibold text-text">Atrás</Text>
                    </NunitoButton>
                </View>
            </View>
        </TeacherSectionCard>
    );
}
