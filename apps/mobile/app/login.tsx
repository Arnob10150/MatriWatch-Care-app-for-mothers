import { useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Heart } from "lucide-react-native";
import { setAuth } from "@/lib/auth";
import { findMotherByName } from "@/lib/matriwatch-api";

export default function LoginScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const mother = await findMotherByName(name);
      if (!mother) {
        setError("No record found for that name. Please check with your clinic, or contact them to be registered.");
        setLoading(false);
        return;
      }
      await setAuth({ motherId: mother.id, name: mother.name, email: email.trim() });
      router.replace("/(tabs)");
    } catch {
      setError("Couldn't sign in right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <View className="items-center gap-2">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Heart color="#C97C8A" fill="#C97C8A" size={28} />
          </View>
          <Text className="text-2xl font-bold text-ink">MatriWatch</Text>
          <Text className="text-sm text-mutedText">Caring for every mother, every day</Text>
        </View>

        <View className="w-full gap-3 rounded-2xl border border-border bg-card p-5">
          <View>
            <Text className="mb-1 text-xs font-medium text-ink">Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Fatima Rahman"
              autoCapitalize="words"
              className="min-h-12 rounded-xl border border-border bg-white px-3.5 text-ink"
            />
          </View>

          <View>
            <Text className="mb-1 text-xs font-medium text-ink">Email address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="fatima@matriwatch.app"
              autoCapitalize="none"
              keyboardType="email-address"
              className="min-h-12 rounded-xl border border-border bg-white px-3.5 text-ink"
            />
          </View>

          {error ? <Text className="text-xs text-danger">{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="min-h-12 items-center justify-center rounded-xl bg-primary p-4"
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-base font-semibold text-white">Sign in</Text>}
          </TouchableOpacity>
        </View>

        <Text className="text-center text-xs text-mutedText">
          Demo mode — enter your name exactly as registered by your clinic.
        </Text>
      </View>
    </SafeAreaView>
  );
}
