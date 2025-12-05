import { View, Text, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette, withAlpha } from '@/theme/colors';

interface StudentWaitingRoomProps {
    roomCode: string;
    connectedStudents: string[];
    studentName: string;
    connectionStatus?: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
}

export default function StudentWaitingRoom({ roomCode, connectedStudents, studentName, connectionStatus = 'DISCONNECTED' }: StudentWaitingRoomProps) {
    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'CONNECTED': return 'text-green-600';
            case 'CONNECTING': return 'text-yellow-600';
            case 'ERROR': return 'text-red-600';
            default: return 'text-gray-400';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'CONNECTED': return 'Conectado';
            case 'CONNECTING': return 'Conectando...';
            case 'ERROR': return 'Error de conexión';
            default: return 'Desconectado';
        }
    };

    return (
        <View className="flex-1 items-center justify-center p-6">
            {/* Connection Status Indicator */}
            <View className="absolute top-4 right-4 flex-row items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-border/60 shadow-sm">
                <View className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-green-500' : connectionStatus === 'CONNECTING' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <Text className={`text-xs font-bold ${getStatusColor()}`}>
                    {getStatusText()}
                </Text>
            </View>

            {/* Pulse Animation Placeholder - Static for now */}
            <View
                className="w-20 h-20 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: withAlpha(palette.primary, 0.2) }}
            >
                <Feather name="clock" size={40} color={palette.primary} />
            </View>

            <Text className="text-2xl font-bold text-center mb-2" style={{ color: palette.text }}>
                Esperando que inicie el juego...
            </Text>
            <Text className="text-base text-center mb-8" style={{ color: palette.muted }}>
                Tu profesor iniciará la actividad pronto
            </Text>

            {/* Connected Students Card */}
            <View
                className="w-full max-w-md rounded-xl border p-4 shadow-sm"
                style={{
                    borderColor: palette.border,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 2
                }}
            >
                <View className="flex-row items-center justify-center gap-2 mb-4">
                    <Feather name="users" size={20} color={palette.text} />
                    <Text className="text-lg font-bold" style={{ color: palette.text }}>
                        Estudiantes conectados ({connectedStudents.length})
                    </Text>
                </View>

                <View className="flex-row flex-wrap gap-2">
                    {connectedStudents.map((student, index) => (
                        <View
                            key={index}
                            className="flex-row items-center gap-2 px-3 py-2 rounded-lg w-[48%]"
                            style={{ backgroundColor: palette.accent }}
                        >
                            <View className="w-2 h-2 rounded-full bg-green-500" />
                            <Text
                                className="text-sm"
                                style={{
                                    color: palette.text,
                                    fontWeight: student === studentName ? '700' : '400'
                                }}
                            >
                                {student}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
