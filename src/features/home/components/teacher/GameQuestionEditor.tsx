import { useState, useEffect } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View,
    ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import QuestionFormModal from "@/features/home/components/teacher/QuestionFormModal";
import { palette } from "@/theme/colors";
import { Question, CreateQuestionRequest, GameId } from "@/models/questions";
import { useQuestions } from "@/services/useQuestions";
import { useNotification } from "@/contexts/NotificationContext";

interface GameQuestionEditorProps {
    testSuiteId: string;
    gameType: GameId;
    gameTitle: string;
}

export default function GameQuestionEditor({
    testSuiteId,
    gameType,
    gameTitle,
}: GameQuestionEditorProps) {
    const {
        questions,
        loading,
        error,
        fetchQuestions,
        createQuestion,
        updateQuestion,
        deleteQuestion,
    } = useQuestions();
    const { error: showError, success: showSuccess } = useNotification();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);

    useEffect(() => {
        if (testSuiteId && gameType) {
            fetchQuestions(testSuiteId, gameType);
        }
    }, [testSuiteId, gameType, fetchQuestions]);

    const handleAddQuestion = async (formData: any) => {
        try {
            // Construir el payload para que difficulty solo esté dentro de options
            const { difficulty, ...rest } = formData;
            const requestData = {
                ...rest,
                type: gameType,
                testSuiteId,
                options: {
                    ...formData.options,
                    difficulty: difficulty || "easy",
                },
            } as CreateQuestionRequest;

            await createQuestion(testSuiteId, requestData);
            setIsModalOpen(false);
            setEditingQuestion(undefined);
            showSuccess("Pregunta creada exitosamente");
        } catch (e) {
            showError("No se pudo crear la pregunta");
        }
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleSaveEdit = async (formData: Partial<Question>) => {
        if (editingQuestion) {
            try {
                const requestData = {
                    ...formData,
                    type: gameType,
                    testSuiteId,
                } as CreateQuestionRequest;

                await updateQuestion(editingQuestion.id, requestData);
                setIsModalOpen(false);
                setEditingQuestion(undefined);
                showSuccess("Pregunta actualizada exitosamente");
            } catch (e) {
                showError("No se pudo actualizar la pregunta");
            }
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        // For now, we'll delete directly. In the future, we could add a confirmation modal
        try {
            await deleteQuestion(id);
            showSuccess("Pregunta eliminada exitosamente");
        } catch (e) {
            showError("No se pudo eliminar la pregunta");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(undefined);
    };

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case "easy":
                return palette.mint;
            case "medium":
                return palette.blue;
            case "hard":
                return palette.error;
            default:
                return palette.text;
        }
    };

    const getDifficultyLabel = (difficulty?: string) => {
        switch (difficulty) {
            case "easy":
                return "Fácil";
            case "medium":
                return "Medio";
            case "hard":
                return "Difícil";
            default:
                return difficulty || "-";
        }
    };

    const getQuestionText = (question: Question) => {
        switch (question.type) {
            case "image-word":
                return "¿A qué corresponde la imagen?";
            case "syllable-count":
                return `¿Cuántas sílabas tiene "${question.options.word}"?`;
            case "rhyme-identification":
                return `¿Qué palabras riman con "${question.options.mainWord}"?`;
            case "audio-recognition":
                return `Escucha y selecciona: "${question.options.word || question.text || '...'}"`;
            default:
                return "Pregunta sin título";
        }
    };

    const getCorrectAnswer = (question: Question) => {
        switch (question.type) {
            case "image-word":
                return question.options.word;
            case "syllable-count":
                return `${question.options.syllableCount} sílabas`;
            case "rhyme-identification":
                return question.options.rhymingWords?.join(", ") ?? "";
            case "audio-recognition":
                return question.options.word || question.text || "-";
            default:
                return "-";
        }
    };

    return (
        <View className="gap-4">
            {/* Header */}
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-xl font-bold text-text">{gameTitle}</Text>
                    <Text className="text-sm text-muted">
                        {questions.length} pregunta{questions.length !== 1 ? "s" : ""}{" "}
                        disponible{questions.length !== 1 ? "s" : ""}
                    </Text>
                </View>
                <Pressable
                    className="flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-xl active:scale-95"
                    onPress={() => setIsModalOpen(true)}
                    disabled={loading}
                >
                    <Feather name="plus" size={18} color={palette.primaryOn} />
                    <Text className="text-sm font-semibold text-primaryOn">
                        Nueva Pregunta
                    </Text>
                </Pressable>
            </View>

            {/* Error Message */}
            {error && (
                <View className="bg-error/10 p-3 rounded-lg">
                    <Text className="text-error text-sm">{error}</Text>
                </View>
            )}

            {/* Questions List */}
            <View className="gap-3">
                {loading ? (
                    <ActivityIndicator size="large" color={palette.primary} />
                ) : questions.length === 0 ? (
                    <View className="items-center py-12 gap-4">
                        <Feather name="help-circle" size={64} color={palette.muted} />
                        <Text className="text-center text-muted">
                            No hay preguntas disponibles. Crea una nueva.
                        </Text>
                    </View>
                ) : (
                    <ScrollView className="gap-2" showsVerticalScrollIndicator={false}>
                        {questions.map((question, index) => (
                            <View
                                key={question.id}
                                className="flex-row items-center justify-between p-4 border border-border rounded-xl bg-surface"
                            >
                                <View className="flex-1 gap-1">
                                    <Text className="text-base font-semibold text-text">
                                        {index + 1}. {getQuestionText(question)}
                                    </Text>
                                    <View className="flex-row items-center gap-2 flex-wrap">
                                        <Text className="text-sm text-muted">Respuesta:</Text>
                                        <Text className="text-sm font-semibold text-mint">
                                            {getCorrectAnswer(question)}
                                        </Text>
                                        <Text className="text-sm text-muted">•</Text>
                                        <Text className="text-sm text-muted">Dificultad:</Text>
                                        <Text
                                            className="text-sm font-semibold"
                                            style={{ color: getDifficultyColor(question.options.difficulty) }}
                                        >
                                            {getDifficultyLabel(question.options.difficulty)}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row gap-2">
                                    <Pressable
                                        className="p-2 rounded-lg border border-primary bg-primary/10 active:bg-primary/20"
                                        onPress={() => handleEditQuestion(question)}
                                        disabled={loading}
                                    >
                                        <Feather name="edit-2" size={16} color={palette.primary} />
                                    </Pressable>
                                    <Pressable
                                        className="p-2 rounded-lg bg-error/10 border border-error/30 active:bg-error/20"
                                        onPress={() => handleDeleteQuestion(question.id)}
                                        disabled={loading}
                                    >
                                        <Feather name="trash-2" size={16} color={palette.error} />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Question Form Modal */}
            <QuestionFormModal
                isOpen={isModalOpen}
                gameType={gameType}
                question={editingQuestion}
                testSuiteId={testSuiteId}
                onSave={editingQuestion ? handleSaveEdit : handleAddQuestion}
                onClose={handleCloseModal}
            />
        </View>
    );
}
