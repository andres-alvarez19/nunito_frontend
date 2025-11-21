export interface Course {
    id: string;
    name: string;
    description?: string;
    teacherId: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateCourseRequest {
    name: string;
    description?: string;
    teacherId: string;
}

export interface UpdateCourseRequest {
    name?: string;
    description?: string;
}
