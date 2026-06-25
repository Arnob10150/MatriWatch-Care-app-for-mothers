import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFF8F0" },
        headerShadowVisible: false,
        headerTitleStyle: { color: "#2D2D2D" }
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="epds" options={{ title: "Mental Health Check" }} />
      <Stack.Screen name="recovery" options={{ title: "Recovery Timeline" }} />
    </Stack>
  );
}
