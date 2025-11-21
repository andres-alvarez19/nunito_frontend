import { useState, useCallback } from "react";
import { testSuitesController } from "@/controllers/testSuites";
import { questionsController } from "@/controllers/questions";
import { Question, CreateQuestionRequest, GameId } from "@/models/questions";

export const useQuestions = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQuestions = useCallback(async (testSuiteId: string, gameType?: GameId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await testSuitesController.getQuestions(testSuiteId, gameType);
            setQuestions(data);
        } catch (err) {
            setError("Error al cargar las preguntas");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createQuestion = async (testSuiteId: string, data: CreateQuestionRequest) => {
        setLoading(true);
        try {
            const newQuestion = await testSuitesController.createQuestion(testSuiteId, data);
            setQuestions((prev) => [...prev, newQuestion]);
            return newQuestion;
        } catch (err) {
            setError("Error al crear la pregunta");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateQuestion = async (id: string, data: CreateQuestionRequest) => {
        setLoading(true);
        try {
            const updatedQuestion = await questionsController.update(id, data);
            setQuestions((prev) =>
                prev.map((q) => (q.id === id ? updatedQuestion : q))
            );
            return updatedQuestion;
        } catch (err) {
            setError("Error al actualizar la pregunta");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteQuestion = async (id: string) => {
        setLoading(true);
        try {
            await questionsController.delete(id);
            setQuestions((prev) => prev.filter((q) => q.id !== id));
        } catch (err) {
            setError("Error al eliminar la pregunta");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        questions,
        loading,
        error,
        fetchQuestions,
        createQuestion,
        updateQuestion,
        deleteQuestion,
    };
};
