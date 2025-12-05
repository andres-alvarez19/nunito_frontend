import { useState, useCallback } from "react";
import { dashboardController } from "@/controllers/dashboard";
import { DashboardStats } from "@/models/dashboard";
import { RoomSummaryItem } from "@/features/home/types";
import { gameDefinitions } from "@/features/home/constants/games";

export const useDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentRooms, setRecentRooms] = useState<RoomSummaryItem[]>([]);
    const [activeRooms, setActiveRooms] = useState<RoomSummaryItem[]>([]);
    const [pendingRooms, setPendingRooms] = useState<RoomSummaryItem[]>([]);
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
            const [pendingData, activeData, finishedData] = await Promise.all([
                dashboardController.getRoomsByStatus(teacherId, 'pending'),
                dashboardController.getRoomsByStatus(teacherId, 'active'),
                dashboardController.getRoomsByStatus(teacherId, 'finished')
            ]);

            // Helper to map game ID to label
            const mapGameLabel = (rooms: RoomSummaryItem[]) => {
                return rooms.map(room => {
                    console.log("Procesando sala cruda:", JSON.stringify(room, null, 2));
                    const gameDef = gameDefinitions.find(g => g.id === room.gameId);
                    // Handle case where students might be an array (from Room entity) or missing
                    const studentsVal = room.students as any;
                    const studentCount = Array.isArray(studentsVal)
                        ? studentsVal.length
                        : typeof studentsVal === 'number'
                            ? studentsVal
                            : 0;

                    return {
                        ...room,
                        title: (room as any).name || room.title,
                        students: studentCount,
                        average: room.average ?? 0,
                        completion: room.completion ?? 0,
                        studentsResults: room.studentsResults || [],
                        gameLabel: (room as any).games && (room as any).games.length > 0
                            ? (room as any).games[0].name
                            : gameDef ? gameDef.name : room.gameLabel || "Sin juegos",
                        gameLabels: (room as any).games
                            ? (room as any).games.map((g: any) => g.name)
                            : [gameDef ? gameDef.name : room.gameLabel || "Sin juegos"]
                    };
                });
            };

            setPendingRooms(mapGameLabel(pendingData));
            setActiveRooms(mapGameLabel(activeData));
            setPastRooms(mapGameLabel(finishedData));
        } catch (err) {
            console.error("Error fetching rooms:", err);
            setError("Error al cargar las salas");
            setActiveRooms([]);
            setPendingRooms([]);
            setPastRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        stats,
        recentRooms,
        activeRooms,
        pendingRooms,
        pastRooms,
        loading,
        error,
        fetchDashboardData,
        fetchRooms
    };
};
