import { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

import NunitoButton from "@/features/home/components/NunitoButton";
import { palette, withAlpha } from "@/theme/colors";
import { formatSeconds } from "@/utils/time";
import { UserDto, RoomStatus, ConnectionStatus } from "@/hooks/useRoomSocket";

interface StudentDashboardProps {
  studentName: string;
  studentId: string;
  roomCode: string;
  roomId: string;
  teacherId?: string;
  onStartGame: (gameId: string) => void;
  onLeaveRoom: () => void;
  connectedUsers: UserDto[];
  roomStatus: RoomStatus;
  connectionStatus?: ConnectionStatus;
}

const MOTIVATION_CARDS = [
  {
    title: "¡Tú puedes!",
    description: "Haz tu mejor esfuerzo en cada pregunta.",
  },
  {
    title: "Aprende jugando",
    description: "Cada respuesta correcta suma puntos.",
  },
  {
    title: "Diviértete",
    description: "Lo importante es disfrutar la actividad.",
  },
];

const GAME_INSTRUCTIONS = [
  "Observa cuidadosamente cada imagen que aparezca en pantalla.",
  "Lee todas las opciones de palabras disponibles.",
  "Selecciona la palabra que mejor corresponda a la imagen.",
  "Recibirás retroalimentación inmediata sobre tu respuesta.",
];

export default function StudentDashboard({
  studentName,
  studentId,
  roomCode,
  roomId,
  teacherId,
  onStartGame,
  onLeaveRoom,
  connectedUsers,
  roomStatus,
  connectionStatus = 'DISCONNECTED',
}: StudentDashboardProps) {
  const totalTime = 600;
  const [isWaiting, setIsWaiting] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(totalTime);
  const [isActive, setIsActive] = useState(false);

  // WebSocket Integration is now handled by parent (HomeScreen)

  // Use real-time users list
  const studentList = useMemo(() => {
    // Map UserDto to string names for display, filtering out the teacher
    return connectedUsers
      .filter(u => !teacherId || u.userId !== teacherId)
      .map(u => u.name);
  }, [connectedUsers, teacherId]);

  const totalStudents = studentList.length;
  const progress = useMemo(
    () => ((totalTime - timeRemaining) / totalTime) * 100,
    [timeRemaining, totalTime],
  );
  const formattedTime = formatSeconds(timeRemaining);
  const avatarInitial = studentName.charAt(0).toUpperCase();

  useEffect(() => {
    if (roomStatus === 'STARTED') {
      setIsWaiting(false);
      setIsActive(true);
    } else {
      setIsWaiting(true);
      setIsActive(false);
    }
  }, [roomStatus]);

  useEffect(() => {
    if (!isActive) return;

    if (timeRemaining === 0) {
      setIsActive(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const handlePlay = () => {
    onStartGame("image-word");
  };

  const cardSpacing = Platform.OS === "web" ? "space-y-5" : "space-y-4";

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: palette.background }}
      contentContainerClassName={`px-6 pb-10 pt-6 ${cardSpacing}`}
    >
      <View
        className="rounded-3xl border p-5 shadow-sm"
        style={{ backgroundColor: palette.surface, borderColor: palette.border }}
      >
        <View className="flex-row items-center gap-4">
          <View
            className="h-14 w-14 rounded-full items-center justify-center"
            style={{ backgroundColor: palette.primary }}
          >
            <Text className="text-2xl font-bold" style={{ color: palette.primaryOn }}>
              {avatarInitial}
            </Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-2xl font-bold" style={{ color: palette.text }}>
              ¡Hola, {studentName}!
            </Text>
            <Text className="text-sm" style={{ color: palette.muted }}>
              Sala {roomCode} · {connectionStatus === 'CONNECTED' ? 'En línea' : connectionStatus === 'CONNECTING' ? 'Conectando…' : 'Sin conexión'}
            </Text>
          </View>
          <TouchableOpacity
            className="px-3 py-2 rounded-xl border"
            style={{
              borderColor: withAlpha(palette.error, 0.5),
              backgroundColor: withAlpha(palette.error, 0.12),
            }}
            onPress={onLeaveRoom}
          >
            <Text className="font-semibold" style={{ color: palette.error }}>
              Salir
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isWaiting ? (
        <View
          className="rounded-3xl border p-6 space-y-4 shadow"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          <Text className="text-xl font-bold" style={{ color: palette.text }}>
            Esperando que inicie el juego…
          </Text>
          <Text className="text-base" style={{ color: palette.muted }}>
            Tu profesor iniciará la actividad pronto.
          </Text>
          <View
            className="self-start rounded-full px-3 py-1.5"
            style={{ backgroundColor: withAlpha(palette.primary, 0.12) }}
          >
            <Text className="font-semibold" style={{ color: palette.primary }}>
              Estudiantes conectados: {totalStudents}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-3">
            {studentList.map((student, index) => (
              <View
                key={`${student}-${index}`}
                className="flex-row items-center gap-2 rounded-xl px-3.5 py-2.5 border flex-1"
                style={{
                  minWidth: "45%",
                  borderColor: withAlpha(
                    palette.primary,
                    student === studentName ? 0.4 : 0.15,
                  ),
                  backgroundColor: withAlpha(
                    palette.primary,
                    student === studentName ? 0.18 : 0.05,
                  ),
                }}
              >
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "#22C55E" }}
                />
                <Text
                  className="text-base"
                  style={{
                    color: palette.text,
                    fontWeight: student === studentName ? "700" : "500",
                  }}
                >
                  {student}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View
          className="rounded-3xl border p-6 space-y-4 shadow"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          <Text className="text-xl font-bold" style={{ color: palette.text }}>
            La actividad ha comenzado
          </Text>
          <Text className="text-base" style={{ color: palette.muted }}>
            Presiona el botón cuando estés listo para jugar.
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-sm" style={{ color: palette.muted }}>
              Tiempo restante
            </Text>
            <Text className="text-xl font-bold" style={{ color: palette.primary }}>
              {formattedTime}
            </Text>
          </View>

          <View
            className="h-2.5 rounded-full overflow-hidden"
            style={{ backgroundColor: withAlpha(palette.primary, 0.08) }}
          >
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: palette.primary,
                width: `${Math.min(Math.max(progress, 0), 100)}%`,
              }}
            />
          </View>

          <NunitoButton disabled={!isActive} onPress={handlePlay}>
            <Text className="text-lg font-bold" style={{ color: palette.text }}>
              {isActive ? "¡Comenzar a jugar!" : "Esperando instrucciones…"}
            </Text>
          </NunitoButton>

          <View className="flex-row flex-wrap gap-3">
            {MOTIVATION_CARDS.map((card) => (
              <View
                key={card.title}
                className="flex-1 rounded-xl border px-3.5 py-3"
                style={{
                  minWidth: "45%",
                  backgroundColor: palette.surfaceMuted,
                  borderColor: withAlpha(palette.border, 0.8),
                }}
              >
                <Text className="font-bold mb-1" style={{ color: palette.text }}>
                  {card.title}
                </Text>
                <Text className="text-sm" style={{ color: palette.muted }}>
                  {card.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View
        className="rounded-3xl border p-6 space-y-3 shadow"
        style={{ backgroundColor: palette.surface, borderColor: palette.border }}
      >
        <Text className="text-xl font-bold" style={{ color: palette.text }}>
          Instrucciones del juego
        </Text>
        {GAME_INSTRUCTIONS.map((step, index) => (
          <View key={step} className="flex-row items-center gap-3">
            <View
              className="h-7 w-7 rounded-full items-center justify-center"
              style={{ backgroundColor: withAlpha(palette.primary, 0.14) }}
            >
              <Text className="font-bold" style={{ color: palette.primary }}>
                {index + 1}
              </Text>
            </View>
            <Text className="flex-1 text-base" style={{ color: palette.text }}>
              {step}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
