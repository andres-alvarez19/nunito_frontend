import apiClient from "./client";
import { TestSuite, CreateTestSuiteRequest, UpdateTestSuiteRequest } from "@/models/testSuites";
import { Question, GameId } from "@/models/questions";

export const testSuitesController = {
    create: async (data: CreateTestSuiteRequest) => {
        const response = await apiClient.post<TestSuite>("/test-suites", data);
        return response.data;
    },

    getById: async (testSuiteId: string) => {
        const response = await apiClient.get<TestSuite>(`/test-suites/${testSuiteId}`);
        return response.data;
    },

    update: async (testSuiteId: string, data: UpdateTestSuiteRequest) => {
        const response = await apiClient.patch<TestSuite>(`/test-suites/${testSuiteId}`, data);
        return response.data;
    },

    delete: async (testSuiteId: string) => {
        await apiClient.delete(`/test-suites/${testSuiteId}`);
    },

    getQuestions: async (testSuiteId: string, gameType?: GameId) => {
        const response = await apiClient.get<Question[]>(`/test-suites/${testSuiteId}/questions`, {
            params: { gameType },
        });
        return response.data;
    },

    createQuestion: async (testSuiteId: string, data: any) => {
        const response = await apiClient.post<Question>(`/test-suites/${testSuiteId}/questions`, data);
        return response.data;
    },
};
