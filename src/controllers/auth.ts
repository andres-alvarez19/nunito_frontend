import apiClient from "./client";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from "@/models/auth";

export const authController = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post("/auth/login", data);
        const { teacher, token } = response.data;
        // Map backend response to expected shape
        return { user: teacher, token: token.accessToken } as LoginResponse;
    },

    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await apiClient.post("/auth/register", data);
        const { teacher, token } = response.data;
        // Map backend response to expected shape
        return { user: teacher, token: token.accessToken } as RegisterResponse;
    },

    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<User>("/auth/me");
        return response.data;
    },

    async logout(): Promise<void> {
        // Optional: call backend logout endpoint if it exists
        // await apiClient.post("/auth/logout");
    },
};
