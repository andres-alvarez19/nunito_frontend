import type { AnswerRecord, AnswerSubmission } from "@/types/answers";

export interface StompPublisherLike {
  connected?: boolean;
  publish: (args: { destination: string; body: string }) => void;
}

export interface DeliveryResult {
  deliveredVia: "ws" | "rest";
  success: boolean;
  error?: unknown;
}

export interface AnswerEventPayload {
  roomId: string;
  studentId: string;
  studentName: string;
  gameId: string;
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  isCorrect: boolean;
  elapsedMillis: number;
  answeredAt: string;
}

export interface AnswerViewModel {
  id?: string;
  roomId?: string;
  studentId: string;
  studentName?: string;
  questionId: string;
  questionText?: string;
  selectedOptionId?: string | null;
  selectedOptionText?: string | null;
  answer: string;
  correct?: boolean;
  isCorrect?: boolean;
  attempt?: number;
  elapsedMs?: number;
  sentAt?: string;
  createdAt?: string;
}

export function buildAnswerSubmission(input: {
  studentId: string;
  questionId: string;
  answer: string;
  questionText?: string;
  isCorrect: boolean;
  elapsedMs: number;
  attempt?: number;
  sentAt?: string;
  replace?: boolean;
  studentName?: string;
  gameId?: string;
  selectedOptionId?: string | null;
  selectedOptionText?: string | null;
}): AnswerSubmission {
  return {
    studentId: input.studentId,
    questionId: input.questionId,
    answer: input.answer,
    questionText: input.questionText,
    isCorrect: input.isCorrect,
    elapsedMs: input.elapsedMs,
    attempt: input.attempt ?? 1,
    sentAt: input.sentAt ?? new Date().toISOString(),
    replace: input.replace ?? false,
    studentName: input.studentName,
    gameId: input.gameId,
    selectedOptionId: input.selectedOptionId,
    selectedOptionText: input.selectedOptionText,
  };
}

export function normalizeAnswerRecord(record: Partial<AnswerRecord> & Pick<AnswerRecord, "studentId" | "questionId" | "answer">): AnswerViewModel {
  const correctFlag = (record as any).correct ?? record.isCorrect;
  return {
    id: record.id,
    roomId: record.roomId,
    studentId: record.studentId,
    studentName: record.studentName ?? record.studentId,
    questionId: record.questionId,
    questionText: (record as any).questionText,
    selectedOptionId: (record as any).selectedOptionId,
    selectedOptionText: (record as any).selectedOptionText,
    answer: record.answer,
    correct: typeof correctFlag === "boolean" ? correctFlag : undefined,
    isCorrect: typeof correctFlag === "boolean" ? correctFlag : undefined,
    attempt: record.attempt,
    elapsedMs: record.elapsedMs,
    sentAt: record.sentAt,
    createdAt: record.createdAt,
  };
}

export async function sendAnswerWithFallback(options: {
  roomId: string;
  submission: AnswerSubmission;
  stompClient?: StompPublisherLike | null;
}): Promise<DeliveryResult> {
  const payload: AnswerSubmission = {
    ...options.submission,
    sentAt: options.submission.sentAt ?? new Date().toISOString(),
  };
  const selectedOptionId = payload.selectedOptionId ?? null;
  const selectedOptionText = payload.selectedOptionText ?? payload.answer ?? null;
  const wsPayload: AnswerEventPayload = {
    roomId: options.roomId,
    studentId: payload.studentId,
    studentName: payload.studentName ?? payload.studentId,
    gameId: payload.gameId ?? "unknown",
    questionId: payload.questionId,
    questionText: payload.questionText ?? "",
    selectedOptionId,
    selectedOptionText,
    isCorrect: payload.isCorrect ?? false,
    elapsedMillis: payload.elapsedMs ?? 0,
    answeredAt: payload.sentAt ?? new Date().toISOString(),
  };

  if (options.stompClient?.connected) {
    try {
      console.log("Publishing WS answer payload:", wsPayload);
      options.stompClient.publish({
        destination: `/app/monitoring/room/${options.roomId}/answer`,
        body: JSON.stringify(wsPayload),
      });
      return { deliveredVia: "ws", success: true };
    } catch (error) {
      return { deliveredVia: "ws", success: false, error };
    }
  }

  return { deliveredVia: "ws", success: false, error: new Error("WS client not connected") };
}
