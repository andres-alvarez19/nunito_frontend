import apiClient from "./client";
import { UploadResponse } from "@/models/upload";

export const uploadController = {
    uploadImage: async (file: string | File) => {
        const formData = new FormData();
        if (typeof file === "string") {
            // React Native: file is a URI, convertir a Blob
            const filename = file.split("/").pop() || "image.jpg";
            const response = await fetch(file);
            const blob = await response.blob();
            formData.append("file", blob, filename);
        } else {
            // Web: file is a File object
            formData.append("file", file);
        }
        const res = await apiClient.post<UploadResponse>("/upload/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    uploadAudio: async (file: string | File) => {
        const formData = new FormData();
        if (typeof file === "string") {
            // React Native: file is a URI, convertir a Blob
            const filename = file.split("/").pop() || "audio.mp3";
            const response = await fetch(file);
            const blob = await response.blob();
            formData.append("file", blob, filename);
        } else {
            // Web: file is a File object
            formData.append("file", file);
        }
        const res = await apiClient.post<UploadResponse>("/upload/audio", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },
};
