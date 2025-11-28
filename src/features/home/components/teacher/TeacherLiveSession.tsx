import React from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { palette } from "@/theme/colors";
import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";

import { RoomMonitoringSnapshotDto, StudentMonitoringStateDto } from "@/types/monitoring";

interface TeacherLiveSessionProps {
    roomCode: string;
    gameName: string;
    connectedCount: number;
    connectedUsers: string[];
    monitoringData?: RoomMonitoringSnapshotDto;
    onEndActivity: () => void;
}

export default function TeacherLiveSession({
    roomCode,
    gameName,
    connectedCount,
    connectedUsers,
    monitoringData,
    onEndActivity,
}: TeacherLiveSessionProps) {
    const globalStats = monitoringData?.globalStats;
    const ranking = monitoringData?.ranking || [];
    const students = monitoringData?.students || [];

    // Calculate live accuracy
    const liveAccuracy = globalStats?.globalAccuracyPct || 0;

    // Get current question from the first active student (heuristic)
    const currentQuestionText = students.find(s => s.currentQuestionText)?.currentQuestionText || "Esperando pregunta...";

    return (
        <TeacherSectionCard
            title="Sesión en Vivo"
            subtitle={`Juego: ${gameName} • Código: ${roomCode}`}
        >
            <View className="flex-row gap-4 mb-6">
                {/* Mirror View */}
                <View className="flex-[2] bg-surface rounded-2xl border border-border p-4 gap-3 min-h-[300px]">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-text">Vista Espejo (Estudiante)</Text>
                        <View className="flex-row items-center gap-2 bg-red-100 px-2 py-1 rounded-full border border-red-200">
                            <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <Text className="text-xs font-bold text-red-600">EN VIVO</Text>
                        </View>
                    </View>

                    <View className="flex-1 bg-background rounded-xl border border-border/50 items-center justify-center overflow-hidden relative">
                        {/* Mock Game Screen */}
                        <View className="absolute inset-0 items-center justify-center opacity-10">
                            <Feather name="image" size={64} color={palette.muted} />
                        </View>
                        <Text className="text-lg font-bold text-text mb-2">Pregunta en curso</Text>
                        <Text className="text-2xl font-bold text-primary text-center px-8 mb-8">
                            {currentQuestionText}
                        </Text>
                        <View className="flex-row gap-4">
                            <View className="w-24 h-24 bg-surfaceMuted rounded-xl border border-border" />
                            <View className="w-24 h-24 bg-surfaceMuted rounded-xl border border-border" />
                            <View className="w-24 h-24 bg-surfaceMuted rounded-xl border border-border" />
                        </View>
                    </View>
                </View>

                {/* Live Stats */}
                <View className="flex-1 gap-4">
                    <View className="bg-surface rounded-2xl border border-border p-4 gap-2">
                        <Text className="text-sm font-medium text-muted">Estudiantes</Text>
                        <Text className="text-3xl font-bold text-text">{connectedCount}</Text>
                        <Text className="text-xs text-green-600 font-medium">● {connectedCount} conectados</Text>
                    </View>

                    <View className="bg-surface rounded-2xl border border-border p-4 gap-2">
                        <Text className="text-sm font-medium text-muted">Precisión Global</Text>
                        <Text className="text-3xl font-bold text-text">{liveAccuracy}%</Text>
                        <View className="h-1.5 bg-surfaceMuted rounded-full overflow-hidden">
                            <View className="h-full bg-green-500" style={{ width: `${liveAccuracy}%` }} />
                        </View>
                        <Text className="text-xs text-muted">Promedio de la clase</Text>
                    </View>

                    <View className="bg-surface rounded-2xl border border-border p-4 gap-2 flex-1">
                        <Text className="text-sm font-medium text-muted">Estudiantes Conectados</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {connectedUsers.map((studentName, index) => {
                                const studentState = students.find(s => s.studentName === studentName);
                                const isOnline = studentState?.status === 'online';
                                return (
                                    <View key={index} className="flex-row items-center gap-2 mb-2 justify-between">
                                        <View className="flex-row items-center gap-2">
                                            <View className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            <Text className="text-sm font-medium text-text">{studentName}</Text>
                                        </View>
                                        {studentState && (
                                            <Text className="text-xs font-bold text-primary">{studentState.accuracyPct}%</Text>
                                        )}
                                    </View>
                                );
                            })}
                            {connectedUsers.length === 0 && (
                                <Text className="text-sm text-muted italic">Esperando estudiantes...</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                className="h-14 rounded-xl bg-surface border-2 border-red-100 items-center justify-center active:bg-red-50"
                onPress={onEndActivity}
            >
                <Text className="text-lg font-bold text-red-600">
                    Finalizar Actividad
                </Text>
            </TouchableOpacity>
        </TeacherSectionCard>
    );
}
