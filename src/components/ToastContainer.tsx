import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotification } from "@/contexts/NotificationContext";
import Toast from "./Toast";

export default function ToastContainer() {
    const { notifications, hideNotification } = useNotification();
    const insets = useSafeAreaInsets();

    if (notifications.length === 0) {
        return null;
    }

    return (
        <View
            style={[
                styles.container,
                {
                    top: insets.top,
                },
            ]}
            pointerEvents="box-none"
        >
            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onDismiss={hideNotification}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 9999,
    },
});
