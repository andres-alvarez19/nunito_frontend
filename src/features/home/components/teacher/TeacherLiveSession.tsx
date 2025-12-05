import React, { useState } from "react";
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
    const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});

    const toggleStudent = (studentName: string) => {
        setExpandedStudents(prev => ({
            ...prev,
            [studentName]: !prev[studentName]
        }));
    };

    // Calculate live accuracy
    const liveAccuracy = globalStats?.globalAccuracyPct || 0;

    // Get current question from the first active student (heuristic)
    const currentQuestionText = students.find(s => s.currentQuestionText)?.currentQuestionText || "Esperando pregunta...";

    // Merge students from monitoring data and connected users to ensure we show everyone
    const allStudentNames = Array.from(new Set([
        ...students.map(s => s.studentName),
        ...connectedUsers
    ])).sort();

    return (
        <TeacherSectionCard
            title="Sesión en Vivo"
            subtitle={`Juego: ${gameName} • Código: ${roomCode}`}
        >
            <View className="flex-row gap-4 mb-6">
                {/* Live Stats & Student Progress */}
                <View className="flex-1 gap-4">
                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-surface rounded-2xl border border-border p-4 gap-2">
                            <Text className="text-sm font-medium text-muted">Estudiantes</Text>
                            <Text className="text-3xl font-bold text-text">{connectedCount}</Text>
                            <Text className="text-xs text-green-600 font-medium">● {connectedCount} conectados</Text>
                        </View>

                        <View className="flex-1 bg-surface rounded-2xl border border-border p-4 gap-2">
                            <Text className="text-sm font-medium text-muted">Precisión Global</Text>
                            <Text className="text-3xl font-bold text-text">{liveAccuracy}%</Text>
                            <View className="h-1.5 bg-surfaceMuted rounded-full overflow-hidden">
                                <View className="h-full bg-green-500" style={{ width: `${liveAccuracy}%` }} />
                            </View>
                            <Text className="text-xs text-muted">Promedio de la clase</Text>
                        </View>
                    </View>

                    <View className="bg-surface rounded-2xl border border-border p-4 gap-4 flex-1 min-h-[400px]">
                        <View className="flex-row items-center justify-between border-b border-border/50 pb-2">
                            <Text className="text-base font-bold text-text">Progreso en tiempo real</Text>
                            <View className="flex-row items-center gap-2 bg-red-100 px-2 py-1 rounded-full border border-red-200">
                                <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <Text className="text-xs font-bold text-red-600">EN VIVO</Text>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {allStudentNames.map((studentName, index) => {
                                const studentState = students.find(s => s.studentName === studentName);
                                const isOnline = connectedUsers.includes(studentName);
                                const isExpanded = expandedStudents[studentName];
                                const answers = studentState?.answers || [];

                                return (
                                    <View key={studentName} className="mb-3 rounded-xl bg-surfaceMuted border border-border/50 overflow-hidden">
                                        <TouchableOpacity
                                            className="flex-row items-center gap-3 p-3"
                                            onPress={() => toggleStudent(studentName)}
                                        >
                                            <View className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            <View className="flex-1 flex-row items-center justify-between">
                                                <Text className="text-base font-bold text-text">{studentName}</Text>
                                                {studentState && (
                                                    <View className="flex-row items-center gap-2">
                                                        <Text className="text-sm text-muted">Precisión:</Text>
                                                        <Text className={`text-sm font-bold ${studentState.accuracyPct >= 60 ? 'text-green-600' : 'text-orange-500'}`}>
                                                            {studentState.accuracyPct}%
                                                        </Text>
                                                        <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={palette.muted} />
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>

                                        {isExpanded && (
                                            <View className="px-3 pb-3 pt-0">
                                                <View className="h-[1px] bg-border/50 mb-3" />
                                                {!Array.isArray(answers) || answers.length === 0 ? (
                                                    <Text className="text-sm text-muted italic">No hay respuestas aún.</Text>
                                                ) : (
                                                    answers.map((ans: any, idx: number) => (
                                                        <View key={ans.id || `${studentName}-${ans.questionId}-${idx}`} className="mb-2 last:mb-0 p-2 rounded-lg bg-surface border border-border/30">
                                                            <Text className="text-xs text-muted mb-1">
                                                                {ans.questionText || `Pregunta ${idx + 1}`}
                                                            </Text>
                                                            <View className="flex-row items-center justify-between">
                                                                <Text className="text-sm font-medium text-text">
                                                                    {ans.answer || ans.selectedOptionText || ans.selectedOption || "Sin respuesta"}
                                                                </Text>
                                                                <View className={`px-2 py-0.5 rounded-md ${ans.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                                                    <Text className={`text-xs font-bold ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                                        {ans.isCorrect ? 'Correcta' : 'Incorrecta'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    ))
                                                )}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                            {allStudentNames.length === 0 && (
                                <Text className="text-sm text-muted italic text-center py-8">Esperando estudiantes...</Text>
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
