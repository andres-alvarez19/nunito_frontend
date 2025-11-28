export interface AnswerEventDto {
    roomId: string;
    studentId: string;
    studentName: string;
    gameId: string;
    questionId: string;
    questionText: string;
    selectedOption: string;
    isCorrect: boolean;
    elapsedMillis: number;
    answeredAt: string; // ISO 8601
}

export interface StudentMonitoringStateDto {
    studentId: string;
    studentName: string;
    status: 'online' | 'offline';
    currentGameId?: string;
    currentQuestionText?: string;
    lastSelectedOptionText?: string;
    lastIsCorrect?: boolean;
    totalAnswered: number;
    totalCorrect: number;
    accuracyPct: number;
    avgResponseMillis: number;
}

export interface GlobalMonitoringStatsDto {
    globalAccuracyPct: number;
    totalAnsweredAll: number;
    totalCorrectAll: number;
    activeStudentsCount: number;
}

export interface RankingEntryDto {
    rank: number;
    studentId: string;
    studentName: string;
    totalAnswered: number;
    avgResponseMillis: number;
    accuracyPct: number;
}

export interface RoomMonitoringSnapshotDto {
    roomId: string;
    students: StudentMonitoringStateDto[];
    globalStats: GlobalMonitoringStatsDto;
    ranking: RankingEntryDto[];
    timestamp: string;
}
