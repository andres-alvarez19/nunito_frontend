import { useState, useCallback } from "react";
import { coursesController } from "@/controllers/courses";
import { Course, CreateCourseRequest, UpdateCourseRequest } from "@/models/courses";

export const useCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCourses = useCallback(async (teacherId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await coursesController.getAll(teacherId);
            setCourses(data);
        } catch (err) {
            setError("Error al cargar los cursos");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCourse = async (data: CreateCourseRequest) => {
        setLoading(true);
        try {
            const newCourse = await coursesController.create(data);
            setCourses((prev) => [...prev, newCourse]);
            return newCourse;
        } catch (err) {
            setError("Error al crear el curso");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateCourse = async (id: string, data: UpdateCourseRequest) => {
        setLoading(true);
        try {
            const updatedCourse = await coursesController.update(id, data);
            setCourses((prev) =>
                prev.map((course) => (course.id === id ? updatedCourse : course))
            );
            return updatedCourse;
        } catch (err) {
            setError("Error al actualizar el curso");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteCourse = async (id: string) => {
        setLoading(true);
        try {
            await coursesController.delete(id);
            setCourses((prev) => prev.filter((course) => course.id !== id));
        } catch (err) {
            setError("Error al eliminar el curso");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        courses,
        loading,
        error,
        fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse,
    };
};
