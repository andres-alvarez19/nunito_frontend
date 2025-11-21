import { useState } from "react";
import { uploadController } from "@/controllers/upload";

export const useUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (file: string | File) => {
        setUploading(true);
        setError(null);
        try {
            const response = await uploadController.uploadImage(file);
            return response.url;
        } catch (err: any) {
            let msg = "Error al subir la imagen";
            if (err?.response?.data?.message) msg = err.response.data.message;
            setError(msg);
            console.error(err);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    const uploadAudio = async (file: string | File) => {
        setUploading(true);
        setError(null);
        try {
            const response = await uploadController.uploadAudio(file);
            return response.url;
        } catch (err: any) {
            let msg = "Error al subir el audio";
            if (err?.response?.data?.message) msg = err.response.data.message;
            setError(msg);
            console.error(err);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    return {
        uploadImage,
        uploadAudio,
        uploading,
        error,
    };
};
