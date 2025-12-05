import { useState, useEffect } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import NunitoButton from "@/features/home/components/NunitoButton";
import { palette, withAlpha } from "@/theme/colors";
import { useTestSuites } from "@/services/useTestSuites";
import { TestSuite } from "@/models/testSuites";
import { useNotification } from "@/contexts/NotificationContext";

interface TestSuiteManagerProps {
    courseId?: string;
    onSelectTestSuite?: (testSuite: TestSuite) => void;
}

const ALL_GAMES = [
    { id: "image-word", name: "Asociación Imagen-Palabra" },
    { id: "syllable-count", name: "Conteo de Sílabas" },
    { id: "rhyme-identification", name: "Identificación de Rimas" },
    { id: "audio-recognition", name: "Reconocimiento Auditivo" },
];

export default function TestSuiteManager({
    courseId,
    onSelectTestSuite,
}: TestSuiteManagerProps) {
    const {
        testSuites,
        loading,
        error,
        fetchTestSuites,
        createTestSuite,
        deleteTestSuite,
    } = useTestSuites();
    const { error: showError, success: showSuccess } = useNotification();

    const [isCreating, setIsCreating] = useState(false);
    const [newTestName, setNewTestName] = useState("");
    const [newTestDesc, setNewTestDesc] = useState("");
    const [selectedGames, setSelectedGames] = useState<string[]>([]);

    useEffect(() => {
        if (courseId) {
            fetchTestSuites(courseId);
        }
    }, [courseId, fetchTestSuites]);

    const handleCreateTest = async () => {
        if (newTestName.trim() && selectedGames.length > 0 && courseId) {
            try {
                console.log("Creating test suite with data:", {
                    name: newTestName,
                    description: newTestDesc,
                    courseId,
                    games: selectedGames,
                });
                const result = await createTestSuite({
                    name: newTestName,
                    description: newTestDesc,
                    courseId,
                    games: selectedGames,
                });
                console.log("Test suite created, received:", result);
                setNewTestName("");
                setNewTestDesc("");
                setSelectedGames([]);
                setIsCreating(false);
                showSuccess("Conjunto de pruebas creado exitosamente");
            } catch (e) {
                console.error("Error creating test suite:", e);
                showError("No se pudo crear el conjunto de pruebas");
            }
        }
    };

    const handleDeleteTest = async (id: string) => {
        // For now, we'll delete directly. In the future, we could add a confirmation modal
        try {
            await deleteTestSuite(id);
            showSuccess("Conjunto eliminado exitosamente");
        } catch (e) {
            showError("No se pudo eliminar el conjunto");
        }
    };

    const toggleGameSelection = (gameId: string) => {
        if (selectedGames.includes(gameId)) {
            setSelectedGames(selectedGames.filter((g) => g !== gameId));
        } else {
            setSelectedGames([...selectedGames, gameId]);
        }
    };

    if (!courseId) {
        return (
            <View className="items-center py-12">
                <Text className="text-muted">Selecciona un curso primero.</Text>
            </View>
        );
    }

    let testSuitesContent: JSX.Element;

    if (loading && !isCreating) {
        testSuitesContent = <ActivityIndicator size="large" color={palette.primary} />;
    } else if (testSuites.length === 0) {
        testSuitesContent = (
            <View className="items-center py-12 gap-4">
                <Feather name="layers" size={64} color={palette.muted} />
                <Text className="text-center text-muted">
                    No hay conjuntos disponibles. Crea uno nuevo.
                </Text>
            </View>
        );
    } else {
        testSuitesContent = (
            <ScrollView className="gap-3" showsVerticalScrollIndicator={false}>
                {testSuites.map((test) => (
                    <View
                        key={test.id}
                        className="flex-row items-center justify-between p-4 border border-border rounded-xl bg-surface"
                    >
                        <View className="flex-1 gap-2">
                            <Text className="text-base font-semibold text-text">
                                {test.name}
                            </Text>
                            <Text className="text-sm text-muted">{test.description}</Text>
                            <View className="flex-row flex-wrap gap-2 mt-1">
                                {(test.games || []).map((gameId) => {
                                    const gameName =
                                        ALL_GAMES.find((g) => g.id === gameId)?.name || gameId;
                                    return (
                                        <View
                                            key={gameId}
                                            className="px-2 py-1 rounded-lg"
                                            style={{
                                                backgroundColor: palette.mintContainer,
                                            }}
                                        >
                                            <Text className="text-xs text-text font-medium">
                                                {gameName}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                        <View className="flex-row gap-2">
                            <Pressable
                                className="p-2 rounded-lg border border-primary bg-primary/10 active:bg-primary/20"
                                onPress={() => onSelectTestSuite?.(test)}
                            >
                                <Feather name="edit-2" size={16} color={palette.primary} />
                            </Pressable>
                            <Pressable
                                className="p-2 rounded-lg bg-error/10 border border-error/30 active:bg-error/20"
                                onPress={() => handleDeleteTest(test.id)}
                            >
                                <Feather name="trash-2" size={16} color={palette.error} />
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>
        );
    }

    return (
        <View className="gap-4">
            {/* Header */}
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-xl font-bold text-text">
                        Conjuntos de Preguntas
                    </Text>
                    <Text className="text-sm text-muted">
                        {testSuites.length} conjunto{testSuites.length !== 1 ? "s" : ""} disponible{testSuites.length !== 1 ? "s" : ""}
                    </Text>
                </View>
                <Pressable
                    className="flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-xl active:scale-95"
                    onPress={() => setIsCreating(true)}
                    disabled={loading}
                >
                    <Feather name="plus" size={18} color={palette.primaryOn} />
                    <Text className="text-sm font-semibold text-primaryOn">
                        Nuevo Conjunto
                    </Text>
                </Pressable>
            </View>

            {/* Error Message */}
            {error && (
                <View className="bg-error/10 p-3 rounded-lg">
                    <Text className="text-error text-sm">{error}</Text>
                </View>
            )}

            {/* Create Form */}
            {isCreating && (
                <View className="bg-surfaceMuted/50 rounded-2xl p-4 gap-4 border-2 border-primary/20">
                    <Text className="text-lg font-bold text-text">
                        Crear Nuevo Conjunto
                    </Text>
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">
                            Nombre del Conjunto
                        </Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={newTestName}
                            onChangeText={setNewTestName}
                            placeholder="Ej: Prueba Inicial"
                            placeholderTextColor={palette.muted}
                            editable={!loading}
                        />
                    </View>
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Descripción</Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={newTestDesc}
                            onChangeText={setNewTestDesc}
                            placeholder="Describe el propósito de este conjunto"
                            placeholderTextColor={palette.muted}
                            multiline
                            numberOfLines={2}
                            editable={!loading}
                        />
                    </View>
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">
                            Selecciona los Juegos
                        </Text>
                        <View className="gap-2">
                            {ALL_GAMES.map((game) => (
                                <Pressable
                                    key={game.id}
                                    className="flex-row items-center gap-3 p-3 border border-border rounded-xl bg-surface active:bg-surfaceMuted"
                                    onPress={() => toggleGameSelection(game.id)}
                                    disabled={loading}
                                >
                                    <View
                                        className="h-5 w-5 rounded border-2 items-center justify-center"
                                        style={{
                                            borderColor: selectedGames.includes(game.id)
                                                ? palette.primary
                                                : palette.border,
                                            backgroundColor: selectedGames.includes(game.id)
                                                ? palette.primary
                                                : "transparent",
                                        }}
                                    >
                                        {selectedGames.includes(game.id) && (
                                            <Feather name="check" size={14} color={palette.primaryOn} />
                                        )}
                                    </View>
                                    <Text className="flex-1 text-base text-text">{game.name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <NunitoButton onPress={handleCreateTest} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color={palette.primaryOn} />
                                ) : (
                                    <Text className="text-base font-bold text-primaryOn">
                                        Crear Conjunto
                                    </Text>
                                )}
                            </NunitoButton>
                        </View>
                        <View className="flex-1">
                            <NunitoButton
                                onPress={() => {
                                    setIsCreating(false);
                                    setSelectedGames([]);
                                }}
                                contentStyle={{ backgroundColor: palette.surface }}
                                disabled={loading}
                            >
                                <Text className="text-base font-semibold text-text">
                                    Cancelar
                                </Text>
                            </NunitoButton>
                        </View>
                    </View>
                </View>
            )}

            {/* Test Suites List */}
            <View className="gap-3">
                {testSuitesContent}
            </View>
        </View>
    );
}
