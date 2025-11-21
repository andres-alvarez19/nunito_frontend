import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { palette } from "@/theme/colors";

interface TeacherSectionCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function TeacherSectionCard({
  title,
  subtitle,
  children,
}: TeacherSectionCardProps) {
  return (
    <View className="gap-3">
      <Text className="text-[22px] font-bold text-text">{title}</Text>
      {subtitle ? <Text className="text-[15px] text-muted">{subtitle}</Text> : null}
      {children ? <View className="mt-1 gap-3">{children}</View> : null}
    </View>
  );
}

const styles = {};

