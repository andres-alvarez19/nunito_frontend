import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { palette } from "@/theme/colors";
import { RoomSummaryItem } from "@/features/home/types";

interface RecentActivityProps {
    rooms: RoomSummaryItem[];
    onNavigateToRoom: (room: RoomSummaryItem) => void;
    onCreateRoom: () => void;
}

export default function RecentActivity({
    rooms,
    onNavigateToRoom,
    onCreateRoom,
}: RecentActivityProps) {
    const recentRooms = rooms.slice(0, 2); // Max 2 rooms

    return (
        <View className="mt-2 mb-1 rounded-2xl border border-border/80 bg-surface py-3.5 px-4 gap-2 shadow-sm">
            <View className="gap-1 flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                    <Feather name="bar-chart-2" size={18} color={palette.primary} />
                    <Text className="text-base font-bold text-text">Actividad reciente</Text>
                </View>
            </View>
            <Text className="text-[13px] text-muted">Últimas salas creadas</Text>

            <View className="mt-1.5 gap-2">
                {recentRooms.length > 0 ? (
                    recentRooms.map((room) => (
                        <TouchableOpacity
                            key={room.id}
                            className="p-3 rounded-xl bg-background/70 border border-border/50 flex-row justify-between items-center"
                            onPress={() => onNavigateToRoom(room)}
                        >
                            <View>
                                <Text className="text-sm font-semibold text-text">
                                    {room.title}
                                </Text>
                                <Text className="text-xs text-muted">
                                    {new Date(room.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={16} color={palette.muted} />
                        </TouchableOpacity>
                    ))
                ) : (
                    <View className="p-2.5 rounded-xl bg-background/70">
                        <View className="gap-0.5">
                            <Text className="text-sm font-semibold text-text">
                                No hay actividad reciente
                            </Text>
                            <Text className="text-xs text-muted">
                                Crea una nueva sala para comenzar
                            </Text>
                            <TouchableOpacity onPress={onCreateRoom} className="mt-2">
                                <Text className="text-primary font-semibold text-sm">Crear sala</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
