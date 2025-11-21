import React, { useEffect } from "react";
import { Text, View, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";
import { palette } from "@/theme/colors";
import RecentActivity from "@/features/home/components/RecentActivity";
import { RoomSummaryItem } from "@/features/home/types";
import { useDashboard } from "@/services/useDashboard";
import { useAuth } from "@/contexts/AuthContext";

interface TeacherDashboardProps {
    onNavigateToRoom: (room: RoomSummaryItem) => void;
    onCreateRoom: () => void;
    onNavigateToReports: () => void;
    onNavigateToRooms: () => void;
}

export default function TeacherDashboard({
    onNavigateToRoom,
    onCreateRoom,
    onNavigateToReports,
    onNavigateToRooms,
}: TeacherDashboardProps) {
    const { user } = useAuth();
    const { stats, recentRooms, loading, fetchDashboardData } = useDashboard();

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData(user.id);
        }
    }, [user?.id, fetchDashboardData]);

    if (loading && !stats) {
        return (
            <TeacherSectionCard title="Inicio" subtitle="Panel principal">
                <View className="h-40 items-center justify-center">
                    <ActivityIndicator size="large" color={palette.primary} />
                </View>
            </TeacherSectionCard>
        );
    }

    return (
        <TeacherSectionCard title="Inicio" subtitle="Panel principal">
            <View className="mt-4 mb-6 gap-2 items-center">
                <Text className="text-[22px] font-bold text-text">
                    Hola, {user?.name || "Profesor"}
                </Text>
                <Text className="text-sm text-muted text-center">
                    Desde aquí puedes crear salas, gestionar actividades y ver reportes de
                    tus estudiantes.
                </Text>
            </View>

            <View className="flex-row flex-wrap gap-3 mt-2 mb-5">
                <Pressable
                    onPress={onNavigateToRooms}
                    className="flex-1 min-w-[48%] rounded-2xl py-3.5 px-4 border border-accent/30 bg-accent/5 shadow-md grow active:scale-95"
                >
                    <Text className="text-[13px] font-semibold text-primary mb-1">
                        Salas activas
                    </Text>
                    <Text className="text-3xl font-bold text-primary">
                        {stats?.activeRoomsCount || 0}
                    </Text>
                    <Text className="mt-1 text-xs text-muted">sesiones en progreso</Text>
                </Pressable>
                <View className="flex-1 min-w-[48%] rounded-2xl py-3.5 px-4 border border-mintContainer/50 bg-mintContainer/30 shadow-md grow">
                    <Text className="text-[13px] font-semibold text-mint mb-1">
                        Estudiantes
                    </Text>
                    <Text className="text-3xl font-bold text-mint">
                        {stats?.connectedStudentsCount || 0}
                    </Text>
                    <Text className="mt-1 text-xs text-muted">conectados esta semana</Text>
                </View>
                <Pressable
                    onPress={onNavigateToReports}
                    className="flex-1 min-w-[48%] rounded-2xl py-3.5 px-4 border border-violetContainer/50 bg-violetContainer/30 shadow-md grow active:scale-95"
                >
                    <Text className="text-[13px] font-semibold text-violet mb-1">
                        Actividades
                    </Text>
                    <Text className="text-3xl font-bold text-violet">
                        {stats?.completedActivitiesCount || 0}
                    </Text>
                    <Text className="mt-1 text-xs text-muted">completadas</Text>
                </Pressable>
                <Pressable
                    onPress={onNavigateToReports}
                    className="flex-1 min-w-[48%] rounded-2xl py-3.5 px-4 border border-blueContainer/50 bg-blueContainer/30 shadow-md grow active:scale-95"
                >
                    <Text className="text-[13px] font-semibold text-blue mb-1">
                        Progreso
                    </Text>
                    <Text className="text-3xl font-bold text-blue">
                        {stats?.averageProgress || 0}%
                    </Text>
                    <Text className="mt-1 text-xs text-muted">promedio general</Text>
                </Pressable>
            </View>

            <RecentActivity
                rooms={recentRooms}
                onNavigateToRoom={onNavigateToRoom}
                onCreateRoom={onCreateRoom}
            />
        </TeacherSectionCard>
    );
}
