const BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    "https://nunito-backend-production.up.railway.app/api";

export const API_CONFIG = {
    BASE_URL,
    TIMEOUT: 10000,
};
