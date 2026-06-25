import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { patientSummaries } from "@matriwatch/shared";
import { RiskPill } from "@/components/risk-pill";
import { Screen } from "@/components/screen";

const entries = patientSummaries.map((patient, index) => ({
  id: patient.id,
  date: new Date(Date.now() - index * 86400000).toLocaleDateString("en-BD", { month: "short", day: "numeric" }),
  risk: patient.risk.level,
  checkIn: patient.latestCheckIn,
  reasons: patient.risk.reasons
}));

export default function HistoryScreen() {
  const [openId, setOpenId] = useState(entries[0]?.id);

  return (
    <Screen>
      <View>
        <Text className="text-2xl font-bold text-ink">History</Text>
        <Text className="mt-1 text-sm text-mutedText">Your recent check-ins and risk results.</Text>
      </View>

      <View className="gap-0">
        {entries.map((entry, index) => {
          const open = openId === entry.id;
          return (
            <View key={entry.id} className="flex-row gap-3">
              <View className="items-center">
                <View className="mt-5 h-3 w-3 rounded-full bg-blush" />
                {index < entries.length - 1 ? <View className="h-24 w-px border-l border-dashed border-primary" /> : null}
              </View>
              <TouchableOpacity
                onPress={() => setOpenId(open ? "" : entry.id)}
                className="mb-3 flex-1 rounded-xl border border-border bg-card p-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-ink">{entry.date}</Text>
                  <RiskPill level={entry.risk} />
                </View>
                <Text className="mt-2 text-sm text-mutedText">
                  BP {entry.checkIn.bpSystolic}/{entry.checkIn.bpDiastolic}, sugar {entry.checkIn.bloodSugar}, pulse {entry.checkIn.heartRate}
                </Text>
                {open ? <Text className="mt-3 text-sm leading-6 text-ink">{entry.reasons.join(", ")}</Text> : null}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
