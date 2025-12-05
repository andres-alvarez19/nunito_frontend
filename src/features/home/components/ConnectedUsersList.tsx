import React from "react";
import { Text, View, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { palette, withAlpha } from "@/theme/colors";

interface ConnectedUsersListProps {
    connectedUsers: string[];
    connectingUsers: string[];
}

export default function ConnectedUsersList({
    connectedUsers,
    connectingUsers,
}: ConnectedUsersListProps) {
    return (
        <View className="gap-4">
            <View className="flex-row gap-4">
                {/* Users List */}
                <View className="flex-1 bg-surface rounded-2xl border border-border p-4 gap-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-text">Estudiantes</Text>
                        <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                            <Text className="text-xs font-bold text-primary">
                                {connectedUsers.length + connectingUsers.length}
                            </Text>
                        </View>
                    </View>

                    <ScrollView className="max-h-[200px]" showsVerticalScrollIndicator={false}>
                        {connectedUsers.length === 0 && connectingUsers.length === 0 ? (
                            <Text className="text-sm text-muted italic text-center py-4">
                                Esperando estudiantes...
                            </Text>
                        ) : (
                            <View className="gap-2">
                                {connectedUsers.map((user, index) => (
                                    <View key={`connected-${index}`} className="flex-row items-center gap-2">
                                        <View className="w-2 h-2 rounded-full bg-green-500" />
                                        <Text className="text-sm font-medium text-text">{user}</Text>
                                    </View>
                                ))}
                                {connectingUsers.map((user, index) => (
                                    <View key={`connecting-${index}`} className="flex-row items-center gap-2 opacity-60">
                                        <View className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <Text className="text-sm font-medium text-text">{user} (Conectando...)</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>


            </View>
        </View>
    );
}
