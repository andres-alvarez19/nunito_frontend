import { useState, useCallback } from "react";
import { testSuitesController } from "@/controllers/testSuites";
import { TestSuite, CreateTestSuiteRequest, UpdateTestSuiteRequest } from "@/models/testSuites";
import { coursesController } from "@/controllers/courses";

export const useTestSuites = () => {
    const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTestSuites = useCallback(async (courseId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await coursesController.getTestSuites(courseId);
            setTestSuites(data);
        } catch (err) {
            setError("Error al cargar los conjuntos de pruebas");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTestSuite = async (data: CreateTestSuiteRequest) => {
        setLoading(true);
        try {
            const newTestSuite = await testSuitesController.create(data);
            setTestSuites((prev) => [...prev, newTestSuite]);
            return newTestSuite;
        } catch (err) {
            setError("Error al crear el conjunto de pruebas");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateTestSuite = async (id: string, data: UpdateTestSuiteRequest) => {
        setLoading(true);
        try {
            const updatedTestSuite = await testSuitesController.update(id, data);
            setTestSuites((prev) =>
                prev.map((ts) => (ts.id === id ? updatedTestSuite : ts))
            );
            return updatedTestSuite;
        } catch (err) {
            setError("Error al actualizar el conjunto de pruebas");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteTestSuite = async (id: string) => {
        setLoading(true);
        try {
            await testSuitesController.delete(id);
            setTestSuites((prev) => prev.filter((ts) => ts.id !== id));
        } catch (err) {
            setError("Error al eliminar el conjunto de pruebas");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        testSuites,
        loading,
        error,
        fetchTestSuites,
        createTestSuite,
        updateTestSuite,
        deleteTestSuite,
    };
};
