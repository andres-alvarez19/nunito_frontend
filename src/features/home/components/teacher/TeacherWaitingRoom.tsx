import React from "react";
import * as Clipboard from 'expo-clipboard';
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { palette } from "@/theme/colors";
import ConnectedUsersList from "@/features/home/components/ConnectedUsersList";
import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";

interface TeacherWaitingRoomProps {
    roomCode: string;
    gameName: string; // Keep for backward compatibility or single game display
    selectedGames?: string[]; // List of game names
    connectedUsers: string[];
    connectingUsers: string[];
    onStartActivity: () => void;
    onCancel: () => void;
    connectionStatus?: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
}

export default function TeacherWaitingRoom({
    roomCode,
    gameName,
    selectedGames = [],
    connectedUsers,
    connectingUsers,
    onStartActivity,
    onCancel,
    connectionStatus = 'DISCONNECTED',
}: TeacherWaitingRoomProps) {
    // If selectedGames is empty but gameName is provided, use gameName
    const gamesToList = selectedGames.length > 0 ? selectedGames : [gameName];

    const [copied, setCopied] = React.useState(false);

    const handleCopyCode = async () => {
        await Clipboard.setStringAsync(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <TeacherSectionCard
            title="Sala de Espera"
            subtitle="Esperando estudiantes..."
            rightContent={
                <View className="flex-row items-center gap-2 bg-surfaceMuted px-3 py-1.5 rounded-full border border-border/60">
                    <View className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-green-500' : connectionStatus === 'CONNECTING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <Text className="text-xs font-bold text-muted">
                        {connectionStatus === 'CONNECTED' ? 'En línea' : connectionStatus === 'CONNECTING' ? 'Conectando...' : 'Desconectado'}
                    </Text>
                </View>
            }
        >
            <View className="flex-row gap-6">
                {/* Left Column: Room Info & Students */}
                <View className="flex-1 gap-6">
                    <View className="items-center">
                        <Text className="text-sm font-bold text-muted uppercase tracking-wider mb-2">
                            CÓDIGO DE SALA
                        </Text>
                        <View className="bg-surfaceMuted px-8 py-4 rounded-2xl border-2 border-primary/20 w-full items-center">
                            <Text className="text-5xl font-mono font-bold text-primary tracking-widest">
                                {roomCode}
                            </Text>
                        </View>

                        <TouchableOpacity
                            className="mt-3 flex-row items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 active:bg-primary/20"
                            onPress={handleCopyCode}
                        >
                            <Feather name={copied ? "check" : "copy"} size={18} color={palette.primary} />
                            <Text className="text-sm font-bold text-primary">
                                {copied ? "¡Copiado!" : "Copiar código"}
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-sm text-muted mt-2 text-center">
                            Comparte este código con tus estudiantes para que se unan
                        </Text>
                    </View>

                    <View className="flex-1 min-h-[300px] bg-surface border border-border/60 rounded-2xl overflow-hidden">
                        <View className="p-4 border-b border-border/60 bg-surfaceMuted/30">
                            <Text className="text-base font-bold text-text">Estudiantes conectados</Text>
                        </View>
                        <View className="flex-1 p-2">
                            <ConnectedUsersList
                                connectedUsers={connectedUsers}
                                connectingUsers={connectingUsers}
                            />
                        </View>
                    </View>
                </View>

                {/* Right Column: Games & Mirror View */}
                <View className="flex-1 gap-6">
                    {/* Selected Games */}
                    <View className="bg-surface border border-border/60 rounded-2xl p-4">
                        <Text className="text-base font-bold text-text mb-3">Juegos seleccionados</Text>
                        <ScrollView className="max-h-[150px]" showsVerticalScrollIndicator={true}>
                            <View className="gap-2">
                                {gamesToList.map((game, index) => (
                                    <View key={index} className="flex-row items-center gap-3 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                                        <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                                            <Feather name="play-circle" size={16} color={palette.primary} />
                                        </View>
                                        <Text className="text-sm font-semibold text-text flex-1">
                                            {game}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Mirror View Placeholder */}
                    <View className="flex-1 bg-surface border border-border/60 rounded-2xl overflow-hidden flex flex-col">
                        <View className="p-3 border-b border-border/60 bg-surfaceMuted/30 flex-row items-center justify-between">
                            <Text className="text-sm font-bold text-text">Vista del Estudiante (Espejo)</Text>
                            <View className="flex-row items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 border border-green-200">
                                <View className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <Text className="text-[10px] font-bold text-green-700 uppercase">En vivo</Text>
                            </View>
                        </View>
                        <View className="flex-1 items-center justify-center bg-gray-50 p-4 relative">
                            {/* Mockup of student screen */}
                            <View className="w-[200px] h-[350px] bg-white rounded-[20px] border-4 border-gray-800 shadow-xl overflow-hidden items-center justify-center relative">
                                <View className="absolute top-0 w-full h-6 bg-gray-800 items-center justify-center">
                                    <View className="w-16 h-3 bg-gray-700 rounded-full" />
                                </View>
                                <View className="items-center gap-3 p-4">
                                    <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-2">
                                        <Feather name="user" size={32} color={palette.primary} />
                                    </View>
                                    <Text className="text-center font-bold text-gray-800">¡Esperando al profesor!</Text>
                                    <Text className="text-center text-xs text-gray-500">El juego comenzará pronto...</Text>
                                    <View className="mt-4 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <View className="w-1/2 h-full bg-primary animate-pulse" />
                                    </View>
                                </View>
                            </View>
                            <Text className="text-xs text-muted mt-4 text-center">
                                Esto es lo que ven tus estudiantes en sus dispositivos
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="flex-row gap-4 mt-2 pt-4 border-t border-border/60">
                <TouchableOpacity
                    className="flex-1 h-14 rounded-xl bg-primary items-center justify-center shadow-lg active:opacity-90 active:scale-[0.98]"
                    onPress={onStartActivity}
                >
                    <View className="flex-row items-center gap-2">
                        <Feather name="play" size={24} color={palette.primaryOn} />
                        <Text className="text-lg font-bold text-primaryOn">
                            Iniciar Actividad
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className="h-14 px-8 rounded-xl border border-border bg-surface items-center justify-center active:bg-surfaceMuted"
                    onPress={onCancel}
                >
                    <Text className="text-base font-semibold text-text">Cancelar</Text>
                </TouchableOpacity>
            </View>
        </TeacherSectionCard>
    );
}
