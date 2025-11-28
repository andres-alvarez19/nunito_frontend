import { API_CONFIG } from "@/config/api";
import { apiClient } from "@/controllers";
import { RoomSummaryItem, StudentResult } from "@/features/home/types";

export interface RoomReport {
    roomId: string;
    roomName: string;
    gameId: string;
    difficulty: string;
    studentsCount: number;
    averageScore: number;
    completionRate: number;
    createdAt: string;
    students: StudentResult[];
}

export const useReports = () => {
    const getTeacherReports = async (teacherId: string): Promise<RoomReport[]> => {
        try {
            // Fetch finished rooms
            // We use the dashboard controller's endpoint or similar
            const response = await apiClient.get<RoomSummaryItem[]>(`/teachers/${teacherId}/rooms?status=finished`);

            return response.data.map(room => ({
                roomId: room.id,
                roomName: room.title,
                gameId: room.gameId,
                difficulty: room.difficulty,
                studentsCount: room.students,
                averageScore: room.average,
                completionRate: room.completion,
                createdAt: room.createdAt,
                students: room.studentsResults || []
            }));
        } catch (error) {
            console.error("Error fetching reports:", error);
            return [];
        }
    };

    const getRoomReportDetails = async (roomId: string): Promise<RoomReport | null> => {
        try {
            // Try to get detailed report if available, otherwise we might rely on the list
            // For now, let's assume there is a specific endpoint for details if the list is insufficient
            // But based on RoomSummaryItem, it seems to contain studentsResults.
            // If we need to fetch it specifically:
            const response = await apiClient.get<RoomSummaryItem>(`/rooms/${roomId}/report`);
            const room = response.data;

            return {
                roomId: room.id,
                roomName: room.title,
                gameId: room.gameId,
                difficulty: room.difficulty,
                studentsCount: room.students,
                averageScore: room.average,
                completionRate: room.completion,
                createdAt: room.createdAt,
                students: room.studentsResults || []
            };
        } catch (error) {
            console.error(`Error fetching report for room ${roomId}:`, error);
            return null;
        }
    };

    return {
        getTeacherReports,
        getRoomReportDetails
    };
};
