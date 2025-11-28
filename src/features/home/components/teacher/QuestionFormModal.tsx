import { useState, useEffect } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import NunitoButton from "@/features/home/components/NunitoButton";
import { palette } from "@/theme/colors";
import type { Question } from "@/models/questions";
import { useUpload } from "@/services/useUpload";
import { useNotification } from "@/contexts/NotificationContext";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
interface QuestionFormModalProps {
    isOpen: boolean;
    gameType: "image-word" | "syllable-count" | "rhyme-identification" | "audio-recognition";
    question?: Question;
    testSuiteId: string;
    onSave: (question: any) => void;
    onClose: () => void;
}
export default function QuestionFormModal({
    isOpen,
    gameType,
    question,
    testSuiteId,
    onSave,
    onClose,
}: QuestionFormModalProps) {
    const { uploadImage, uploadAudio, uploading, error: uploadError } = useUpload();
    const { error: showError } = useNotification();
    // Common fields
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
    const [hint, setHint] = useState("");
    // Campo para el texto de la pregunta
    const [questionText, setQuestionText] = useState("");
    // Image-Word fields
    const [word, setWord] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [alternatives, setAlternatives] = useState<string[]>(["", "", ""]);
    // Syllable Count fields
    const [syllableCount, setSyllableCount] = useState(1);
    const [syllableSeparation, setSyllableSeparation] = useState("");
    const [syllableAlternatives, setSyllableAlternatives] = useState<number[]>([2, 3]);

    // Rhyme fields
    const [mainWord, setMainWord] = useState("");
    const [rhymingWords, setRhymingWords] = useState<string[]>(["", ""]);
    const [nonRhymingWords, setNonRhymingWords] = useState<string[]>(["", ""]);

    // Audio fields
    const [audioUrl, setAudioUrl] = useState("");
    const [audioTab, setAudioTab] = useState<'upload' | 'record' | 'ai'>('upload');
    const [ttsText, setTtsText] = useState("");
    const [recordedUri, setRecordedUri] = useState<string | null>(null);

    const {
        startRecording,
        stopRecording,
        isRecording,
        audioUri: recorderUri,
    } = useAudioRecorder();

    // Update recordedUri when recorder finishes
    useEffect(() => {
        if (recorderUri) {
            setRecordedUri(recorderUri);
        }
    }, [recorderUri]);

    // Update form when question changes (for editing)
    useEffect(() => {
        if (question) {
            setDifficulty(question.options?.difficulty || "easy");
            setHint(question.options?.hint || "");
            setQuestionText(question.text || "");
            switch (question.type) {
                case "image-word":
                    setWord(question.options?.word || "");
                    setImageUrl(question.options?.imageUrl || "");
                    setAlternatives(Array.isArray(question.options?.alternatives) && question.options.alternatives.length > 0 ? question.options.alternatives : ["", "", ""]);
                    break;
                case "syllable-count":
                    setWord(question.options?.word || "");
                    setSyllableCount(question.options?.syllableCount || 1);
                    setSyllableSeparation(question.options?.syllableSeparation || "");
                    setSyllableAlternatives(Array.isArray(question.options?.alternatives) ? question.options.alternatives : [2, 3]);
                    break;
                case "rhyme-identification":
                    setMainWord(question.options?.mainWord || "");
                    setRhymingWords(Array.isArray(question.options?.rhymingWords) && question.options.rhymingWords.length > 0 ? question.options.rhymingWords : ["", ""]);
                    setNonRhymingWords(Array.isArray(question.options?.nonRhymingWords) && question.options.nonRhymingWords.length > 0 ? question.options.nonRhymingWords : ["", ""]);
                    break;
                case "audio-recognition":
                    setWord(question.options?.word || "");
                    const url = question.options?.audioUrl || "";
                    setAudioUrl(url);
                    if (url.startsWith('tts:')) {
                        setAudioTab('ai');
                        setTtsText(url.replace('tts:', ''));
                    } else {
                        setAudioTab('upload');
                    }
                    setAlternatives(Array.isArray(question.options?.alternatives) && question.options.alternatives.length > 0 ? question.options.alternatives : ["", "", ""]);
                    break;
            }
        } else {
            // Reset form for new question
            setDifficulty("easy");
            setHint("");
            setQuestionText("");
            setWord("");
            setImageUrl("");
            setAlternatives(["", "", ""]);
            setSyllableCount(1);
            setSyllableSeparation("");
            setSyllableAlternatives([2, 3]);
            setMainWord("");
            setRhymingWords(["", ""]);
            setNonRhymingWords(["", ""]);
            setAudioUrl("");
            setAudioTab('upload');
            setTtsText("");
            setRecordedUri(null);
        }
    }, [question, isOpen]);

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            showError("Se necesita permiso para acceder a las imágenes");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            try {
                const url = await uploadImage(result.assets[0].uri);
                setImageUrl(url);
            } catch (e) {
                showError("No se pudo subir la imagen");
            }
        }
    };

    const handlePickAudio = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "audio/*",
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                try {
                    const url = await uploadAudio(result.assets[0].uri);
                    setAudioUrl(url);
                } catch (e) {
                    showError("No se pudo subir el audio");
                }
            }
        } catch (error) {
            showError("No se pudo seleccionar el archivo de audio");
        }
    };

    const handleStartRecording = async () => {
        await startRecording();
    };

    const handleStopRecording = async () => {
        await stopRecording();
    };

    const handlePlayRecording = async () => {
        if (recordedUri) {
            try {
                const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
                await sound.playAsync();
            } catch (e) {
                showError("No se pudo reproducir la grabación");
            }
        }
    };

    const handleUploadRecording = async () => {
        if (recordedUri) {
            try {
                const url = await uploadAudio(recordedUri);
                setAudioUrl(url);
                showError("Grabación guardada correctamente"); // Using showError as generic toast for now if showSuccess not avail
            } catch (e) {
                showError("No se pudo subir la grabación");
            }
        }
    };

    const handlePreviewTts = async () => {
        const text = ttsText.trim() || word;
        console.log("Attempting to preview TTS with text:", text);

        try {
            // Ensure audio plays even in silent mode
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                allowsRecordingIOS: false,
            });
            console.log("Audio mode set for playback");
        } catch (err) {
            console.error("Error setting audio mode:", err);
        }

        if (text) {
            try {
                // Minimal implementation: No stop, no language
                console.log("Calling Speech.speak (minimal)...");
                Speech.speak(text, {
                    onStart: () => console.log("TTS Started"),
                    onDone: () => console.log("TTS Done"),
                    onStopped: () => console.log("TTS Stopped"),
                    onError: (e) => console.error("TTS Error Event:", e)
                });
            } catch (e) {
                console.error("TTS Exception:", e);
                showError("Error al reproducir audio");
            }
        } else {
            console.log("No text to speak");
            showError("Ingresa texto para escuchar");
        }
    };

    const handleUseTts = () => {
        const text = ttsText.trim() || word;
        if (text) {
            setAudioUrl(`tts:${text}`);
            showError("Audio IA configurado");
        } else {
            showError("Ingresa texto para usar");
        }
    };

    const handleSave = () => {
        let questionData: any = {};
        if (gameType === "image-word") {
            questionData = {
                text: questionText,
                type: "image-word",
                options: {
                    word,
                    imageUrl,
                    alternatives: alternatives.filter((a) => a.trim()),
                    hint: hint || undefined,
                    difficulty,
                },
            };
        } else if (gameType === "syllable-count") {
            questionData = {
                text: questionText,
                type: "syllable-count",
                options: {
                    word,
                    syllableCount,
                    syllableSeparation,
                    alternatives: syllableAlternatives,
                    hint: hint || undefined,
                    difficulty,
                },
            };
        } else if (gameType === "rhyme-identification") {
            questionData = {
                text: questionText,
                type: "rhyme-identification",
                options: {
                    mainWord,
                    rhymingWords: rhymingWords.filter((w) => w.trim()),
                    nonRhymingWords: nonRhymingWords.filter((w) => w.trim()),
                    hint: hint || undefined,
                    difficulty,
                },
            };
        } else if (gameType === "audio-recognition") {
            questionData = {
                text: questionText,
                type: "audio-recognition",
                options: {
                    word,
                    audioUrl,
                    alternatives: alternatives.filter((a) => a.trim()),
                    hint: hint || undefined,
                    difficulty,
                },
            };
        }
        onSave(questionData);
    }

    // Renderiza los campos específicos según el tipo de juego
    const renderGameSpecificFields = () => {
        if (gameType === "image-word") {
            return (
                <>
                    {/* Word */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Palabra Correcta</Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={word}
                            onChangeText={setWord}
                            placeholder="Ej: casa"
                            placeholderTextColor={palette.muted}
                        />
                    </View>
                    {/* Image */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Imagen</Text>
                        <Pressable
                            className="border-2 border-dashed border-border rounded-xl p-4 items-center justify-center bg-surfaceMuted/30 active:bg-surfaceMuted/50"
                            onPress={handlePickImage}
                        >
                            {imageUrl ? (
                                <View className="items-center gap-2">
                                    <Image
                                        source={{ uri: imageUrl }}
                                        className="w-32 h-32 rounded-lg"
                                        resizeMode="cover"
                                    />
                                    <Text className="text-sm text-primary font-medium">Cambiar imagen</Text>
                                </View>
                            ) : (
                                <View className="items-center gap-2">
                                    <Feather name="image" size={48} color={palette.muted} />
                                    <Text className="text-sm text-muted">Seleccionar imagen</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>
                    {/* Alternatives */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Alternativas Incorrectas</Text>
                        {alternatives.map((alt, index) => (
                            <TextInput
                                key={index}
                                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                value={alt}
                                onChangeText={(text) => {
                                    const newAlts = [...alternatives];
                                    newAlts[index] = text;
                                    setAlternatives(newAlts);
                                }}
                                placeholder={`Alternativa ${index + 1}`}
                                placeholderTextColor={palette.muted}
                            />
                        ))}
                        <Pressable
                            className="flex-row items-center gap-2 p-2 active:opacity-70"
                            onPress={() => setAlternatives([...alternatives, ""])}
                        >
                            <Feather name="plus-circle" size={20} color={palette.primary} />
                            <Text className="text-sm text-primary font-medium">Agregar alternativa</Text>
                        </Pressable>
                    </View>
                </>
            );
        } else if (gameType === "syllable-count") {
            return (
                <>
                    {/* Word */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Palabra</Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={word}
                            onChangeText={setWord}
                            placeholder="Ej: mariposa"
                            placeholderTextColor={palette.muted}
                        />
                    </View>
                    {/* Syllable Count */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Número de Sílabas (Correcto)</Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={syllableCount.toString()}
                            onChangeText={(text) => setSyllableCount(parseInt(text) || 1)}
                            keyboardType="number-pad"
                            placeholder="Ej: 4"
                            placeholderTextColor={palette.muted}
                        />
                    </View>
                    {/* Syllable Separation */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Separación de Sílabas</Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={syllableSeparation}
                            onChangeText={setSyllableSeparation}
                            placeholder="Ej: ma-ri-po-sa"
                            placeholderTextColor={palette.muted}
                        />
                    </View>
                    {/* Alternatives */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Números Incorrectos</Text>
                        <View className="flex-row gap-2">
                            {syllableAlternatives.map((alt, index) => (
                                <TextInput
                                    key={index}
                                    className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-base text-text text-center"
                                    value={alt.toString()}
                                    onChangeText={(text) => {
                                        const newAlts = [...syllableAlternatives];
                                        newAlts[index] = parseInt(text) || 0;
                                        setSyllableAlternatives(newAlts);
                                    }}
                                    keyboardType="number-pad"
                                    placeholderTextColor={palette.muted}
                                />
                            ))}
                        </View>
                    </View>
                </>
            );
        } else if (gameType === "rhyme-identification") {
            return (
                <>
                    {/* Main Word */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Palabra Principal</Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={mainWord}
                            onChangeText={setMainWord}
                            placeholder="Ej: gato"
                            placeholderTextColor={palette.muted}
                        />
                    </View>
                    {/* Rhyming Words */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Palabras que Riman</Text>
                        {rhymingWords.map((word, index) => (
                            <TextInput
                                key={index}
                                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                value={word}
                                onChangeText={(text) => {
                                    const newWords = [...rhymingWords];
                                    newWords[index] = text;
                                    setRhymingWords(newWords);
                                }}
                                placeholder={`Palabra ${index + 1}`}
                                placeholderTextColor={palette.muted}
                            />
                        ))}
                        <Pressable
                            className="flex-row items-center gap-2 p-2 active:opacity-70"
                            onPress={() => setRhymingWords([...rhymingWords, ""])}
                        >
                            <Feather name="plus-circle" size={20} color={palette.primary} />
                            <Text className="text-sm text-primary font-medium">Agregar palabra</Text>
                        </Pressable>
                    </View>
                    {/* Non-Rhyming Words */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Palabras que NO Riman</Text>
                        {nonRhymingWords.map((word, index) => (
                            <TextInput
                                key={index}
                                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                value={word}
                                onChangeText={(text) => {
                                    const newWords = [...nonRhymingWords];
                                    newWords[index] = text;
                                    setNonRhymingWords(newWords);
                                }}
                                placeholder={`Palabra ${index + 1}`}
                                placeholderTextColor={palette.muted}
                            />
                        ))}
                        <Pressable
                            className="flex-row items-center gap-2 p-2 active:opacity-70"
                            onPress={() => setNonRhymingWords([...nonRhymingWords, ""])}
                        >
                            <Feather name="plus-circle" size={20} color={palette.primary} />
                            <Text className="text-sm text-primary font-medium">Agregar palabra</Text>
                        </Pressable>
                    </View>
                </>
            );
        } else if (gameType === "audio-recognition") {
            return (
                <>
                    {/* Text */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Palabra/Frase que se Oirá</Text>
                        <TextInput
                            className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                            value={word}
                            onChangeText={setWord}
                            placeholder="Ej: elefante"
                            placeholderTextColor={palette.muted}
                        />
                    </View>
                    {/* Audio Options Tabs */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Audio</Text>
                        <View className="flex-row bg-surfaceMuted/30 p-1 rounded-xl mb-2">
                            <Pressable
                                className={`flex-1 py-2 rounded-lg items-center ${audioTab === 'upload' ? 'bg-surface shadow-sm' : ''}`}
                                onPress={() => setAudioTab('upload')}
                            >
                                <Text className={`text-sm font-medium ${audioTab === 'upload' ? 'text-primary' : 'text-muted'}`}>Subir</Text>
                            </Pressable>
                            <Pressable
                                className={`flex-1 py-2 rounded-lg items-center ${audioTab === 'record' ? 'bg-surface shadow-sm' : ''}`}
                                onPress={() => setAudioTab('record')}
                            >
                                <Text className={`text-sm font-medium ${audioTab === 'record' ? 'text-primary' : 'text-muted'}`}>Grabar</Text>
                            </Pressable>
                            <Pressable
                                className={`flex-1 py-2 rounded-lg items-center ${audioTab === 'ai' ? 'bg-surface shadow-sm' : ''}`}
                                onPress={() => setAudioTab('ai')}
                            >
                                <Text className={`text-sm font-medium ${audioTab === 'ai' ? 'text-primary' : 'text-muted'}`}>IA (TTS)</Text>
                            </Pressable>
                        </View>

                        {audioTab === 'upload' && (
                            <Pressable
                                className="border-2 border-dashed border-border rounded-xl p-4 items-center justify-center bg-surfaceMuted/30 active:bg-surfaceMuted/50"
                                onPress={handlePickAudio}
                            >
                                {audioUrl && !audioUrl.startsWith('tts:') ? (
                                    <View className="items-center gap-2">
                                        <Feather name="check-circle" size={48} color={palette.primary} />
                                        <Text className="text-sm text-primary font-medium">Audio seleccionado</Text>
                                        <Text className="text-xs text-muted">{audioUrl.split("/").pop()}</Text>
                                        <Text className="text-sm text-primary font-medium mt-2">Cambiar audio</Text>
                                    </View>
                                ) : (
                                    <View className="items-center gap-2">
                                        <Feather name="music" size={48} color={palette.muted} />
                                        <Text className="text-sm text-muted">Seleccionar audio</Text>
                                    </View>
                                )}
                            </Pressable>
                        )}

                        {audioTab === 'record' && (
                            <View className="border-2 border-dashed border-border rounded-xl p-4 items-center justify-center bg-surfaceMuted/30">
                                {isRecording ? (
                                    <View className="items-center gap-4">
                                        <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center animate-pulse">
                                            <Feather name="mic" size={32} color={palette.error} />
                                        </View>
                                        <Text className="text-sm text-error font-medium">Grabando...</Text>
                                        <NunitoButton onPress={handleStopRecording} contentStyle={{ backgroundColor: palette.error }}>
                                            <Text className="text-white font-bold">Detener</Text>
                                        </NunitoButton>
                                    </View>
                                ) : (
                                    <View className="items-center gap-4">
                                        {recordedUri ? (
                                            <View className="items-center gap-2 mb-2">
                                                <Feather name="check-circle" size={32} color={palette.primary} />
                                                <Text className="text-sm text-primary font-medium">Audio grabado</Text>
                                                <View className="flex-row gap-2">
                                                    <Pressable onPress={handlePlayRecording} className="p-2 bg-primary/10 rounded-full">
                                                        <Feather name="play" size={20} color={palette.primary} />
                                                    </Pressable>
                                                    <Pressable onPress={() => setRecordedUri(null)} className="p-2 bg-error/10 rounded-full">
                                                        <Feather name="trash-2" size={20} color={palette.error} />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        ) : (
                                            <View className="items-center gap-2">
                                                <Feather name="mic" size={48} color={palette.muted} />
                                                <Text className="text-sm text-muted">Presiona para grabar</Text>
                                            </View>
                                        )}
                                        {!recordedUri && (
                                            <NunitoButton onPress={handleStartRecording}>
                                                <Text className="text-primaryOn font-bold">Iniciar Grabación</Text>
                                            </NunitoButton>
                                        )}
                                        {recordedUri && (
                                            <NunitoButton onPress={handleUploadRecording} disabled={uploading}>
                                                <Text className="text-primaryOn font-bold">
                                                    {uploading ? "Subiendo..." : "Usar Grabación"}
                                                </Text>
                                            </NunitoButton>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}

                        {audioTab === 'ai' && (
                            <View className="border-2 border-dashed border-border rounded-xl p-4 bg-surfaceMuted/30 gap-4">
                                <View className="gap-2">
                                    <Text className="text-sm font-medium text-text">Texto para leer (TTS)</Text>
                                    <TextInput
                                        className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                        value={ttsText}
                                        onChangeText={setTtsText}
                                        placeholder="Escribe el texto aquí..."
                                        placeholderTextColor={palette.muted}
                                    />
                                </View>
                                <View className="flex-row gap-2">
                                    <View className="flex-1">
                                        <NunitoButton onPress={handlePreviewTts} contentStyle={{ backgroundColor: palette.secondary }}>
                                            <Text className="text-white font-bold">Escuchar</Text>
                                        </NunitoButton>
                                    </View>
                                    <View className="flex-1">
                                        <NunitoButton onPress={handleUseTts}>
                                            <Text className="text-primaryOn font-bold">Usar este audio</Text>
                                        </NunitoButton>
                                    </View>
                                </View>
                                {audioUrl && audioUrl.startsWith('tts:') && (
                                    <View className="flex-row items-center gap-2 justify-center mt-2">
                                        <Feather name="check" size={16} color={palette.primary} />
                                        <Text className="text-sm text-primary">Audio configurado: {audioUrl.replace('tts:', '')}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                    {/* Alternatives */}
                    <View className="gap-2">
                        <Text className="text-sm font-semibold text-text">Alternativas Incorrectas</Text>
                        {alternatives.map((alt, index) => (
                            <TextInput
                                key={index}
                                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                value={alt}
                                onChangeText={(text) => {
                                    const newAlts = [...alternatives];
                                    newAlts[index] = text;
                                    setAlternatives(newAlts);
                                }}
                                placeholder={`Alternativa ${index + 1}`}
                                placeholderTextColor={palette.muted}
                            />
                        ))}
                        <Pressable
                            className="flex-row items-center gap-2 p-2 active:opacity-70"
                            onPress={() => setAlternatives([...alternatives, ""])}
                        >
                            <Feather name="plus-circle" size={20} color={palette.primary} />
                            <Text className="text-sm text-primary font-medium">Agregar alternativa</Text>
                        </Pressable>
                    </View>
                </>
            );
        }
        return null;
    };
    const getGameTitle = () => {
        switch (gameType) {
            case "image-word":
                return "Asociación Imagen-Palabra";
            case "syllable-count":
                return "Conteo de Sílabas";
            case "rhyme-identification":
                return "Identificación de Rimas";
            case "audio-recognition":
                return "Reconocimiento Auditivo";
        }
    };

    return (
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                <View className="bg-surface rounded-2xl p-6 w-full max-w-2xl border border-border max-h-[90%]">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-2xl font-bold text-text">
                                {question ? "Editar" : "Crear"} Pregunta
                            </Text>
                            <Text className="text-sm text-muted mt-1">{getGameTitle()}</Text>
                        </View>
                        <Pressable onPress={onClose} disabled={uploading}>
                            <Feather name="x" size={24} color={uploading ? palette.muted : palette.text} />
                        </Pressable>
                    </View>

                    {uploadError && (
                        <View className="bg-error/10 p-3 rounded-lg mb-4">
                            <Text className="text-error text-sm">{uploadError}</Text>
                        </View>
                    )}

                    <ScrollView className="gap-4" showsVerticalScrollIndicator={false}>
                        {/* Input para el texto de la pregunta */}
                        <View className="gap-2 mb-2">
                            <Text className="text-sm font-semibold text-text">Texto de la pregunta</Text>
                            <TextInput
                                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                value={questionText}
                                onChangeText={setQuestionText}
                                placeholder="Ej: ¿Cuál es el diagrama?"
                                placeholderTextColor={palette.muted}
                            />
                        </View>
                        {/* Difficulty */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">Dificultad</Text>
                            <View className="flex-row gap-2">
                                {(["easy", "medium", "hard"] as const).map((diff) => (
                                    <Pressable
                                        key={diff}
                                        className={`flex-1 p-3 rounded-xl border ${difficulty === diff
                                            ? "bg-primary/10 border-primary"
                                            : "border-border bg-surface"
                                            }`}
                                        onPress={() => setDifficulty(diff)}
                                    >
                                        <Text
                                            className={`text-sm font-medium text-center ${difficulty === diff ? "text-primary" : "text-text"
                                                }`}
                                        >
                                            {diff === "easy" ? "Fácil" : diff === "medium" ? "Medio" : "Difícil"}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Game-specific fields */}
                        {renderGameSpecificFields()}

                        {/* Hint */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">Pista (Opcional)</Text>
                            <TextInput
                                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                value={hint}
                                onChangeText={setHint}
                                placeholder="Ej: Piensa en un animal grande..."
                                placeholderTextColor={palette.muted}
                                multiline
                                numberOfLines={2}
                            />
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View className="flex-row gap-3 mt-4">
                        <View className="flex-1">
                            <NunitoButton onPress={handleSave} disabled={uploading}>
                                <Text className="text-base font-bold text-primaryOn">
                                    {uploading ? "Subiendo..." : "Guardar"}
                                </Text>
                            </NunitoButton>
                        </View>
                        <View className="flex-1">
                            <NunitoButton
                                onPress={onClose}
                                disabled={uploading}
                                contentStyle={{ backgroundColor: palette.surface }}
                            >
                                <Text className="text-base font-semibold text-text">Cancelar</Text>
                            </NunitoButton>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

