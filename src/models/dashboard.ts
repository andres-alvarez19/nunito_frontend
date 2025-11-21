import { RoomSummaryItem } from "@/features/home/types";

export interface DashboardStats {
    activeRoomsCount: number;
    connectedStudentsCount: number;
    completedActivitiesCount: number;
    averageProgress: number;
}

export interface DashboardRoomSummary extends RoomSummaryItem {
    // Extend if needed, but RoomSummaryItem seems sufficient for now
}
