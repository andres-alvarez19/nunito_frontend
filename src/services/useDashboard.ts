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
                    const studentsVal = (room as any).students;
                    const studentCount = Array.isArray(studentsVal)
                        ? studentsVal.length
                        : typeof studentsVal === 'number'
                            ? studentsVal
                            : typeof (room as any).studentsCount === 'number'
                                ? (room as any).studentsCount
                                : 0;

                    const averageScore = typeof (room as any).averageScore === 'number'
                        ? (room as any).averageScore
                        : room.average ?? 0;

                    const completionRate = typeof (room as any).completionRate === 'number'
                        ? (room as any).completionRate
                        : room.completion ?? 0;

                    const createdAt = room.createdAt || (room as any).lastActivityAt || (room as any).created_at || new Date().toISOString();
                    const resolvedGameLabel = (room as any).games && (room as any).games.length > 0
                        ? (room as any).games[0].name
                        : gameDef ? gameDef.name : room.gameLabel || "Sin juegos";

                    return {
                        ...room,
                        title: room.title || (room as any).name || (room as any).roomName || "Sala sin nombre",
                        students: studentCount,
                        average: Math.round(averageScore),
                        completion: Math.round(completionRate),
                        dateTime: room.dateTime || new Date(createdAt).toLocaleString(),
                        createdAt,
                        studentsResults: (room.studentsResults || room.students || []).map((student: any) => ({
                            name: student?.name || student?.studentName || "Estudiante",
                            score: Math.round(student?.score ?? 0),
                            correctAnswers: student?.correctAnswers ?? student?.correct ?? 0,
                            totalQuestions: student?.totalQuestions ?? student?.total ?? (student?.correctAnswers ?? 0) + (student?.incorrectAnswers ?? 0),
                            averageTime: Math.round(student?.averageTime ?? student?.averageTimeSeconds ?? 0),
                            completedAt: student?.completedAt ?? student?.finishedAt ?? student?.completed_at ?? new Date().toISOString(),
                            answers: Array.isArray(student?.answers)
                                ? student.answers.map((ans: any) => ({
                                    id: ans?.id,
                                    roomId: ans?.roomId,
                                    studentId: ans?.studentId,
                                    gameId: ans?.gameId,
                                    questionId: ans?.questionId?.toString?.() ?? "",
                                    questionText: ans?.questionText ?? null,
                                    answer: ans?.answer ?? "",
                                    isCorrect: ans?.isCorrect,
                                    elapsedMs: ans?.elapsedMs,
                                    attempt: ans?.attempt,
                                    createdAt: ans?.createdAt,
                                    sentAt: ans?.sentAt,
                                }))
                                : [],
                        })),
                        gameLabel: resolvedGameLabel,
                        gameLabels: (room as any).games
                            ? (room as any).games.map((g: any) => g.name)
                            : [resolvedGameLabel]
                    };
                });
            };

            setPendingRooms(mapGameLabel(pendingData).map(r => ({ ...r, status: 'pending' })));
            setActiveRooms(mapGameLabel(activeData).map(r => ({ ...r, status: 'active' })));
            setPastRooms(mapGameLabel(finishedData).map(r => ({ ...r, status: 'finished' })));
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
