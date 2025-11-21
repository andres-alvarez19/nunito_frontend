import apiClient from "./client";
import { Question, CreateQuestionRequest } from "@/models/questions";

export const questionsController = {
    getById: async (questionId: string) => {
        const response = await apiClient.get<Question>(`/questions/${questionId}`);
        return response.data;
    },

    update: async (questionId: string, data: CreateQuestionRequest) => {
        const response = await apiClient.patch<Question>(`/questions/${questionId}`, data);
        return response.data;
    },

    delete: async (questionId: string) => {
        await apiClient.delete(`/questions/${questionId}`);
    },
};
