import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type NotificationType = "error" | "success" | "warning" | "info";

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    showNotification: (type: NotificationType, message: string, duration?: number) => void;
    hideNotification: (id: string) => void;
    error: (message: string, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback(
        (type: NotificationType, message: string, duration: number = 4000) => {
            const id = `${Date.now()}-${Math.random()}`;
            const notification: Notification = { id, type, message, duration };

            setNotifications((prev) => [...prev, notification]);

            // Auto-dismiss after duration
            if (duration > 0) {
                setTimeout(() => {
                    hideNotification(id);
                }, duration);
            }
        },
        []
    );

    const hideNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    // Convenience methods
    const error = useCallback(
        (message: string, duration?: number) => showNotification("error", message, duration),
        [showNotification]
    );

    const success = useCallback(
        (message: string, duration?: number) => showNotification("success", message, duration),
        [showNotification]
    );

    const warning = useCallback(
        (message: string, duration?: number) => showNotification("warning", message, duration),
        [showNotification]
    );

    const info = useCallback(
        (message: string, duration?: number) => showNotification("info", message, duration),
        [showNotification]
    );

    const value: NotificationContextType = {
        notifications,
        showNotification,
        hideNotification,
        error,
        success,
        warning,
        info,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}

export { NotificationContext };
