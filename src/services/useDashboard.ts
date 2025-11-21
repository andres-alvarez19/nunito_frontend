import { useState, useCallback } from "react";
import { dashboardController } from "@/controllers/dashboard";
import { DashboardStats } from "@/models/dashboard";
import { RoomSummaryItem } from "@/features/home/types";

export const useDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentRooms, setRecentRooms] = useState<RoomSummaryItem[]>([]);
    const [activeRooms, setActiveRooms] = useState<RoomSummaryItem[]>([]);
    const [pastRooms, setPastRooms] = useState<RoomSummaryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async (teacherId: string) => {
        setLoading(true);
        setError(null);
        try {
            const [statsData, recentData] = await Promise.all([
                dashboardController.getStats(teacherId),
                dashboardController.getRecentRooms(teacherId)
            ]);
            setStats(statsData);
            setRecentRooms(recentData);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Error al cargar datos del dashboard");
            // Fallback/Mock data for demo purposes if API fails (since endpoints are missing)
            setStats({
                activeRoomsCount: 0,
                connectedStudentsCount: 0,
                completedActivitiesCount: 0,
                averageProgress: 0
            });
            setRecentRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRooms = useCallback(async (teacherId: string) => {
        setLoading(true);
        setError(null);
        try {
            const [activeData, pastData] = await Promise.all([
                dashboardController.getRoomsByStatus(teacherId, 'active'),
                dashboardController.getRoomsByStatus(teacherId, 'past')
            ]);
            setActiveRooms(activeData);
            setPastRooms(pastData);
        } catch (err) {
            console.error("Error fetching rooms:", err);
            setError("Error al cargar las salas");
            setActiveRooms([]);
            setPastRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        stats,
        recentRooms,
        activeRooms,
        pastRooms,
        loading,
        error,
        fetchDashboardData,
        fetchRooms
    };
};
