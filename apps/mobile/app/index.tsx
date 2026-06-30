import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { getAuth } from "@/lib/auth";

export default function IndexRedirect() {
  const [target, setTarget] = useState<"/login" | "/(tabs)" | null>(null);

  useEffect(() => {
    getAuth().then((auth) => setTarget(auth ? "/(tabs)" : "/login"));
  }, []);

  if (!target) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#C97C8A" />
      </SafeAreaView>
    );
  }

  return <Redirect href={target} />;
}
