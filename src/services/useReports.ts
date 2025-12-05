import { apiClient } from "@/controllers";
import { StudentAnswer, StudentResult } from "@/features/home/types";

export interface RoomReport {
    roomId: string;
    roomName: string;
    gameId: string;
    difficulty: string;
    studentsCount: number;
    averageScore: number;
    completionRate: number;
    createdAt: string;
    students: StudentResult[];
}

const mapStudentResult = (student: any): StudentResult => {
    const correctAnswers = student?.correctAnswers ?? student?.correct ?? 0;
    const incorrectAnswers = student?.incorrectAnswers ?? student?.incorrect ?? 0;
    const totalQuestions = student?.totalQuestions ?? student?.total ?? correctAnswers + incorrectAnswers;
    const answers: StudentAnswer[] = Array.isArray(student?.answers)
        ? student.answers.map((ans: any) => ({
            id: ans?.id,
            roomId: ans?.roomId,
            studentId: ans?.studentId,
            gameId: ans?.gameId,
            questionId: ans?.questionId?.toString?.() ?? "",
            questionText: ans?.questionText ?? null,
            answer: ans?.answer ?? "",
            isCorrect: ans?.isCorrect,
            elapsedMs: ans?.elapsedMs,
            attempt: ans?.attempt,
            createdAt: ans?.createdAt,
            sentAt: ans?.sentAt,
        }))
        : [];

    return {
        name: student?.name ?? student?.studentName ?? "Estudiante",
        score: Math.round(student?.score ?? 0),
        correctAnswers,
        totalQuestions,
        averageTime: Math.round(student?.averageTime ?? student?.averageTimeSeconds ?? 0),
        completedAt: student?.completedAt ?? student?.finishedAt ?? student?.completed_at ?? new Date().toISOString(),
        answers,
    };
};

const mapRoomReport = (room: any): RoomReport => {
    const studentsVal = room?.students;
    const studentsCount = Array.isArray(studentsVal)
        ? studentsVal.length
        : typeof studentsVal === "number"
            ? studentsVal
            : room?.studentsCount ?? 0;

    const studentList = Array.isArray(studentsVal)
        ? studentsVal
        : Array.isArray(room?.studentsResults)
            ? room.studentsResults
            : [];

    return {
        roomId: room?.roomId ?? room?.id,
        roomName: room?.roomName ?? room?.title ?? room?.name ?? "Sala sin nombre",
        gameId: room?.gameId,
        difficulty: room?.difficulty,
        studentsCount,
        averageScore: Math.round(room?.averageScore ?? room?.average ?? 0),
        completionRate: Math.round(room?.completionRate ?? room?.completion ?? 0),
        createdAt: room?.createdAt,
        students: studentList.map(mapStudentResult),
    };
};

export const useReports = () => {
    const getTeacherReports = async (teacherId: string): Promise<RoomReport[]> => {
        try {
            const response = await apiClient.get(`/teachers/${teacherId}/reports`);
            const reports = Array.isArray(response.data) ? response.data : [];

            return reports.map(mapRoomReport);
        } catch (error) {
            console.error("Error fetching reports:", error);
            return [];
        }
    };

    const getRoomReportDetails = async (roomId: string): Promise<RoomReport | null> => {
        try {
            const response = await apiClient.get(`/rooms/${roomId}/report`);
            const room = response.data;

            return mapRoomReport(room);
        } catch (error) {
            console.error(`Error fetching report for room ${roomId}:`, error);
            return null;
        }
    };

    const getRoomFullResults = async (roomId: string): Promise<StudentResult[]> => {
        try {
            const response = await apiClient.get(`/rooms/${roomId}/results/full`);
            const students = Array.isArray(response.data?.students) ? response.data.students : [];
            return students.map(mapStudentResult);
        } catch (error) {
            console.error(`Error fetching full results for room ${roomId}:`, error);
            return [];
        }
    };

    return {
        getTeacherReports,
        getRoomReportDetails,
        getRoomFullResults
    };
};
