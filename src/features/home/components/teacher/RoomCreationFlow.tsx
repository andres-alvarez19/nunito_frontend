import { useState, useEffect } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import NunitoButton from "@/features/home/components/NunitoButton";
import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";
import { palette, withAlpha } from "@/theme/colors";
import { useCourses } from "@/services/useCourses";
import { useTestSuites } from "@/services/useTestSuites";
import { createRoom } from "@/services/useRooms";
import { useAuth } from "@/contexts/AuthContext";

import { Room } from "@/features/home/types";

export interface RoomConfig {
    name: string;
    games: string[];
    difficulty: string;
    duration: number;
}

interface RoomCreationFlowProps {
    teacherName: string;
    teacherEmail: string;
    onRoomCreated: (room: Room) => void;
    onCancel: () => void;
    onNavigateToQuestions?: () => void;
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

// 🔍 Helper: el suite es compatible sólo si tiene EXACTAMENTE
// los mismos juegos que el profesor seleccionó (mismo set).
const haveSameGameSet = (suiteGames: string[], selectedGames: string[]) => {
    if (suiteGames.length !== selectedGames.length) return false;
    const selectedSet = new Set(selectedGames);
    return suiteGames.every((g) => selectedSet.has(g));
};

export default function RoomCreationFlow({
                                             teacherName,
                                             teacherEmail,
                                             onRoomCreated,
                                             onCancel,
                                             onNavigateToQuestions,
                                         }: RoomCreationFlowProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [roomConfig, setRoomConfig] = useState<RoomConfig>({
        name: "",
        games: [],
        difficulty: "",
        duration: 10,
    });
    const [selectedTestSuite, setSelectedTestSuite] = useState<string>("");
    const [isCreating, setIsCreating] = useState(false);

    // flags para mostrar mensajes de error en UI
    const [showStep1Errors, setShowStep1Errors] = useState(false);
    const [showStep2Errors, setShowStep2Errors] = useState(false);

    // Hooks
    const { courses, loading: coursesLoading, fetchCourses } = useCourses();
    const { testSuites, loading: testSuitesLoading, fetchTestSuites } =
        useTestSuites();

    // Fetch courses on mount
    useEffect(() => {
        if (user?.id) {
            fetchCourses(user.id);
        }
    }, [user?.id, fetchCourses]);

    // Fetch test suites when course is selected
    useEffect(() => {
        if (selectedCourseId) {
            fetchTestSuites(selectedCourseId);
        }
    }, [selectedCourseId, fetchTestSuites]);

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

    const showValidationError = (message: string) => {
        Alert.alert("Información incompleta", message);
    };

    const handleContinueToRoomConfig = () => {
        if (!selectedCourseId) {
            setShowStep1Errors(true);
            showValidationError("Debes seleccionar un curso para continuar.");
            return;
        }
        setShowStep1Errors(false);
        setStep(2);
    };

    const handleContinueToTestSuiteSelection = () => {
        const errors: string[] = [];
        if (!roomConfig.name.trim()) {
            errors.push("• Ingresa un nombre para la sala.");
        }
        if (roomConfig.games.length === 0) {
            errors.push("• Selecciona al menos un juego.");
        }
        if (!roomConfig.difficulty) {
            errors.push("• Selecciona un nivel de dificultad.");
        }

        if (errors.length > 0) {
            setShowStep2Errors(true);
            showValidationError(errors.join("\n"));
            return;
        }

        setShowStep2Errors(false);
        setStep(3);
    };

    const handleCreateRoom = async () => {
        if (!selectedTestSuite) {
            showValidationError(
                "Debes seleccionar un conjunto de preguntas para crear la sala.",
            );
            return;
        }

        if (!user?.id) {
            showValidationError(
                "No se ha encontrado información del profesor. Intenta volver a iniciar sesión.",
            );
            return;
        }

        setIsCreating(true);

        try {
            // Asegurar duración válida
            const duration =
                typeof roomConfig.duration === "number" && roomConfig.duration > 0
                    ? roomConfig.duration
                    : 10;

            const newRoom = await createRoom({
                teacherId: user.id,
                name: roomConfig.name,
                games: roomConfig.games,
                difficulty: roomConfig.difficulty,
                durationMinutes: duration,
                testSuiteId: selectedTestSuite,
            });

            // 🔧 Ajustar tipo de games a lo que espera Room: { id, name }[]
            const gamesWithMeta = roomConfig.games.map((gameId) => {
                const def = GAMES.find((g) => g.id === gameId);
                return {
                    id: gameId,
                    name: def?.name ?? gameId,
                };
            });

            const roomWithGames: Room = {
                ...newRoom,
                games: gamesWithMeta,
            };

            onRoomCreated(roomWithGames);
        } catch (error) {
            console.error("Error creating room:", error);
            Alert.alert(
                "Error al crear la sala",
                "Ocurrió un problema al crear la sala. Inténtalo nuevamente.",
            );
        } finally {
            setIsCreating(false);
        }
    };

    const isStep2Valid =
        roomConfig.name.trim() &&
        roomConfig.games.length > 0 &&
        roomConfig.difficulty;

    // 🔗 Filtrar suites compatibles:
    // ahora SOLO se muestran los que tengan EXACTAMENTE los mismos juegos
    // que el profesor seleccionó en el Paso 2.
    const compatibleTestSuites = testSuites.filter((suite) =>
        haveSameGameSet(suite.games, roomConfig.games),
    );

    // Step 1: Course Selection
    if (step === 1) {
        return (
            <TeacherSectionCard
                title="Crear Nueva Sala - Paso 1 de 3"
                subtitle="Seleccionar curso"
            >
                <ScrollView className="gap-3" showsVerticalScrollIndicator={false}>
                    <Text className="text-base text-text mb-2">
                        Selecciona el curso para el cual deseas crear la sala:
                    </Text>

                    {coursesLoading ? (
                        <View className="items-center py-12">
                            <ActivityIndicator size="large" color={palette.primary} />
                            <Text className="text-muted mt-4">Cargando cursos...</Text>
                        </View>
                    ) : courses.length === 0 ? (
                        <View className="p-6 bg-surfaceMuted/50 rounded-xl border border-border items-center">
                            <Feather name="book-open" size={48} color={palette.muted} />
                            <Text className="text-base text-text text-center mt-3">
                                No tienes cursos disponibles.
                            </Text>
                            <Text className="text-sm text-muted text-center mt-2">
                                Crea un curso primero en la sección de "Gestionar Preguntas".
                            </Text>
                        </View>
                    ) : (
                        courses.map((course) => (
                            <Pressable
                                key={course.id}
                                className={`p-4 rounded-xl border-2 active:scale-[0.98] ${
                                    selectedCourseId === course.id
                                        ? "bg-primary/10 border-primary"
                                        : "border-border bg-surface"
                                }`}
                                onPress={() => {
                                    setSelectedCourseId(course.id);
                                    setShowStep1Errors(false);
                                }}
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <Text
                                            className={`text-lg font-bold ${
                                                selectedCourseId === course.id
                                                    ? "text-primary"
                                                    : "text-text"
                                            }`}
                                        >
                                            {course.name}
                                        </Text>
                                        {course.description && (
                                            <Text className="text-sm text-muted mt-1">
                                                {course.description}
                                            </Text>
                                        )}
                                    </View>
                                    <View
                                        className="h-6 w-6 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor:
                                                selectedCourseId === course.id
                                                    ? palette.primary
                                                    : palette.border,
                                            backgroundColor:
                                                selectedCourseId === course.id
                                                    ? palette.primary
                                                    : "transparent",
                                        }}
                                    >
                                        {selectedCourseId === course.id && (
                                            <View className="h-3 w-3 rounded-full bg-primaryOn" />
                                        )}
                                    </View>
                                </View>
                            </Pressable>
                        ))
                    )}

                    {showStep1Errors && !selectedCourseId && (
                        <Text className="mt-2 text-xs text-red-500">
                            Debes seleccionar un curso antes de continuar.
                        </Text>
                    )}
                </ScrollView>

                {/* Actions */}
                <View className="flex-row gap-3 mt-4">
                    <View className="flex-1">
                        <NunitoButton onPress={handleContinueToRoomConfig}>
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

    // Step 2: Room Configuration
    if (step === 2) {
        const nameInvalid = showStep2Errors && !roomConfig.name.trim();
        const gamesInvalid = showStep2Errors && roomConfig.games.length === 0;
        const difficultyInvalid = showStep2Errors && !roomConfig.difficulty;

        return (
            <TeacherSectionCard
                title="Crear Nueva Sala - Paso 2 de 3"
                subtitle="Configuración de la sala"
            >
                <Pressable
                    className="flex-row items-center gap-2 mb-4 active:opacity-70"
                    onPress={() => setStep(1)}
                >
                    <Feather name="arrow-left" size={20} color={palette.primary} />
                    <Text className="text-base font-semibold text-primary">
                        Volver a selección de curso
                    </Text>
                </Pressable>

                <ScrollView className="gap-4" showsVerticalScrollIndicator={false}>
                    {/* Room Name */}
                    <View className="gap-1.5">
                        <Text className="text-sm font-semibold text-text">
                            Nombre de la sala
                        </Text>
                        <TextInput
                            className={`rounded-xl border bg-background px-4 py-3 text-base text-text ${
                                nameInvalid ? "border-red-500" : "border-border"
                            }`}
                            value={roomConfig.name}
                            onChangeText={(text) =>
                                setRoomConfig({ ...roomConfig, name: text })
                            }
                            placeholder="Ej: Clase 3°A - Fonología"
                            placeholderTextColor={palette.muted}
                        />
                        {nameInvalid && (
                            <Text className="text-xs text-red-500">
                                Ingresa un nombre para la sala.
                            </Text>
                        )}
                    </View>

                    {/* Game Selection */}
                    <View className="gap-1.5">
                        <Text className="text-sm font-semibold text-text">
                            Seleccionar juegos (al menos 1)
                        </Text>
                        <View className="gap-2">
                            {GAMES.map((game) => {
                                const selected = roomConfig.games.includes(game.id);
                                return (
                                    <Pressable
                                        key={game.id}
                                        className={`flex-row items-center gap-3 p-3 rounded-xl border ${
                                            selected
                                                ? "bg-primary/10 border-primary"
                                                : "border-border bg-surface"
                                        }`}
                                        onPress={() => {
                                            toggleGameSelection(game.id);
                                        }}
                                    >
                                        <View
                                            className="h-5 w-5 rounded border-2 items-center justify-center"
                                            style={{
                                                borderColor: selected ? palette.primary : palette.border,
                                                backgroundColor: selected
                                                    ? palette.primary
                                                    : "transparent",
                                            }}
                                        >
                                            {selected && (
                                                <Feather name="check" size={14} color={palette.primaryOn} />
                                            )}
                                        </View>
                                        <Text
                                            className={`flex-1 text-base font-semibold ${
                                                selected ? "text-primary" : "text-text"
                                            }`}
                                        >
                                            {game.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                        {gamesInvalid && (
                            <Text className="text-xs text-red-500">
                                Selecciona al menos un juego.
                            </Text>
                        )}
                    </View>

                    {/* Difficulty & Duration */}
                    <View className="flex-row gap-3">
                        {/* Difficulty */}
                        <View className="flex-1 gap-1.5">
                            <Text className="text-sm font-semibold text-text">
                                Dificultad
                            </Text>
                            <View className="gap-2">
                                {DIFFICULTIES.map((diff) => {
                                    const selected = roomConfig.difficulty === diff.value;
                                    return (
                                        <Pressable
                                            key={diff.value}
                                            className={`p-2.5 rounded-xl border ${
                                                selected
                                                    ? "bg-primary/10 border-primary"
                                                    : "border-border bg-surface"
                                            }`}
                                            onPress={() =>
                                                setRoomConfig({
                                                    ...roomConfig,
                                                    difficulty: diff.value,
                                                })
                                            }
                                        >
                                            <Text
                                                className={`text-sm font-medium text-center ${
                                                    selected ? "text-primary" : "text-text"
                                                }`}
                                            >
                                                {diff.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                            {difficultyInvalid && (
                                <Text className="text-xs text-red-500">
                                    Selecciona una dificultad.
                                </Text>
                            )}
                        </View>

                        {/* Duration */}
                        <View className="flex-1 gap-1.5">
                            <Text className="text-sm font-semibold text-text">Duración</Text>
                            <View className="gap-2">
                                {DURATIONS.map((dur) => {
                                    const selected = roomConfig.duration === dur.value;
                                    return (
                                        <Pressable
                                            key={dur.value}
                                            className={`p-2.5 rounded-xl border ${
                                                selected
                                                    ? "bg-primary/10 border-primary"
                                                    : "border-border bg-surface"
                                            }`}
                                            onPress={() =>
                                                setRoomConfig({ ...roomConfig, duration: dur.value })
                                            }
                                        >
                                            <Text
                                                className={`text-sm font-medium text-center ${
                                                    selected ? "text-primary" : "text-text"
                                                }`}
                                            >
                                                {dur.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
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
                                                    (palette[
                                                        gameData.color as keyof typeof palette
                                                        ] as string) || palette.primary,
                                                    0.2,
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
                        <NunitoButton onPress={handleContinueToTestSuiteSelection}>
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

    // Step 3: Test Suite Selection
    return (
        <TeacherSectionCard
            title="Crear Nueva Sala - Paso 3 de 3"
            subtitle="Seleccionar conjunto de preguntas"
        >
            <Pressable
                className="flex-row items-center gap-2 mb-4 active:opacity-70"
                onPress={() => setStep(2)}
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

                {testSuitesLoading ? (
                    <View className="items-center py-12">
                        <ActivityIndicator size="large" color={palette.primary} />
                        <Text className="text-muted mt-4">
                            Cargando conjuntos de preguntas...
                        </Text>
                    </View>
                ) : compatibleTestSuites.length === 0 ? (
                    <View className="p-6 bg-surfaceMuted/50 rounded-xl border border-border items-center">
                        <Feather name="alert-circle" size={48} color={palette.muted} />
                        <Text className="text-base text-text text-center mt-3">
                            No hay conjuntos de preguntas compatibles con la combinación de
                            juegos seleccionada.
                        </Text>
                        <Text className="text-sm text-muted text-center mt-2">
                            Crea un conjunto de preguntas en "Gestionar Preguntas" o vuelve
                            atrás para cambiar los juegos.
                        </Text>
                        {onNavigateToQuestions && (
                            <View className="mt-4 w-full">
                                <NunitoButton
                                    onPress={() => {
                                        onNavigateToQuestions();
                                    }}
                                >
                                    <View className="flex-row items-center gap-2">
                                        <Feather
                                            name="layers"
                                            size={18}
                                            color={palette.primaryOn}
                                        />
                                        <Text className="text-base font-bold text-primaryOn">
                                            Ir a Gestionar Preguntas
                                        </Text>
                                    </View>
                                </NunitoButton>
                            </View>
                        )}
                    </View>
                ) : (
                    compatibleTestSuites.map((suite) => (
                        <Pressable
                            key={suite.id}
                            className={`p-4 rounded-xl border-2 active:scale-[0.98] ${
                                selectedTestSuite === suite.id
                                    ? "bg-primary/10 border-primary"
                                    : "border-border bg-surface"
                            }`}
                            onPress={() => setSelectedTestSuite(suite.id)}
                        >
                            <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-1">
                                    <Text
                                        className={`text-lg font-bold ${
                                            selectedTestSuite === suite.id
                                                ? "text-primary"
                                                : "text-text"
                                        }`}
                                    >
                                        {suite.name}
                                    </Text>
                                    {suite.description && (
                                        <Text className="text-sm text-muted mt-1">
                                            {suite.description}
                                        </Text>
                                    )}
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
                                    {suite.games.length} juego
                                    {suite.games.length !== 1 ? "s" : ""}
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
                                            className={`px-2 py-1 rounded ${
                                                isSelected
                                                    ? "bg-primary/20"
                                                    : "bg-surfaceMuted/50"
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs font-medium ${
                                                    isSelected ? "text-primary" : "text-muted"
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
                    <NunitoButton onPress={handleCreateRoom} disabled={isCreating}>
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
                        onPress={() => setStep(2)}
                        contentStyle={{ backgroundColor: palette.surface }}
                    >
                        <Text className="text-base font-semibold text-text">Atrás</Text>
                    </NunitoButton>
                </View>
            </View>
        </TeacherSectionCard>
    );
}
