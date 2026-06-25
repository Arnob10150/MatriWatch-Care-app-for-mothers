import type { ReactNode } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        <View className="gap-4">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
