import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import NunitoButton from "@/features/home/components/NunitoButton";
import { palette, withAlpha } from "@/theme/colors";

export interface Room {
    id: string;
    code: string;
    name: string;
    games: string[]; // Changed from single game to array of games
    difficulty: string;
    duration: number;
    teacher: {
        name: string;
        email: string;
    };
    students: string[];
    isActive: boolean;
}

interface RoomCreationModalProps {
    isOpen: boolean;
    teacherName: string;
    teacherEmail: string;
    onRoomCreated: (room: Room) => void;
    onClose: () => void;
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
    { value: 5, label: "5 minutos" },
    { value: 10, label: "10 minutos" },
    { value: 15, label: "15 minutos" },
    { value: 20, label: "20 minutos" },
    { value: 30, label: "30 minutos" },
];

export default function RoomCreationModal({
    isOpen,
    teacherName,
    teacherEmail,
    onRoomCreated,
    onClose,
}: RoomCreationModalProps) {
    const [roomName, setRoomName] = useState("");
    const [selectedGames, setSelectedGames] = useState<string[]>([]); // Changed to array
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [selectedDuration, setSelectedDuration] = useState(10);
    const [isCreating, setIsCreating] = useState(false);

    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const toggleGameSelection = (gameId: string) => {
        if (selectedGames.includes(gameId)) {
            setSelectedGames(selectedGames.filter((g) => g !== gameId));
        } else {
            setSelectedGames([...selectedGames, gameId]);
        }
    };

    const handleCreateRoom = () => {
        if (!roomName.trim() || selectedGames.length === 0 || !selectedDifficulty) {
            return;
        }

        setIsCreating(true);

        // Simulate API call
        setTimeout(() => {
            const newRoom: Room = {
                id: Date.now().toString(),
                code: generateRoomCode(),
                name: roomName,
                games: selectedGames, // Changed to array
                difficulty: selectedDifficulty,
                duration: selectedDuration,
                teacher: {
                    name: teacherName,
                    email: teacherEmail,
                },
                students: [],
                isActive: false,
            };

            onRoomCreated(newRoom);
            setIsCreating(false);

            // Reset form
            setRoomName("");
            setSelectedGames([]); // Changed to empty array
            setSelectedDifficulty("");
            setSelectedDuration(10);
        }, 1000);
    };


    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                <View className="bg-surface rounded-2xl p-6 w-full max-w-2xl border border-border max-h-[90%]">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-2xl font-bold text-text">
                                Crear Nueva Sala
                            </Text>
                            <Text className="text-sm text-muted mt-1">
                                Bienvenido, {teacherName}
                            </Text>
                        </View>
                        <Pressable onPress={onClose}>
                            <Feather name="x" size={24} color={palette.text} />
                        </Pressable>
                    </View>

                    <ScrollView className="gap-4" showsVerticalScrollIndicator={false}>
                        {/* Room Name */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">
                                Nombre de la sala
                            </Text>
                            <TextInput
                                className="rounded-xl border border-border bg-background px-4 py-3 text-base text-text"
                                value={roomName}
                                onChangeText={setRoomName}
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
                                        className={`flex-row items-center gap-3 p-3 rounded-xl border ${selectedGames.includes(game.id)
                                            ? "bg-primary/10 border-primary"
                                            : "border-border bg-surface"
                                            }`}
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
                                        <Text
                                            className={`flex-1 text-base font-semibold ${selectedGames.includes(game.id) ? "text-primary" : "text-text"
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
                                <Text className="text-sm font-semibold text-text">
                                    Nivel de dificultad
                                </Text>
                                <View className="gap-2">
                                    {DIFFICULTIES.map((diff) => (
                                        <Pressable
                                            key={diff.value}
                                            className={`p-2.5 rounded-xl border ${selectedDifficulty === diff.value
                                                ? "bg-primary/10 border-primary"
                                                : "border-border bg-surface"
                                                }`}
                                            onPress={() => setSelectedDifficulty(diff.value)}
                                        >
                                            <Text
                                                className={`text-sm font-medium text-center ${selectedDifficulty === diff.value
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
                                <Text className="text-sm font-semibold text-text">
                                    Duración
                                </Text>
                                <View className="gap-2">
                                    {DURATIONS.map((dur) => (
                                        <Pressable
                                            key={dur.value}
                                            className={`p-2.5 rounded-xl border ${selectedDuration === dur.value
                                                ? "bg-primary/10 border-primary"
                                                : "border-border bg-surface"
                                                }`}
                                            onPress={() => setSelectedDuration(dur.value)}
                                        >
                                            <Text
                                                className={`text-sm font-medium text-center ${selectedDuration === dur.value
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
                        {selectedGames.length > 0 && (
                            <View className="p-4 bg-surfaceMuted/50 rounded-xl border border-border">
                                <Text className="text-sm font-semibold text-text mb-2">
                                    Juegos seleccionados ({selectedGames.length}):
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {selectedGames.map((gameId) => {
                                        const gameData = GAMES.find((g) => g.id === gameId);
                                        if (!gameData) return null;
                                        return (
                                            <View
                                                key={gameId}
                                                className="px-3 py-1.5 rounded-lg"
                                                style={{
                                                    backgroundColor: withAlpha(
                                                        (palette[gameData.color as keyof typeof palette] as string) || palette.primary,
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
                                onPress={handleCreateRoom}
                                disabled={
                                    isCreating ||
                                    !roomName.trim() ||
                                    selectedGames.length === 0 ||
                                    !selectedDifficulty
                                }
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
                                onPress={onClose}
                                contentStyle={{ backgroundColor: palette.surface }}
                            >
                                <Text className="text-base font-semibold text-text">
                                    Cancelar
                                </Text>
                            </NunitoButton>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
