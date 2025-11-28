import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import {
    RoomMonitoringSnapshotDto,
    StudentMonitoringStateDto,
    GlobalMonitoringStatsDto,
    RankingEntryDto
} from '@/types/monitoring';

interface UseRoomMonitoringProps {
    roomId: string;
    stompClient: Client | null;
}

export function useRoomMonitoring({ roomId, stompClient }: UseRoomMonitoringProps) {
    const [students, setStudents] = useState<StudentMonitoringStateDto[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalMonitoringStatsDto | null>(null);
    const [ranking, setRanking] = useState<RankingEntryDto[]>([]);
    const [connectionState, setConnectionState] = useState<'connecting' | 'online' | 'offline'>('connecting');

    useEffect(() => {
        if (!stompClient || !stompClient.connected) {
            setConnectionState('offline');
            return;
        }

        setConnectionState('online');

        const subscription = stompClient.subscribe(`/topic/monitoring/room/${roomId}/snapshot`, (message) => {
            console.log('Monitoring snapshot received:', message.body);
            try {
                const snapshot: RoomMonitoringSnapshotDto = JSON.parse(message.body);
                console.log('Parsed snapshot:', snapshot);
                setStudents(snapshot.students);
                setGlobalStats(snapshot.globalStats);
                setRanking(snapshot.ranking);
            } catch (error) {
                console.error('Error parsing monitoring snapshot:', error);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [roomId, stompClient]);

    // Update connection state based on client status changes if needed
    // Ideally useRoomSocket handles the connection lifecycle, we just react to it here.
    useEffect(() => {
        if (stompClient?.connected) {
            setConnectionState('online');
        } else {
            setConnectionState('offline');
        }
    }, [stompClient?.connected]);

    return {
        students,
        globalStats,
        ranking,
        connectionState
    };
}
