import { API_CONFIG } from "@/config/api";
import { apiClient } from "@/controllers";
import type { Room, Teacher } from "@/features/home/types";

export async function createRoom(data: {
  teacherId: string;
  name: string;
  games: string[];
  difficulty: string;
  durationMinutes: number;
  testSuiteId?: string;
}): Promise<Room> {
  const response = await apiClient.post<Room>("/rooms", data);
  return response.data;
}

export async function validateRoomCode(roomCode: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/rooms/code/${roomCode}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.id || null;
  } catch {
    return null;
  }
}

export async function joinRoom(roomId: string, studentId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/rooms/${roomId}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function updateRoomStatus(roomId: string, status: 'active' | 'finished', isActive: boolean): Promise<boolean> {
  try {
    const response = await apiClient.patch(`/rooms/${roomId}/status`, { status, isActive });
    return response.status === 200;
  } catch (error) {
    console.error('Error updating room status:', error);
    return false;
  }
}
