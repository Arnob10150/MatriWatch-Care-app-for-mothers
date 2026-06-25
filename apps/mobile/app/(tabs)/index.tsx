import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { patientSummaries } from "@matriwatch/shared";
import { RiskPill } from "@/components/risk-pill";
import { Screen } from "@/components/screen";

const mother = patientSummaries[0];

const riskStyles = {
  Low: "bg-success",
  Mid: "bg-warning",
  High: "bg-danger"
};

const riskMessages = {
  Low: "You're doing great, keep it up",
  Mid: "Please monitor closely",
  High: "Please contact your clinic today"
};

export default function MotherHomeScreen() {
  const today = new Date().toLocaleDateString("en-BD", { weekday: "long", month: "long", day: "numeric" });

  return (
    <Screen>
      <View className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Text className="text-2xl font-bold text-ink">Good morning, Fatima</Text>
        <Text className="mt-1 text-sm text-mutedText">{today}</Text>
      </View>

      <View className={`rounded-2xl p-5 ${riskStyles[mother.risk.level]}`}>
        <Text className="text-sm font-medium text-white/80">Current risk status</Text>
        <Text className="mt-2 text-3xl font-bold text-white">{mother.risk.level} Risk</Text>
        <Text className="mt-2 text-base text-white">{riskMessages[mother.risk.level]}</Text>
        <Text className="mt-4 text-sm text-white/70">Last check-in: today, 8:15 AM</Text>
      </View>

      <Link href="/(tabs)/check-in" asChild>
        <TouchableOpacity className="min-h-12 items-center justify-center rounded-xl bg-primary p-4 shadow-sm">
          <Text className="text-base font-semibold text-white">Start Today's Check-in</Text>
        </TouchableOpacity>
      </Link>

      <View className="flex-row gap-2">
        {[
          ["BP", `${mother.latestCheckIn.bpSystolic}/${mother.latestCheckIn.bpDiastolic}`],
          ["Sugar", `${mother.latestCheckIn.bloodSugar}`],
          ["Temp", `${mother.latestCheckIn.bodyTemp}`],
          ["Pulse", `${mother.latestCheckIn.heartRate}`],
        ].map(([label, value]) => (
          <View key={label} className="flex-1 rounded-2xl bg-peach/50 p-3">
            <Text className="text-xs font-medium text-mutedText">{label}</Text>
            <Text className="mt-1 text-sm font-bold text-ink">{value}</Text>
          </View>
        ))}
      </View>

      <View className="rounded-2xl border border-border bg-card p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-ink">Weekly mood check</Text>
          <RiskPill level={mother.epds?.flagged ? "High" : "Low"} />
        </View>
        <Text className="text-sm leading-6 text-mutedText">A short EPDS questionnaire helps your clinic catch postpartum depression early.</Text>
        <Link href="/epds" asChild>
          <TouchableOpacity className="mt-4 min-h-12 items-center justify-center rounded-xl border border-primary bg-white px-4">
            <Text className="font-semibold text-primary">Open Mental Health Check</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </Screen>
  );
}
