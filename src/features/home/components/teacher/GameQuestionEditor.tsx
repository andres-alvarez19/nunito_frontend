import { useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import QuestionFormModal from "@/features/home/components/teacher/QuestionFormModal";
import { palette } from "@/theme/colors";
import type { Question } from "@/features/home/types/questions";

interface GameQuestionEditorProps {
    gameType: "image-word" | "syllable-count" | "rhyme-identification" | "audio-recognition";
    gameTitle: string;
}

export default function GameQuestionEditor({
    gameType,
    gameTitle,
}: GameQuestionEditorProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);

    const handleAddQuestion = (formData: Partial<Question>) => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            difficulty: "easy",
            ...formData,
        } as Question;
        setQuestions([...questions, newQuestion]);
        setIsModalOpen(false);
        setEditingQuestion(undefined);
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleSaveEdit = (formData: Partial<Question>) => {
        if (editingQuestion) {
            setQuestions(
                questions.map((q) =>
                    q.id === editingQuestion.id ? { ...q, ...formData } : q
                )
            );
            setIsModalOpen(false);
            setEditingQuestion(undefined);
        }
    };

    const handleDeleteQuestion = (id: string) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(undefined);
    };

    const getDifficultyColor = (difficulty: string) => {
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

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case "easy":
                return "Fácil";
            case "medium":
                return "Medio";
            case "hard":
                return "Difícil";
            default:
                return difficulty;
        }
    };

    const getQuestionText = (question: Question) => {
        switch (question.type) {
            case "image-word":
                return question.word;
            case "syllable-count":
                return question.word;
            case "rhyme-identification":
                return question.mainWord;
            case "audio-recognition":
                return question.text;
            default:
                return "Sin texto";
        }
    };

    const getCorrectAnswer = (question: Question) => {
        switch (question.type) {
            case "image-word":
                return question.word;
            case "syllable-count":
                return `${question.syllableCount} sílabas`;
            case "rhyme-identification":
                return question.rhymingWords.join(", ");
            case "audio-recognition":
                return question.text;
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
                >
                    <Feather name="plus" size={18} color={palette.primaryOn} />
                    <Text className="text-sm font-semibold text-primaryOn">
                        Nueva Pregunta
                    </Text>
                </Pressable>
            </View>

            {/* Questions List */}
            <View className="gap-3">
                {questions.length === 0 ? (
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
                                            style={{ color: getDifficultyColor(question.difficulty) }}
                                        >
                                            {getDifficultyLabel(question.difficulty)}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row gap-2">
                                    <Pressable
                                        className="p-2 rounded-lg border border-primary bg-primary/10 active:bg-primary/20"
                                        onPress={() => handleEditQuestion(question)}
                                    >
                                        <Feather name="edit-2" size={16} color={palette.primary} />
                                    </Pressable>
                                    <Pressable
                                        className="p-2 rounded-lg bg-error/10 border border-error/30 active:bg-error/20"
                                        onPress={() => handleDeleteQuestion(question.id)}
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
                onSave={editingQuestion ? handleSaveEdit : handleAddQuestion}
                onClose={handleCloseModal}
            />
        </View>
    );
}
