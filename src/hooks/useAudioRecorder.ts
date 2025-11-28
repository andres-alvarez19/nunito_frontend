import { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { useNotification } from "@/contexts/NotificationContext";

export const useAudioRecorder = () => {
    const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const { error: showError } = useNotification();

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, [recording]);

    async function startRecording() {
        try {
            if (permissionResponse?.status !== "granted") {
                const permission = await requestPermission();
                if (permission.status !== "granted") {
                    showError("Se necesita permiso para usar el micrófono");
                    return;
                }
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
            setAudioUri(null);
        } catch (err) {
            console.error("Failed to start recording", err);
            showError("No se pudo iniciar la grabación");
        }
    }

    async function stopRecording() {
        if (!recording) return;

        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setAudioUri(uri);
            setRecording(undefined);
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });
        } catch (err) {
            console.error("Failed to stop recording", err);
            showError("No se pudo detener la grabación");
        }
    }

    return {
        recording,
        isRecording,
        audioUri,
        startRecording,
        stopRecording,
        setAudioUri, // Allow manual reset
    };
};
