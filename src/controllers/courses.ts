import apiClient from "./client";
import { Course, CreateCourseRequest, UpdateCourseRequest } from "@/models/courses";
import { TestSuite } from "@/models/testSuites";

export const coursesController = {
    getAll: async (teacherId: string) => {
        const response = await apiClient.get<Course[]>("/courses", {
            params: { teacherId },
        });
        return response.data;
    },

    getById: async (courseId: string) => {
        const response = await apiClient.get<Course>(`/courses/${courseId}`);
        return response.data;
    },

    create: async (data: CreateCourseRequest) => {
        const response = await apiClient.post<Course>("/courses", data);
        return response.data;
    },

    update: async (courseId: string, data: UpdateCourseRequest) => {
        const response = await apiClient.patch<Course>(`/courses/${courseId}`, data);
        return response.data;
    },

    delete: async (courseId: string) => {
        await apiClient.delete(`/courses/${courseId}`);
    },

    getTestSuites: async (courseId: string) => {
        const response = await apiClient.get<TestSuite[]>(`/courses/${courseId}/test-suites`);
        return response.data;
    },
};
