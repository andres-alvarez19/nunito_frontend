import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";
import { palette } from "@/theme/colors";
import {
    RoomMonitoringSnapshotDto,
    StudentMonitoringStateDto,
} from "@/types/monitoring";

interface TeacherLiveSessionProps {
    roomCode: string;
    gameName: string;
    connectedCount: number;
    connectedUsers: string[];
    monitoringData?: RoomMonitoringSnapshotDto;
    onEndActivity: () => void;
}

const formatAccuracy = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "0%";
    return `${value.toFixed(1)}%`;
};

const formatMillisToSeconds = (millis?: number) => {
    if (typeof millis !== "number" || Number.isNaN(millis)) return "—";
    return `${(millis / 1000).toFixed(1)} s`;
};

export default function TeacherLiveSession({
                                               roomCode,
                                               gameName,
                                               connectedCount,
                                               connectedUsers,
                                               monitoringData,
                                               onEndActivity,
                                           }: TeacherLiveSessionProps) {
    const globalStats = monitoringData?.globalStats;
    const students: StudentMonitoringStateDto[] = monitoringData?.students || [];

    const liveAccuracy = globalStats?.globalAccuracyPct ?? 0;
    const totalAnsweredAll = globalStats?.totalAnsweredAll ?? 0;
    const totalCorrectAll = globalStats?.totalCorrectAll ?? 0;
    const activeStudentsCount =
        globalStats?.activeStudentsCount ?? students.length;

    // Ordenar estudiantes por cantidad respondida (más activos arriba)
    const sortedStudents = [...students].sort(
        (a, b) => b.totalAnswered - a.totalAnswered,
    );

    return (
        <TeacherSectionCard
            title="Sesión en vivo"
            subtitle={`Juego: ${gameName} • Código: ${roomCode}`}
        >
            {/* Resumen general arriba */}
            <View className="flex-row gap-4 mb-6">
                {/* Tarjetas de resumen */}
                <View className="flex-1 gap-3">
                    <View className="bg-surface rounded-2xl border border-border p-4 gap-2 shadow-sm">
                        <Text className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                            Estudiantes conectados
                        </Text>
                        <Text className="text-3xl font-extrabold text-text">
                            {connectedCount}
                        </Text>
                        <Text className="text-xs text-emerald-700 font-medium mt-1">
                            ● {activeStudentsCount} activos respondiendo
                        </Text>
                    </View>

                    <View className="bg-surface rounded-2xl border border-border p-4 gap-2 shadow-sm">
                        <Text className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                            Precisión global
                        </Text>
                        <Text className="text-3xl font-extrabold text-text">
                            {formatAccuracy(liveAccuracy)}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                            {totalCorrectAll} aciertos de {totalAnsweredAll} respuestas
                        </Text>
                        <View className="h-1.5 bg-surfaceMuted rounded-full overflow-hidden mt-2">
                            <View
                                className="h-full bg-emerald-500"
                                style={{ width: `${Math.max(0, Math.min(100, liveAccuracy))}%` }}
                            />
                        </View>
                    </View>
                </View>

                {/* Lista rápida de conectados */}
                <View className="flex-1 bg-surface rounded-2xl border border-border p-4 gap-3 shadow-sm">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-bold text-text">
                            Estudiantes en la sala
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <View
                                className={`w-2 h-2 rounded-full ${
                                    connectedCount > 0 ? "bg-emerald-500" : "bg-gray-400"
                                }`}
                            />
                            <Text className="text-[11px] font-semibold text-muted">
                                {connectedCount > 0 ? "Sesión en curso" : "Sin estudiantes"}
                            </Text>
                        </View>
                    </View>

                    {connectedUsers.length === 0 ? (
                        <Text className="text-xs text-muted">
                            Aún no hay estudiantes conectados. Pide que ingresen el código
                            <Text className="font-mono font-semibold"> {roomCode}</Text>.
                        </Text>
                    ) : (
                        <View className="flex-row flex-wrap gap-1.5 mt-1">
                            {connectedUsers.map((name) => (
                                <View
                                    key={name}
                                    className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30"
                                >
                                    <Text className="text-[11px] font-semibold text-text">
                                        {name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            {/* Tabla de progreso en tiempo real */}
            <View className="flex-1 gap-2">
                <Text className="text-base font-bold text-text">
                    Progreso de estudiantes en tiempo real
                </Text>

                <View className="border border-border/70 rounded-2xl bg-surface overflow-hidden">
                    {sortedStudents.length === 0 ? (
                        <View className="p-4 items-center justify-center">
                            <Text className="text-sm text-muted text-center">
                                Aún no hay respuestas registradas. A medida que los estudiantes
                                participen, verás aquí sus avances (pregunta actual, aciertos,
                                errores, precisión y tiempos).
                            </Text>
                        </View>
                    ) : (
                        <ScrollView className="max-h-[420px]">
                            {sortedStudents.map((student) => {
                                const wrongAnswers =
                                    student.totalAnswered - student.totalCorrect;

                                return (
                                    <View
                                        key={student.studentId}
                                        className="px-4 py-3 border-b border-border/40"
                                    >
                                        <View className="flex-row justify-between items-start gap-3">
                                            {/* Info del estudiante + pregunta actual */}
                                            <View className="flex-1 gap-1">
                                                <View className="flex-row items-center gap-2">
                                                    <Text className="text-sm font-bold text-text">
                                                        {student.studentName}
                                                    </Text>
                                                    <View
                                                        className={`px-2 py-0.5 rounded-full flex-row items-center gap-1 ${
                                                            student.status === "online"
                                                                ? "bg-emerald-50 border border-emerald-200"
                                                                : "bg-gray-100 border border-gray-300"
                                                        }`}
                                                    >
                                                        <View
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                student.status === "online"
                                                                    ? "bg-emerald-500"
                                                                    : "bg-gray-400"
                                                            }`}
                                                        />
                                                        <Text
                                                            className={`text-[10px] font-bold uppercase ${
                                                                student.status === "online"
                                                                    ? "text-emerald-700"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            {student.status === "online"
                                                                ? "En línea"
                                                                : "Desconectado"}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <Text
                                                    className="text-[11px] text-muted"
                                                    numberOfLines={2}
                                                >
                                                    Pregunta actual:{" "}
                                                    {student.currentQuestionText || "—"}
                                                </Text>

                                                {student.lastSelectedOptionText && (
                                                    <View className="flex-row items-center gap-1 mt-0.5">
                                                        <Feather
                                                            name={
                                                                student.lastIsCorrect
                                                                    ? "check-circle"
                                                                    : "x-circle"
                                                            }
                                                            size={14}
                                                            color={
                                                                student.lastIsCorrect
                                                                    ? palette.mint
                                                                    : palette.error
                                                            }
                                                        />
                                                        <Text
                                                            className="text-[11px] text-muted"
                                                            numberOfLines={1}
                                                        >
                                                            Última respuesta:{" "}
                                                            {student.lastSelectedOptionText}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Métricas numéricas */}
                                            <View className="w-[150px] gap-1">
                                                <View className="flex-row justify-between">
                                                    <Text className="text-[11px] text-muted">
                                                        Respondidas
                                                    </Text>
                                                    <Text className="text-sm font-semibold text-text">
                                                        {student.totalAnswered}
                                                    </Text>
                                                </View>

                                                <View className="flex-row justify-between">
                                                    <Text className="text-[11px] text-emerald-700">
                                                        Aciertos
                                                    </Text>
                                                    <Text className="text-sm font-semibold text-emerald-700">
                                                        {student.totalCorrect}
                                                    </Text>
                                                </View>

                                                <View className="flex-row justify-between">
                                                    <Text className="text-[11px] text-red-600">
                                                        Errores
                                                    </Text>
                                                    <Text className="text-sm font-semibold text-red-600">
                                                        {wrongAnswers}
                                                    </Text>
                                                </View>

                                                <View className="flex-row justify-between">
                                                    <Text className="text-[11px] text-muted">
                                                        Precisión
                                                    </Text>
                                                    <Text className="text-sm font-semibold text-text">
                                                        {formatAccuracy(student.accuracyPct)}
                                                    </Text>
                                                </View>

                                                <View className="flex-row justify-between">
                                                    <Text className="text-[11px] text-muted">
                                                        Tiempo medio
                                                    </Text>
                                                    <Text className="text-sm font-semibold text-text">
                                                        {formatMillisToSeconds(
                                                            student.avgResponseMillis,
                                                        )}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
            </View>

            {/* Botón de finalizar */}
            <View className="mt-6 flex-row justify-end">
                <TouchableOpacity
                    className="px-4 py-2.5 rounded-xl bg-error/10 border border-error/50 flex-row items-center gap-2"
                    onPress={onEndActivity}
                >
                    <Feather name="stop-circle" size={18} color={palette.error} />
                    <Text className="text-sm font-semibold text-error">
                        Finalizar actividad
                    </Text>
                </TouchableOpacity>
            </View>
        </TeacherSectionCard>
    );
}
