import { Text, TouchableOpacity, View } from "react-native";
import { patientSummaries } from "@matriwatch/shared";
import { Screen } from "@/components/screen";

const mother = patientSummaries[0];

export default function ProfileScreen() {
  return (
    <Screen>
      <View className="rounded-2xl border border-border bg-card p-5">
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Text className="text-xl font-bold text-white">FA</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-ink">Fatima Begum</Text>
            <Text className="mt-1 text-sm text-mutedText">{mother.age} years old, {mother.gestationalAgeWeeks} weeks pregnant</Text>
          </View>
        </View>

        <View className="mt-5 gap-3">
          <View className="flex-row justify-between border-b border-border pb-3">
            <Text className="text-mutedText">Due date</Text>
            <Text className="font-semibold text-ink">{mother.dueDate}</Text>
          </View>
          <View className="flex-row justify-between border-b border-border pb-3">
            <Text className="text-mutedText">Countdown</Text>
            <Text className="rounded-full bg-peach px-3 py-1 font-semibold text-ink">28 days to due date</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-mutedText">Assigned clinic</Text>
            <Text className="font-semibold text-ink">Dhaka Mother & Child</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity className="min-h-12 items-center justify-center rounded-xl border border-primary bg-white p-4">
        <Text className="font-semibold text-primary">Edit Details</Text>
      </TouchableOpacity>

      <TouchableOpacity className="min-h-12 items-center justify-center p-4">
        <Text className="font-semibold text-mutedText">Sign Out</Text>
      </TouchableOpacity>
    </Screen>
  );
}
