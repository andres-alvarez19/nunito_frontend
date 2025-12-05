import { useState, useEffect } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    ActivityIndicator,
    Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import NunitoButton from "@/features/home/components/NunitoButton";
import TeacherSectionCard from "@/features/home/components/teacher/TeacherSectionCard";
import { palette } from "@/theme/colors";
import { useCourses } from "@/services/useCourses";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";

interface CourseManagerProps {
    onSelectCourse?: (courseId: string | undefined) => void;
}



export default function CourseManager({ onSelectCourse }: CourseManagerProps) {
    const {
        courses,
        loading,
        error,
        fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse
    } = useCourses();
    const { error: showError, success: showSuccess } = useNotification();

    const [isCreating, setIsCreating] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [newCourseName, setNewCourseName] = useState("");
    const [newCourseDesc, setNewCourseDesc] = useState("");
    const [editCourseName, setEditCourseName] = useState("");
    const [editCourseDesc, setEditCourseDesc] = useState("");

    const { user } = useAuth();
    useEffect(() => {
        if (user && user.id) {
            console.log('Fetching courses for teacher ID:', user.id);
            fetchCourses(user.id);
        }
    }, [fetchCourses, user]);

    const handleCreateCourse = async () => {
        if (newCourseName.trim() && user?.id) {
            try {
                await createCourse({
                    name: newCourseName,
                    description: newCourseDesc,
                    teacherId: user.id,
                });
                setNewCourseName("");
                setNewCourseDesc("");
                setIsCreating(false);
                showSuccess("Curso creado exitosamente");
            } catch (e) {
                showError("No se pudo crear el curso");
            }
        }
    };

    const handleDeleteCourse = async (id: string) => {
        try {
            await deleteCourse(id);
            if (selectedCourse === id) {
                setSelectedCourse(null);
                onSelectCourse?.(undefined);
            }
            showSuccess("Curso eliminado exitosamente");
        } catch (e) {
            showError("No se pudo eliminar el curso");
        }
    };

    const openEditModal = (courseId: string) => {
        const course = courses.find((c) => c.id === courseId);
        if (!course) return;
        setSelectedCourse(course.id);
        setEditCourseName(course.name);
        setEditCourseDesc(course.description || "");
        setIsEditModalVisible(true);
    };

    const closeEditModal = () => {
        setIsEditModalVisible(false);
        setSelectedCourse(null);
        setEditCourseName("");
        setEditCourseDesc("");
    };

    const handleUpdateCourse = async () => {
        if (!selectedCourse || !editCourseName.trim()) return;
        try {
            await updateCourse(selectedCourse, {
                name: editCourseName,
                description: editCourseDesc,
            });
            showSuccess("Curso actualizado exitosamente");
            setIsEditModalVisible(false);
        } catch (e) {
            showError("No se pudo actualizar el curso");
        }
    };

    const renderCoursesContent = () => {
        if (loading && !isCreating) {
            return <ActivityIndicator size="large" color={palette.primary} />;
        }

        if (courses.length === 0) {
            return (
                <View className="items-center py-12 gap-4">
                    <Feather name="book-open" size={64} color={palette.muted} />
                    <Text className="text-muted text-center">
                        No hay cursos. Crea uno nuevo para comenzar.
                    </Text>
                </View>
            );
        }

        return (
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
                                    {course.description || "Sin descripción"}
                                </Text>
                                <View className="flex-row gap-4 mt-2">
                                    <Pressable onPress={() => openEditModal(course.id)}>
                                        <Text className="text-xs text-primary">
                                            Ver detalles
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                            <View className="flex-row gap-2">
                                <Pressable
                                    className="p-2 rounded-lg border border-primary bg-primary/10 active:bg-primary/20"
                                    onPress={() => onSelectCourse?.(course.id)}
                                    disabled={loading}
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
        );
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
                        disabled={loading}
                    >
                        <Feather name="plus" size={18} color={palette.primaryOn} />
                        <Text className="text-sm font-semibold text-primaryOn">
                            Nuevo Curso
                        </Text>
                    </Pressable>
                </View>

                {/* Error Message */}
                {error && (
                    <View className="bg-error/10 p-3 rounded-lg">
                        <Text className="text-error text-sm">{error}</Text>
                    </View>
                )}

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
                                editable={!loading}
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
                                editable={!loading}
                            />
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <NunitoButton onPress={handleCreateCourse} disabled={loading}>
                                    {loading ? (
                                        <ActivityIndicator color={palette.primaryOn} />
                                    ) : (
                                        <Text className="text-base font-bold text-primaryOn">
                                            Crear Curso
                                        </Text>
                                    )}
                                </NunitoButton>
                            </View>
                            <View className="flex-1">
                                <NunitoButton
                                    onPress={() => setIsCreating(false)}
                                    contentStyle={{ backgroundColor: palette.surface }}
                                    disabled={loading}
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
                    {renderCoursesContent()}
                </View>

                <Modal
                    visible={isEditModalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={closeEditModal}
                >
                    <View className="flex-1 bg-black/50 justify-center px-4">
                        <View
                            className="bg-surface p-4 rounded-2xl gap-4 border border-border w-full"
                            style={{ maxWidth: 640, alignSelf: "center" }}
                        >
                            <View className="flex-row items-center justify-between">
                                <Text className="text-lg font-bold text-text">
                                    Editar Curso
                                </Text>
                            </View>
                            <View className="gap-2">
                                <Text className="text-sm font-semibold text-text">
                                    Nombre del Curso
                                </Text>
                                <TextInput
                                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                    value={editCourseName}
                                    onChangeText={setEditCourseName}
                                    placeholder="Ej: Español 3A"
                                    placeholderTextColor={palette.muted}
                                    editable={!loading}
                                />
                            </View>
                            <View className="gap-2">
                                <Text className="text-sm font-semibold text-text">
                                    Descripción
                                </Text>
                                <TextInput
                                    className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-text"
                                    value={editCourseDesc}
                                    onChangeText={setEditCourseDesc}
                                    placeholder="Describe el curso"
                                    placeholderTextColor={palette.muted}
                                    multiline
                                    numberOfLines={2}
                                    editable={!loading}
                                />
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <NunitoButton onPress={handleUpdateCourse} disabled={loading}>
                                        {loading ? (
                                            <ActivityIndicator color={palette.primaryOn} />
                                        ) : (
                                            <Text className="text-base font-bold text-primaryOn">
                                                Guardar cambios
                                            </Text>
                                        )}
                                    </NunitoButton>
                                </View>
                                <View className="flex-1">
                                    <NunitoButton
                                        onPress={closeEditModal}
                                        contentStyle={{ backgroundColor: palette.surface }}
                                        disabled={loading}
                                    >
                                        <Text className="text-base font-semibold text-text">
                                            Cancelar
                                        </Text>
                                    </NunitoButton>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </TeacherSectionCard>
    );
}
