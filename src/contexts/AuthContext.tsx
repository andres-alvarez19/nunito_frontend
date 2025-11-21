import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authController } from "@/controllers/auth";
import { User, LoginRequest, RegisterRequest } from "@/models/auth";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "@nunito_auth_token";
const USER_KEY = "@nunito_user";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Restore session on mount
    useEffect(() => {
        restoreSession();
    }, []);

    const restoreSession = async () => {
        try {
            const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
            const storedUser = await AsyncStorage.getItem(USER_KEY);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (err) {
            console.error("Failed to restore session:", err);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authController.login(credentials);
            console.log('Login response:', response);
            // Store token and user
            await AsyncStorage.setItem(TOKEN_KEY, response.token);
            console.log('Stored token:', response.token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
            console.log('Stored user:', response.user);

            setToken(response.token);
            setUser(response.user);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Error al iniciar sesión";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authController.register(data);

            // Store token and user
            await AsyncStorage.setItem(TOKEN_KEY, response.token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));

            setToken(response.token);
            setUser(response.user);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Error al registrarse";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authController.logout();

            // Clear storage
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);

            setToken(null);
            setUser(null);
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        error,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export { AuthContext };
