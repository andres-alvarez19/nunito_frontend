import { ScrollView, Text, View } from "react-native";

import NunitoButton from "@/features/home/components/NunitoButton";
import {
  gameDefinitions,
  gameThemeTokens,
} from "@/features/home/constants/games";
import type { GameResults } from "@/features/home/types";
import { withAlpha } from "@/theme/colors";

interface StudentResultsProps {
  studentName: string;
  gameId: string;
  results: GameResults;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export default function StudentResults({
  studentName,
  gameId,
  results,
  onPlayAgain,
  onBackToHome,
}: StudentResultsProps) {
  const gameDefinition = gameDefinitions.find(
    (definition) => definition.id === gameId,
  );
  const theme = gameDefinition
    ? gameThemeTokens[gameDefinition.color]
    : { accent: "#16a34a", container: "#ecfdf3", on: "#ffffff" };
  const gameName = gameDefinition?.name ?? "mini juego";

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "¡Excelente trabajo!";
    if (score >= 70) return "¡Muy bien hecho!";
    if (score >= 50) return "¡Buen esfuerzo!";
    return "¡Sigue practicando!";
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return "🏆";
    if (score >= 70) return "🎖️";
    if (score >= 50) return "⭐";
    return "🎯";
  };

  const getStarRating = (score: number) => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    return 1;
  };
  const achievementPalette: Record<string, { background: string; border: string }> = {
    "#F59E0B": { background: "#FEF3C7", border: "#FDE68A" },
    "#22C55E": { background: "#ECFDF3", border: "#BBF7D0" },
    "#3B82F6": { background: "#EFF6FF", border: "#BFDBFE" },
    "#8B5CF6": { background: "#F5F3FF", border: "#DDD6FE" },
  };

  const starRating = getStarRating(results.score);
  const performanceMessage = getPerformanceMessage(results.score);
  const formatTime = (seconds: number) => `${seconds.toFixed(1)}s`;
  const performanceIcon = getPerformanceIcon(results.score);

  const stats = [
    { label: "Total de preguntas", value: results.totalQuestions.toString() },
    { label: "Correctas", value: results.correctAnswers.toString() },
    { label: "Incorrectas", value: results.incorrectAnswers.toString() },
    { label: "Tiempo promedio", value: formatTime(results.averageTime) },
  ];

  const achievements: Array<{
    title: string;
    description: string;
    accent: string;
    icon: string;
  }> = [];
  if (results.score >= 90) {
    achievements.push({
      title: "¡Maestro del juego!",
      description: "Obtuviste más del 90% de respuestas correctas.",
      accent: "#F59E0B",
      icon: "🏆",
    });
  }
  if (results.correctAnswers === results.totalQuestions) {
    achievements.push({
      title: "¡Perfecto!",
      description: "Respondiste todas las preguntas correctamente.",
      accent: "#22C55E",
      icon: "🎯",
    });
  }
  if (results.averageTime <= 10) {
    achievements.push({
      title: "¡Rápido como el rayo!",
      description: "Tu tiempo promedio fue menor a 10 segundos.",
      accent: "#3B82F6",
      icon: "⏱️",
    });
  }
  if (results.score >= 50) {
    achievements.push({
      title: "¡Buen trabajo!",
      description: "Completaste el juego exitosamente.",
      accent: "#8B5CF6",
      icon: "⭐",
    });
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.container }}
      contentContainerClassName="px-6 pb-10 space-y-5"
    >
      <View
        className="rounded-3xl p-7 shadow-md"
        style={{ backgroundColor: theme.accent }}
      >
        <Text
          className="text-2xl font-bold text-center"
          style={{ color: theme.on }}
        >
          ¡Juego completado!
        </Text>
        <Text
          className="text-base mt-1 text-center"
          style={{ color: withAlpha(theme.on, 0.85) }}
        >
          {gameName} • {studentName}
        </Text>
      </View>

      <View className="bg-white rounded-3xl p-6 space-y-4 border border-gray-200 shadow">
        <View
          className="self-center h-16 w-16 rounded-full items-center justify-center"
          style={{ backgroundColor: withAlpha(theme.accent, 0.18) }}
        >
          <Text className="text-4xl">{performanceIcon}</Text>
        </View>
        <Text className="text-2xl font-bold text-center">
          {performanceMessage}
        </Text>
        <Text className="text-base text-gray-600 text-center">
          Has obtenido {results.score} puntos
        </Text>
        <View className="flex-row justify-center gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Text
              key={index}
              className={`${
                index < starRating ? "text-yellow-400" : "text-gray-300"
              }`}
              style={{ fontSize: 28, lineHeight: 32 }}
            >
              ★
            </Text>
          ))}
        </View>
        <View className="flex-row justify-between items-center mt-2 mb-1 px-1">
          <Text className="text-xs font-semibold text-gray-600">Puntuación</Text>
          <Text className="text-sm font-bold text-gray-900">{results.score}%</Text>
        </View>
        <View className="h-3.5 rounded-full bg-gray-200 overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${results.score}%`,
              backgroundColor: theme.accent,
            }}
          />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {stats.map((stat) => (
          <View
            key={stat.label}
            className="basis-[48%] min-w-[48%] bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
          >
            <Text className="text-sm text-gray-500">{stat.label}</Text>
            <Text className="text-2xl font-bold mt-1 text-gray-900">
              {stat.value}
            </Text>
          </View>
          ))}
        </View>

        <View className="bg-white rounded-3xl p-6 border border-gray-200 shadow space-y-4">
          <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 rounded-full items-center justify-center bg-yellow-100">
            <Text className="text-xl">🏅</Text>
          </View>
          <Text className="text-lg font-bold text-gray-900">
            Logros obtenidos
          </Text>
        </View>
        {achievements.length === 0 ? (
          <Text className="text-gray-600">
            Sigue practicando para desbloquear logros especiales.
          </Text>
        ) : (
          achievements.map((achievement) => (
            <View
              key={achievement.title}
              className="flex-row items-center gap-3 p-3 rounded-xl border"
              style={{
                backgroundColor:
                  achievementPalette[achievement.accent]?.background ??
                  withAlpha(achievement.accent, 0.12),
                borderColor:
                  achievementPalette[achievement.accent]?.border ??
                  withAlpha(achievement.accent, 0.45),
              }}
            >
              <View
                className="h-10 w-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: withAlpha(achievement.accent, 0.18),
                }}
              >
                <Text style={{ fontSize: 20 }}>{achievement.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {achievement.title}
                </Text>
                <Text className="text-sm text-gray-600">
                  {achievement.description}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View className="bg-blue-50 border border-gray-200 rounded-2xl p-5 space-y-2">
        <Text className="text-lg font-bold text-center text-gray-900">
          ¡Sigue aprendiendo!
        </Text>
        <Text className="text-sm text-center text-gray-600">
          {results.score >= 80
            ? "¡Excelente trabajo! Estás dominando muy bien este juego. ¿Te animas a probar otro?"
            : "¡Muy bien! Cada vez que juegas, aprendes algo nuevo. ¡Sigue practicando para mejorar aún más!"}
        </Text>
      </View>

      <View className="flex-row gap-3">
        <NunitoButton
          style={{ flex: 1, padding: 0, backgroundColor: "transparent" }}
          contentStyle={{ minHeight: 48, borderRadius: 12, backgroundColor: theme.accent }}
          onPress={onPlayAgain}
        >
          <Text className="text-lg font-bold text-center" style={{ color: theme.on }}>
            ⭐ Jugar de nuevo
          </Text>
        </NunitoButton>
        <NunitoButton
          style={{ flex: 1, padding: 0, backgroundColor: "transparent" }}
          contentStyle={{
            minHeight: 48,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: theme.accent,
            backgroundColor: "#fff",
          }}
          onPress={onBackToHome}
        >
          <Text className="text-lg font-bold text-center" style={{ color: theme.accent }}>
            🏠 Volver al inicio
          </Text>
        </NunitoButton>
      </View>
    </ScrollView>
  );
}
