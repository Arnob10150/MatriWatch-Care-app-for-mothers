import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { ClipboardList, Clock3, Home, UserRound } from "lucide-react-native";
import { getAuth } from "@/lib/auth";
import { MotherChatbot } from "@/components/mother-chatbot";

type TabIcon = ComponentType<{ color: string; size: number }>;

const HomeIcon = Home as TabIcon;
const ClipboardListIcon = ClipboardList as TabIcon;
const Clock3Icon = Clock3 as TabIcon;
const UserRoundIcon = UserRound as TabIcon;

export default function TabsLayout() {
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    getAuth().then((auth) => {
      setAuthed(Boolean(auth));
      setCheckedAuth(true);
    });
  }, []);

  if (!checkedAuth) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#C97C8A" />
      </SafeAreaView>
    );
  }

  if (!authed) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#C97C8A",
          tabBarInactiveTintColor: "#7A7A8A",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#EDE8E3",
            minHeight: 70,
            paddingBottom: 10,
            paddingTop: 8
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" }
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} /> }} />
        <Tabs.Screen name="check-in" options={{ title: "Check-in", tabBarIcon: ({ color, size }) => <ClipboardListIcon color={color} size={size} /> }} />
        <Tabs.Screen name="history" options={{ title: "History", tabBarIcon: ({ color, size }) => <Clock3Icon color={color} size={size} /> }} />
        <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <UserRoundIcon color={color} size={size} /> }} />
      </Tabs>
      <MotherChatbot />
    </>
  );
}
