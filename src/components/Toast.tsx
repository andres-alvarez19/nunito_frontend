import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { Notification, NotificationType } from "@/contexts/NotificationContext";
import { palette } from "@/theme/colors";

interface ToastProps {
    notification: Notification;
    onDismiss: (id: string) => void;
}

const TOAST_CONFIG = {
    error: {
        icon: "alert-circle" as const,
        backgroundColor: "#FEE2E2",
        borderColor: "#EF4444",
        textColor: "#991B1B",
        iconColor: "#DC2626",
    },
    success: {
        icon: "check-circle" as const,
        backgroundColor: "#D1FAE5",
        borderColor: "#10B981",
        textColor: "#065F46",
        iconColor: "#059669",
    },
    warning: {
        icon: "alert-triangle" as const,
        backgroundColor: "#FEF3C7",
        borderColor: "#F59E0B",
        textColor: "#92400E",
        iconColor: "#D97706",
    },
    info: {
        icon: "info" as const,
        backgroundColor: "#DBEAFE",
        borderColor: "#3B82F6",
        textColor: "#1E40AF",
        iconColor: "#2563EB",
    },
};

export default function Toast({ notification, onDismiss }: ToastProps) {
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    const config = TOAST_CONFIG[notification.type];

    useEffect(() => {
        // Entrance animation
        translateY.value = withSpring(0, {
            damping: 15,
            stiffness: 150,
        });
        opacity.value = withTiming(1, { duration: 200 });

        return () => {
            // Exit animation
            translateY.value = withTiming(-100, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const handleDismiss = () => {
        translateY.value = withTiming(-100, { duration: 200 }, () => {
            runOnJS(onDismiss)(notification.id);
        });
        opacity.value = withTiming(0, { duration: 200 });
    };

    return (
        <Animated.View
            style={[
                styles.container,
                animatedStyle,
                {
                    backgroundColor: config.backgroundColor,
                    borderLeftColor: config.borderColor,
                },
            ]}
        >
            <View style={styles.content}>
                <Feather name={config.icon} size={20} color={config.iconColor} />
                <Text
                    style={[styles.message, { color: config.textColor }]}
                    numberOfLines={3}
                >
                    {notification.message}
                </Text>
            </View>
            <Pressable
                onPress={handleDismiss}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Feather name="x" size={18} color={config.textColor} />
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 20,
    },
    closeButton: {
        marginLeft: 8,
        padding: 4,
    },
});
