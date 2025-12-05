import React, { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';

import { palette, withAlpha } from "@/theme/colors";

export interface RoomSummaryCardProps {
  title: string;
  gameLabel: string;
  dateTime: string;
  students: number;
  average: number;
  completion: number;
  code?: string;
  onPressDetails?: () => void;
  onStartActivity?: () => void;
  status?: "pending" | "active" | "finished";
}

export default function RoomSummaryCard({
  title,
  gameLabel,
  dateTime,
  students,
  average,
  completion,
  code,
  onPressDetails,
  onStartActivity,
  status,
}: RoomSummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (code) {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Pressable
      className={`flex-1 min-w-[280px] bg-surface rounded-2xl py-5 px-5 border border-border shadow-md gap-4 active:scale-[0.98] transition-transform ${onPressDetails ? "active:border-primary/50 active:shadow-lg hover:shadow-xl" : ""}`}
      onPress={onPressDetails}
    >
      <View className="flex-row justify-between items-center gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-lg font-semibold text-text">{title}</Text>
          <Text className="text-sm text-muted">{dateTime}</Text>
          {code && (
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-xs font-bold text-muted uppercase tracking-wider">CÓDIGO:</Text>
              <TouchableOpacity
                className="flex-row items-center gap-1.5 bg-surfaceMuted px-2 py-0.5 rounded border border-border/50 active:bg-primary/10"
                onPress={handleCopyCode}
              >
                <Text className="text-sm font-mono font-bold text-primary">{code}</Text>
                <Feather name={copied ? "check" : "copy"} size={12} color={palette.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>

      <View className="flex-row gap-4">
        <StatBlock label="Estudiantes" value={(students || 0).toString()} />
        <StatBlock label="Promedio" value={`${average ?? 0}%`} />
        <StatBlock
          label="Completado"
          value={`${completion ?? 0}%`}
          accent
        />
      </View>

      <View className="gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-medium text-text">Progreso general</Text>
          <Text className="text-sm text-muted">{average ?? 0}%</Text>
        </View>
        <View className="h-2 rounded-full bg-primary/20 overflow-hidden">
          <View
            className="h-full bg-primary"
            style={{ width: `${Math.max(0, Math.min(100, average ?? 0))}%` }}
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        {onStartActivity && (
          <TouchableOpacity
            className="flex-1 h-10 rounded-lg bg-primary items-center justify-center shadow-sm active:opacity-90"
            onPress={onStartActivity}
          >
            <Text className="text-sm font-bold text-primaryOn">
              {status === "active" ? "Ver estado" : "Iniciar actividad"}
            </Text>
          </TouchableOpacity>
        )}
        {onPressDetails && (
          <TouchableOpacity
            className={`h-10 rounded-lg border border-border bg-surfaceMuted items-center justify-center ${onStartActivity ? "px-4" : "flex-1"}`}
            onPress={onPressDetails}
          >
            <Text className="text-sm font-medium text-text">Ver detalles</Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
}

interface StatBlockProps {
  label: string;
  value: string;
  accent?: boolean;
}

function StatBlock({ label, value, accent }: StatBlockProps) {
  return (
    <View className="flex-1 items-center">
      <Text
        className={`text-2xl font-bold ${accent ? "text-[#00A63E]" : "text-[#155DFC]"}`}
      >
        {value}
      </Text>
      <Text className="text-sm text-muted">{label}</Text>
    </View>
  );
}

const styles = {};
