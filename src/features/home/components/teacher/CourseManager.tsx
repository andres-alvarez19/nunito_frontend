import { useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import NunitoButton from "@/features/home/components/NunitoButton";
import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";
import { palette } from "@/theme/colors";

export interface Course {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    testSuites: number;
}

interface CourseManagerProps {
    onSelectCourse?: (courseId: string | undefined) => void;
}

export default function CourseManager({ onSelectCourse }: CourseManagerProps) {
    const [courses, setCourses] = useState<Course[]>([
        {
            id: "1",
            name: "Español 3A",
            description: "Curso de lenguaje para 3er año básico",
            createdAt: "2024-01-15",
            testSuites: 3,
        },
        {
            id: "2",
            name: "Español 4B",
            description: "Curso de lenguaje para 4to año básico",
            createdAt: "2024-01-10",
            testSuites: 2,
        },
    ]);

    const [isCreating, setIsCreating] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [newCourseName, setNewCourseName] = useState("");
    const [newCourseDesc, setNewCourseDesc] = useState("");

    const handleCreateCourse = () => {
        if (newCourseName.trim()) {
            const newCourse: Course = {
                id: Date.now().toString(),
                name: newCourseName,
                description: newCourseDesc,
                createdAt: new Date().toISOString().split("T")[0],
                testSuites: 0,
            };
            setCourses([...courses, newCourse]);
            setNewCourseName("");
            setNewCourseDesc("");
            setIsCreating(false);
        }
    };

    const handleDeleteCourse = (id: string) => {
        setCourses(courses.filter((c) => c.id !== id));
        if (selectedCourse === id) {
            setSelectedCourse(null);
            onSelectCourse?.(undefined);
        }
    };

    const handleSelectCourse = (id: string) => {
        setSelectedCourse(id);
        onSelectCourse?.(id);
    };

    return (
        <TeacherSectionCard
            title="Gestionar Preguntas"
            subtitle="Editar preguntas de juegos"
        >
            <View className="gap-4">
                {/* Header */}
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-xl font-bold text-text">Mis Cursos</Text>
                        <Text className="text-sm text-muted">
                            {courses.length} curso{courses.length !== 1 ? "s" : ""} disponible
                            {courses.length !== 1 ? "s" : ""}
                        </Text>
                    </View>
                    <Pressable
                        className="flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-xl active:scale-95"
                        onPress={() => setIsCreating(true)}
                    >
                        <Feather name="plus" size={18} color={palette.primaryOn} />
                        <Text className="text-sm font-semibold text-primaryOn">
                            Nuevo Curso
                        </Text>
                    </Pressable>
                </View>

                {/* Create Course Form */}
                {isCreating && (
                    <View className="bg-surfaceMuted/50 rounded-2xl p-4 gap-4 border-2 border-primary/20">
                        <Text className="text-lg font-bold text-text">
                            Crear Nuevo Curso
                        </Text>
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">
                                Nombre del Curso
                            </Text>
                            <TextInput
                                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                value={newCourseName}
                                onChangeText={setNewCourseName}
                                placeholder="Ej: Español 3A"
                                placeholderTextColor={palette.muted}
                            />
                        </View>
                        <View className="gap-2">
                            <Text className="text-sm font-semibold text-text">
                                Descripción
                            </Text>
                            <TextInput
                                className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                value={newCourseDesc}
                                onChangeText={setNewCourseDesc}
                                placeholder="Describe el curso"
                                placeholderTextColor={palette.muted}
                                multiline
                                numberOfLines={2}
                            />
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <NunitoButton onPress={handleCreateCourse}>
                                    <Text className="text-base font-bold text-primaryOn">
                                        Crear Curso
                                    </Text>
                                </NunitoButton>
                            </View>
                            <View className="flex-1">
                                <NunitoButton
                                    onPress={() => setIsCreating(false)}
                                    contentStyle={{ backgroundColor: palette.surface }}
                                >
                                    <Text className="text-base font-semibold text-text">
                                        Cancelar
                                    </Text>
                                </NunitoButton>
                            </View>
                        </View>
                    </View>
                )}

                {/* Courses List */}
                <View className="gap-3">
                    {courses.length === 0 ? (
                        <View className="items-center py-12 gap-4">
                            <Feather name="book-open" size={64} color={palette.muted} />
                            <Text className="text-muted text-center">
                                No hay cursos. Crea uno nuevo para comenzar.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView className="gap-3" showsVerticalScrollIndicator={false}>
                            {courses.map((course) => (
                                <View
                                    key={course.id}
                                    className={`p-4 border rounded-xl ${selectedCourse === course.id
                                            ? "bg-primary/10 border-primary"
                                            : "border-border bg-surface"
                                        }`}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1 gap-1">
                                            <Text className="text-base font-semibold text-text">
                                                {course.name}
                                            </Text>
                                            <Text className="text-sm text-muted">
                                                {course.description}
                                            </Text>
                                            <Text className="text-xs text-primary mt-2">
                                                {course.testSuites} conjunto
                                                {course.testSuites !== 1 ? "s" : ""} de preguntas
                                            </Text>
                                        </View>
                                        <View className="flex-row gap-2">
                                            <Pressable
                                                className="p-2 rounded-lg border border-primary bg-primary/10 active:bg-primary/20"
                                                onPress={() => handleSelectCourse(course.id)}
                                            >
                                                <Feather name="edit-2" size={16} color={palette.primary} />
                                            </Pressable>
                                            <Pressable
                                                className="p-2 rounded-lg bg-error/10 border border-error/30 active:bg-error/20"
                                                onPress={() => handleDeleteCourse(course.id)}
                                            >
                                                <Feather name="trash-2" size={16} color={palette.error} />
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>
        </TeacherSectionCard>
    );
}
