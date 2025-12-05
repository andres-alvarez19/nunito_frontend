import { useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { buildAnswerSubmission, sendAnswerWithFallback } from '@/logic/answersDelivery';

interface UseGameMonitoringPublisherProps {
    roomId: string;
    studentId: string;
    studentName: string;
    gameId: string;
    stompClient: Client | null;
}

export function useGameMonitoringPublisher({
    roomId,
    studentId,
    studentName,
    gameId,
    stompClient,
}: UseGameMonitoringPublisherProps) {

    const publishAnswer = useCallback((
        questionId: string,
        questionText: string,
        selectedOption: string,
        isCorrect: boolean,
        elapsedMillis: number
    ) => {
        console.log('useGameMonitoringPublisher - publishAnswer called');
        if (!roomId || !studentId) {
            console.warn('Cannot publish answer: missing roomId or studentId');
            return;
        }

        const submission = buildAnswerSubmission({
            studentId,
            questionId,
            answer: selectedOption,
            questionText,
            isCorrect,
            elapsedMs: elapsedMillis,
            attempt: 1,
            studentName,
            gameId,
        });

        console.log('Publishing answer submission:', submission);

        void sendAnswerWithFallback({
            roomId,
            submission,
            stompClient,
        }).then((result) => {
            console.log('Answer delivery result:', result);
        }).catch((error) => {
            console.error('Error delivering answer event:', error);
        });
    }, [roomId, studentId, studentName, gameId, stompClient]);

    return { publishAnswer };
}
