import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { palette } from "@/theme/colors";
import ConnectedUsersList from "@/features/home/components/ConnectedUsersList";
import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";

interface TeacherWaitingRoomProps {
    roomCode: string;
    gameName: string;
    connectedUsers: string[];
    connectingUsers: string[];
    onStartActivity: () => void;
    onCancel: () => void;
}

export default function TeacherWaitingRoom({
    roomCode,
    gameName,
    connectedUsers,
    connectingUsers,
    onStartActivity,
    onCancel,
}: TeacherWaitingRoomProps) {
    return (
        <TeacherSectionCard
            title="Sala de Espera"
            subtitle={`Juego: ${gameName}`}
        >
            <View className="items-center mb-6">
                <Text className="text-sm font-bold text-muted uppercase tracking-wider mb-2">
                    CÓDIGO DE SALA
                </Text>
                <View className="bg-surfaceMuted px-8 py-4 rounded-2xl border-2 border-primary/20">
                    <Text className="text-5xl font-mono font-bold text-primary tracking-widest">
                        {roomCode}
                    </Text>
                </View>
                <Text className="text-sm text-muted mt-2">
                    Comparte este código con tus estudiantes
                </Text>
            </View>

            <View className="flex-1 mb-6">
                <ConnectedUsersList
                    connectedUsers={connectedUsers}
                    connectingUsers={connectingUsers}
                />
            </View>

            <View className="flex-row gap-4">
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
                    className="h-14 w-14 rounded-xl border border-border bg-surface items-center justify-center active:bg-surfaceMuted"
                    onPress={onCancel}
                >
                    <Feather name="x" size={24} color={palette.text} />
                </TouchableOpacity>
            </View>
        </TeacherSectionCard>
    );
}
