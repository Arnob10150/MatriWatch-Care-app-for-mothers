import { Text, View } from "react-native";
import type { RiskLevel } from "@matriwatch/shared";

const containerStyles: Record<RiskLevel, string> = {
  Low: "border-success/30 bg-lowBg",
  Mid: "border-warning/30 bg-midBg",
  High: "border-danger/30 bg-highBg"
};

const textStyles: Record<RiskLevel, string> = {
  Low: "text-success",
  Mid: "text-warning",
  High: "text-danger"
};

const dotStyles: Record<RiskLevel, string> = {
  Low: "bg-success",
  Mid: "bg-warning",
  High: "bg-danger"
};

export function RiskPill({ level }: { level: RiskLevel }) {
  return (
    <View className={`self-start flex-row items-center gap-1.5 rounded-full border px-3 py-1 ${containerStyles[level]}`}>
      <View className={`h-1.5 w-1.5 rounded-full ${dotStyles[level]}`} />
      <Text className={`text-sm font-semibold ${textStyles[level]}`}>{level} risk</Text>
    </View>
  );
}
