import React from "react";
import { Text, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";
import RoomSummaryCard from "@/features/home/components/teacher/RoomSummaryCard";
import { palette } from "@/theme/colors";
import { RoomSummaryItem } from "@/features/home/types";

interface MyRoomsProps {
    activeRooms: RoomSummaryItem[];
    pastRooms: RoomSummaryItem[];
    onNavigateToRoom: (room: RoomSummaryItem) => void;
    onCreateRoom: () => void;
    onStartActivity: (roomId: string) => void;
}

export default function MyRooms({
    activeRooms,
    pastRooms,
    onNavigateToRoom,
    onCreateRoom,
    onStartActivity,
}: MyRoomsProps) {
    return (
        <TeacherSectionCard title="Mis Salas" subtitle="Salas activas y anteriores">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-semibold text-text">Salas activas</Text>
                <Pressable
                    className="flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-xl active:scale-95"
                    onPress={onCreateRoom}
                >
                    <Feather name="plus" size={18} color={palette.primaryOn} />
                    <Text className="text-sm font-semibold text-primaryOn">
                        Nueva Sala
                    </Text>
                </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-4">
                {activeRooms.length > 0 ? (
                    activeRooms.map((room) => (
                        <RoomSummaryCard
                            key={room.id}
                            title={room.title}
                            gameLabel={room.gameLabel}
                            dateTime={room.dateTime}
                            students={room.students}
                            average={room.average}
                            completion={room.completion}
                            code={room.code}
                            onPressDetails={() => onNavigateToRoom(room)}
                            onStartActivity={() => onStartActivity(room.id)}
                        />
                    ))
                ) : (
                    <Text className="text-muted italic mb-2">No hay salas activas</Text>
                )}
            </View>
            <Text className="mt-4 mb-1 text-base font-semibold text-text">
                Salas anteriores
            </Text>
            <View className="flex-row flex-wrap gap-4">
                {pastRooms.length > 0 ? (
                    pastRooms.map((room) => (
                        <RoomSummaryCard
                            key={room.id}
                            title={room.title}
                            gameLabel={room.gameLabel}
                            dateTime={room.dateTime}
                            students={room.students}
                            average={room.average}
                            completion={room.completion}
                            onPressDetails={() => onNavigateToRoom(room)}
                        />
                    ))
                ) : (
                    <Text className="text-muted italic">No hay salas anteriores</Text>
                )}
            </View>
        </TeacherSectionCard>
    );
}
