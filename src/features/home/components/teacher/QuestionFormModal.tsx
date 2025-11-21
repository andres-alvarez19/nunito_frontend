import { useState, useEffect } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    Image,
    Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import NunitoButton from "@/features/home/components/NunitoButton";
import { palette } from "@/theme/colors";
import type { Question } from "@/features/home/types/questions";

interface QuestionFormModalProps {
    isOpen: boolean;
    gameType: "image-word" | "syllable-count" | "rhyme-identification" | "audio-recognition";
    question?: Question;
    onSave: (question: Partial<Question>) => void;
    onClose: () => void;
}

export default function QuestionFormModal({
    isOpen,
    gameType,
    question,
    onSave,
    onClose,
}: QuestionFormModalProps) {
    // Common fields
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
    const [hint, setHint] = useState("");

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

    // Update form when question changes (for editing)
    useEffect(() => {
        if (question) {
            setDifficulty(question.difficulty || "easy");
            setHint(question.hint || "");

            switch (question.type) {
                case "image-word":
                    setWord(question.word);
                    setImageUrl(question.imageUrl);
                    setAlternatives(question.alternatives.length > 0 ? question.alternatives : ["", "", ""]);
                    break;

                case "syllable-count":
                    setWord(question.word);
                    setSyllableCount(question.syllableCount);
                    setSyllableSeparation(question.syllableSeparation);
                    setSyllableAlternatives(question.alternatives);
                    break;

                case "rhyme-identification":
                    setMainWord(question.mainWord);
                    setRhymingWords(question.rhymingWords.length > 0 ? question.rhymingWords : ["", ""]);
                    setNonRhymingWords(question.nonRhymingWords.length > 0 ? question.nonRhymingWords : ["", ""]);
                    break;

                case "audio-recognition":
                    setWord(question.text);
                    setAudioUrl(question.audioUrl);
                    setAlternatives(question.alternatives.length > 0 ? question.alternatives : ["", "", ""]);
                    break;
            }
        } else {
            // Reset form for new question
            setDifficulty("easy");
            setHint("");
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
        }
    }, [question, isOpen]);

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permiso requerido", "Se necesita permiso para acceder a las imágenes");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUrl(result.assets[0].uri);
        }
    };

    const handlePickAudio = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "audio/*",
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                setAudioUrl(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo seleccionar el archivo de audio");
        }
    };

    const handleSave = () => {
        let questionData: Partial<Question>;

        switch (gameType) {
            case "image-word":
                questionData = {
                    type: "image-word",
                    word,
                    imageUrl,
                    alternatives: alternatives.filter((a) => a.trim()),
                    hint: hint || undefined,
                    difficulty,
                };
                break;

            case "syllable-count":
                questionData = {
                    type: "syllable-count",
                    word,
                    syllableCount,
                    syllableSeparation,
                    alternatives: syllableAlternatives,
                    hint: hint || undefined,
                    difficulty,
                };
                break;

            case "rhyme-identification":
                questionData = {
                    type: "rhyme-identification",
                    mainWord,
                    rhymingWords: rhymingWords.filter((w) => w.trim()),
                    nonRhymingWords: nonRhymingWords.filter((w) => w.trim()),
                    hint: hint || undefined,
                    difficulty,
                };
                break;

            case "audio-recognition":
                questionData = {
                    type: "audio-recognition",
                    text: word,
                    audioUrl,
                    alternatives: alternatives.filter((a) => a.trim()),
                    hint: hint || undefined,
                    difficulty,
                };
                break;
        }

        onSave(questionData);
    };

    const renderGameSpecificFields = () => {
        switch (gameType) {
            case "image-word":
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
                                        <Text className="text-sm text-primary font-medium">
                                            Cambiar imagen
                                        </Text>
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
                            <Text className="text-sm font-semibold text-text">
                                Alternativas Incorrectas
                            </Text>
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
                                <Text className="text-sm text-primary font-medium">
                                    Agregar alternativa
                                </Text>
                            </Pressable>
                        </View>
                    </>
                );

            case "syllable-count":
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
                            <Text className="text-sm font-semibold text-text">
                                Número de Sílabas (Correcto)
                            </Text>
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
                            <Text className="text-sm font-semibold text-text">
                                Separación de Sílabas
                            </Text>
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
                            <Text className="text-sm font-semibold text-text">
                                Números Incorrectos
                            </Text>
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

            case "rhyme-identification":
                return (
                    <>
                        {/* Main Word */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">
                                Palabra Principal
                            </Text>
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
                            <Text className="text-sm font-semibold text-text">
                                Palabras que Riman
                            </Text>
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
                                <Text className="text-sm text-primary font-medium">
                                    Agregar palabra
                                </Text>
                            </Pressable>
                        </View>

                        {/* Non-Rhyming Words */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">
                                Palabras que NO Riman
                            </Text>
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
                                <Text className="text-sm text-primary font-medium">
                                    Agregar palabra
                                </Text>
                            </Pressable>
                        </View>
                    </>
                );

            case "audio-recognition":
                return (
                    <>
                        {/* Text */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">
                                Palabra/Frase que se Oirá
                            </Text>
                            <TextInput
                                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                value={word}
                                onChangeText={setWord}
                                placeholder="Ej: elefante"
                                placeholderTextColor={palette.muted}
                            />
                        </View>

                        {/* Audio */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">Audio</Text>
                            <Pressable
                                className="border-2 border-dashed border-border rounded-xl p-4 items-center justify-center bg-surfaceMuted/30 active:bg-surfaceMuted/50"
                                onPress={handlePickAudio}
                            >
                                {audioUrl ? (
                                    <View className="items-center gap-2">
                                        <Feather name="check-circle" size={48} color={palette.primary} />
                                        <Text className="text-sm text-primary font-medium">
                                            Audio seleccionado
                                        </Text>
                                        <Text className="text-xs text-muted">
                                            {audioUrl.split("/").pop()}
                                        </Text>
                                        <Text className="text-sm text-primary font-medium mt-2">
                                            Cambiar audio
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="items-center gap-2">
                                        <Feather name="music" size={48} color={palette.muted} />
                                        <Text className="text-sm text-muted">Seleccionar audio</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>

                        {/* Alternatives */}
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">
                                Alternativas Incorrectas
                            </Text>
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
                                <Text className="text-sm text-primary font-medium">
                                    Agregar alternativa
                                </Text>
                            </Pressable>
                        </View>
                    </>
                );
        }
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
                        <Pressable onPress={onClose}>
                            <Feather name="x" size={24} color={palette.text} />
                        </Pressable>
                    </View>

                    <ScrollView className="gap-4" showsVerticalScrollIndicator={false}>
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
                            <NunitoButton onPress={handleSave}>
                                <Text className="text-base font-bold text-primaryOn">Guardar</Text>
                            </NunitoButton>
                        </View>
                        <View className="flex-1">
                            <NunitoButton
                                onPress={onClose}
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
