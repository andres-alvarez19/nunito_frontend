import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { API_CONFIG } from '@/config/api';
import * as encoding from 'text-encoding';
import SockJS from 'sockjs-client';
import { fetchRoomAnswers } from '@/services/useAnswers';
import { AnswerViewModel, normalizeAnswerRecord } from '@/logic/answersDelivery';

// Polyfill for TextEncoder/TextDecoder in React Native if not available
if (typeof (global as any).TextEncoder === 'undefined') {
    (global as any).TextEncoder = encoding.TextEncoder;
}
if (typeof (global as any).TextDecoder === 'undefined') {
    (global as any).TextDecoder = encoding.TextDecoder;
}

export interface UserDto {
    userId: string;
    name: string;
}

export type RoomStatus = 'WAITING' | 'STARTED' | 'FINISHED';

export interface RoomStatusDto {
    roomId: string;
    status: RoomStatus;
}

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

interface UseRoomSocketProps {
    roomId: string;
    userId: string;
    userName: string;
    isTeacher?: boolean;
    enabled?: boolean;
    prefetchAnswers?: boolean;
}

export type AnswerDto = AnswerViewModel;

export function useRoomSocket({ roomId, userId, userName, isTeacher = false, enabled = true, prefetchAnswers }: UseRoomSocketProps) {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [answers, setAnswers] = useState<AnswerDto[]>([]);
    const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
    const [roomStatus, setRoomStatus] = useState<RoomStatus>('WAITING');
    const clientRef = useRef<Client | null>(null);
    const shouldPrefetchAnswers = prefetchAnswers ?? isTeacher;

    useEffect(() => {
        setAnswers([]);
    }, [roomId]);

    useEffect(() => {
        let cancelled = false;
        if (!shouldPrefetchAnswers || !roomId) return () => { cancelled = true; };

        fetchRoomAnswers(roomId)
            .then((fetched) => {
                if (cancelled) return;
                const normalized = fetched.map(normalizeAnswerRecord);
                setAnswers(normalized);
            })
            .catch((error) => {
                console.error('Error fetching room answers:', error);
            });

        return () => {
            cancelled = true;
        };
    }, [roomId, shouldPrefetchAnswers]);

    useEffect(() => {
        if (!enabled || !roomId || !userId) return;

        // Construct WebSocket URL from API base URL
        // Replace http/https with ws/wss and append /ws
        // For SockJS we use the http url
        const socketUrl = API_CONFIG.BASE_URL.replace(/\/api$/, '/ws');

        const client = new Client({
            // brokerURL: wsUrl, // We use webSocketFactory for SockJS compatibility if needed, or just standard WS
            webSocketFactory: () => new SockJS(socketUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setStatus('CONNECTED');
                console.log('Connected to WebSocket');

                // Subscribe to room users
                client.subscribe(`/topic/room/${roomId}/users`, (message) => {
                    try {
                        const usersList: UserDto[] = JSON.parse(message.body);
                        setUsers(usersList);
                    } catch (e) {
                        console.error('Error parsing users list:', e);
                    }
                });

                // Subscribe to room answers (monitoring stream)
                console.log(`Subscribing to /topic/monitoring/room/${roomId}/answers`);
                client.subscribe(`/topic/monitoring/room/${roomId}/answers`, (message) => {
                    console.log('Received answer message:', message.body);
                    try {
                        const parsed = JSON.parse(message.body);
                        const answer = normalizeAnswerRecord({
                            ...parsed,
                            roomId,
                        });
                        setAnswers(prev => {
                            const newAnswers = [...prev, answer];
                            console.log('Updated answers state:', newAnswers.length);
                            return newAnswers;
                        });
                    } catch (e) {
                        console.error('Error parsing answer:', e);
                    }
                });

                // Subscribe to room status
                client.subscribe(`/topic/room/${roomId}/status`, (message) => {
                    try {
                        const payload: RoomStatusDto = JSON.parse(message.body);
                        setRoomStatus(payload.status);
                    } catch (e) {
                        console.error('Error parsing room status:', e);
                    }
                });

                // Announce join
                client.publish({
                    destination: `/app/room/${roomId}/join`,
                    body: JSON.stringify({ userId, name: userName }),
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                setStatus('ERROR');
            },
            onWebSocketClose: () => {
                console.log('WebSocket connection closed');
                if (status !== 'DISCONNECTED') {
                    setStatus('DISCONNECTED');
                }
            },
        });

        client.activate();
        clientRef.current = client;
        setStatus('CONNECTING');

        return () => {
            if (client.connected) {
                // Announce leave
                try {
                    client.publish({
                        destination: `/app/room/${roomId}/leave`,
                        body: JSON.stringify({ userId, name: userName }),
                    });
                } catch (e) {
                    console.error('Error sending leave message:', e);
                }
            }
            client.deactivate();
            clientRef.current = null;
            setStatus('DISCONNECTED');
        };
    }, [roomId, userId, userName, enabled]);

    const startActivity = () => {
        if (!isTeacher) return;
        const client = clientRef.current;
        if (client && client.connected) {
            client.publish({
                destination: `/app/room/${roomId}/start`,
                body: '',
            });
        }
    };

    return { users, answers, status, roomStatus, startActivity, stompClient: clientRef.current };
}
