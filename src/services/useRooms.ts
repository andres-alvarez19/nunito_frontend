import { API_CONFIG } from "@/config/api";

export async function validateRoomCode(roomCode: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/rooms/validate/${roomCode}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists === true;
  } catch {
    return false;
  }
}
