import { apiClient } from "@/controllers";
import type { AnswerRecord, AnswerSubmission, GameResultSubmission } from "@/types/answers";
import type { StudentResult } from "@/features/home/types";

export async function submitAnswer(roomId: string, submission: AnswerSubmission): Promise<AnswerRecord> {
  const response = await apiClient.post<AnswerRecord>(`/rooms/${roomId}/answers`, submission);
  return response.data;
}

export async function fetchRoomAnswers(roomId: string, filters?: { studentId?: string; questionId?: string }): Promise<AnswerRecord[]> {
  const response = await apiClient.get<AnswerRecord[]>(`/rooms/${roomId}/answers`, {
    params: filters,
  });
  return response.data;
}

export async function fetchRoomResults(roomId: string): Promise<StudentResult[]> {
  const response = await apiClient.get<StudentResult[]>(`/rooms/${roomId}/results`);
  return response.data ?? [];
}

export async function submitGameResult(roomId: string, payload: GameResultSubmission): Promise<StudentResult> {
  const response = await apiClient.post<StudentResult>(`/rooms/${roomId}/results`, payload);
  return response.data;
}
