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
import { palette, withAlpha } from "@/theme/colors";

export interface TestSuite {
    id: string;
    name: string;
    description: string;
    games: string[];
    createdAt: string;
    status: "active" | "inactive";
}

interface TestSuiteManagerProps {
    onSelectTestSuite?: (testSuite: TestSuite) => void;
}

const ALL_GAMES = [
    { id: "image-word", name: "Asociación Imagen-Palabra" },
    { id: "syllable-count", name: "Conteo de Sílabas" },
    { id: "rhyme-identification", name: "Identificación de Rimas" },
    { id: "audio-recognition", name: "Reconocimiento Auditivo" },
];

export default function TestSuiteManager({
    onSelectTestSuite,
}: TestSuiteManagerProps) {
    const [testSuites, setTestSuites] = useState<TestSuite[]>([
        {
            id: "1",
            name: "Prueba Fonológica Básica",
            description: "Prueba con los 4 juegos para evaluación inicial",
            games: ["image-word", "syllable-count"],
            createdAt: "2024-01-15",
            status: "active",
        },
        {
            id: "2",
            name: "Prueba Avanzada",
            description: "Prueba con enfoque en rimas y audio",
            games: ["rhyme-identification", "audio-recognition"],
            createdAt: "2024-01-10",
            status: "inactive",
        },
    ]);

    const [isCreating, setIsCreating] = useState(false);
    const [newTestName, setNewTestName] = useState("");
    const [newTestDesc, setNewTestDesc] = useState("");
    const [selectedGames, setSelectedGames] = useState<string[]>([]);

    const handleCreateTest = () => {
        if (newTestName.trim() && selectedGames.length > 0) {
            const newTest: TestSuite = {
                id: Date.now().toString(),
                name: newTestName,
                description: newTestDesc,
                games: selectedGames,
                createdAt: new Date().toISOString().split("T")[0],
                status: "active",
            };
            setTestSuites([...testSuites, newTest]);
            setNewTestName("");
            setNewTestDesc("");
            setSelectedGames([]);
            setIsCreating(false);
        }
    };

    const handleDeleteTest = (id: string) => {
        setTestSuites(testSuites.filter((t) => t.id !== id));
    };

    const toggleGameSelection = (gameId: string) => {
        if (selectedGames.includes(gameId)) {
            setSelectedGames(selectedGames.filter((g) => g !== gameId));
        } else {
            setSelectedGames([...selectedGames, gameId]);
        }
    };

    return (
        <View className="gap-4">
            {/* Header */}
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-xl font-bold text-text">
                        Conjuntos de Preguntas
                    </Text>
                    <Text className="text-sm text-muted">
                        Cada conjunto contiene preguntas personalizadas
                    </Text>
                </View>
                <Pressable
                    className="flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-xl active:scale-95"
                    onPress={() => setIsCreating(true)}
                >
                    <Feather name="plus" size={18} color={palette.primaryOn} />
                    <Text className="text-sm font-semibold text-primaryOn">
                        Nuevo Conjunto
                    </Text>
                </Pressable>
            </View>

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
                            <NunitoButton onPress={handleCreateTest}>
                                <Text className="text-base font-bold text-primaryOn">
                                    Crear Conjunto
                                </Text>
                            </NunitoButton>
                        </View>
                        <View className="flex-1">
                            <NunitoButton
                                onPress={() => {
                                    setIsCreating(false);
                                    setSelectedGames([]);
                                }}
                                contentStyle={{ backgroundColor: palette.surface }}
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
                {testSuites.length === 0 ? (
                    <View className="items-center py-12 gap-4">
                        <Feather name="layers" size={64} color={palette.muted} />
                        <Text className="text-center text-muted">
                            No hay conjuntos disponibles. Crea uno nuevo.
                        </Text>
                    </View>
                ) : (
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
                                        {test.games.map((gameId) => {
                                            const gameName =
                                                ALL_GAMES.find((g) => g.id === gameId)?.name || gameId;
                                            return (
                                                <View
                                                    key={gameId}
                                                    className="px-2 py-1 rounded-lg"
                                                    style={{
                                                        backgroundColor: withAlpha(palette.primary, 0.2),
                                                    }}
                                                >
                                                    <Text className="text-xs text-primary font-medium">
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
                )}
            </View>
        </View>
    );
}
