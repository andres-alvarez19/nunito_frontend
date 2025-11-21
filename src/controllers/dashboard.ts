import { API_CONFIG } from "@/config/api";
import { DashboardStats, DashboardRoomSummary } from "@/models/dashboard";
import { RoomSummaryItem } from "@/features/home/types";

export const dashboardController = {
    getStats: async (teacherId: string): Promise<DashboardStats> => {
        const response = await fetch(`${API_CONFIG.BASE_URL}/teachers/${teacherId}/dashboard/stats`);
        if (!response.ok) {
            throw new Error("Failed to fetch dashboard stats");
        }
        return response.json();
    },

    getRecentRooms: async (teacherId: string): Promise<RoomSummaryItem[]> => {
        const response = await fetch(`${API_CONFIG.BASE_URL}/teachers/${teacherId}/dashboard/recent-rooms`);
        if (!response.ok) {
            throw new Error("Failed to fetch recent rooms");
        }
        return response.json();
    },

    getRoomsByStatus: async (teacherId: string, status: 'active' | 'past'): Promise<RoomSummaryItem[]> => {
        const response = await fetch(`${API_CONFIG.BASE_URL}/teachers/${teacherId}/rooms?status=${status}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${status} rooms`);
        }
        return response.json();
    }
};
