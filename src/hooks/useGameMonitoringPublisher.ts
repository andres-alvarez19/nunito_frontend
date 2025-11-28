import { useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { AnswerEventDto } from '@/types/monitoring';

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
        if (!stompClient || !stompClient.connected) {
            console.warn('Cannot publish answer: STOMP client not connected');
            return;
        }

        const event: AnswerEventDto = {
            roomId,
            studentId,
            studentName,
            gameId,
            questionId,
            questionText,
            selectedOption,
            isCorrect,
            elapsedMillis,
            answeredAt: new Date().toISOString(),
        };

        console.log('Publishing answer event:', event);

        try {
            // Publish to monitoring topic
            stompClient.publish({
                destination: `/app/monitoring/room/${roomId}/answer`,
                body: JSON.stringify(event),
            });

            // Publish to simple room answers topic (for Teacher Dashboard "Sala en tiempo real")
            const simpleAnswer = {
                studentId,
                studentName,
                questionId,
                answer: selectedOption,
                correct: isCorrect
            };
            console.log('Publishing simple answer:', simpleAnswer);
            stompClient.publish({
                destination: `/topic/room/${roomId}/answers`,
                body: JSON.stringify(simpleAnswer),
            });

        } catch (error) {
            console.error('Error publishing answer event:', error);
        }
    }, [roomId, studentId, studentName, gameId, stompClient]);

    return { publishAnswer };
}
