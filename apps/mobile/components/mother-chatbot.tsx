import { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { HeartPulse, MessageCircle, Send, X } from "lucide-react-native";

type ChatMessage = {
  id: number;
  role: "bot" | "mother";
  text: string;
};

const QUICK_PROMPTS = [
  "When should I call my clinic?",
  "I feel dizzy",
  "Help me with mood",
  "What should I track today?",
];

function buildReply(input: string): string {
  const text = input.toLowerCase();

  if (/(bleeding|seizure|chest pain|can't breathe|cannot breathe|suicid|harm myself|faint)/.test(text)) {
    return "This could be urgent. Please contact your clinic now or go to the nearest emergency care. If you may hurt yourself, seek immediate local emergency help and tell someone nearby.";
  }

  if (/(headache|blurred|vision|swelling|blood pressure|bp)/.test(text)) {
    return "Headache with blurred vision, swelling, or high blood pressure needs same-day review. Rest on your left side if you can, avoid heavy activity, and contact your clinic.";
  }

  if (/(dizzy|dizziness|weak|tired|nausea|vomit)/.test(text)) {
    return "Dizziness can happen, but it matters if it is strong or repeated. Drink water, sit or lie down, eat something light if you can, and tell your clinic if it continues or comes with bleeding, fever, severe headache, or pain.";
  }

  if (/(sad|mood|cry|anxious|panic|depress|sleep)/.test(text)) {
    return "Thank you for saying that. You are not alone. If these feelings are strong, getting worse, or making daily care hard, complete the Mood Check and contact your clinic. If you think about harming yourself, seek emergency help now.";
  }

  if (/(track|check|today|reading|vital)/.test(text)) {
    return "For today's check-in, record blood pressure, blood sugar, temperature, heart rate, symptoms, and any notes about pain, bleeding, fetal movement, sleep, or mood.";
  }

  return "I can help with check-ins, warning signs, mood support, and what to ask your clinic. I cannot diagnose you, so if something feels serious or unusual, please contact your care team.";
}

export function MotherChatbot() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "bot",
      text: "Hi, I am MatriWatch Care Assistant. Tell me what you are feeling or ask about check-ins, warning signs, or mood support.",
    },
  ]);
  const nextId = useRef(2);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: "mother", text: trimmed },
      { id: nextId.current++, role: "bot", text: buildReply(trimmed) },
    ]);
    setDraft("");
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
        className="absolute bottom-24 right-5 z-50 h-14 w-14 items-center justify-center rounded-full bg-primary"
        style={{
          shadowColor: "#C97C8A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 10,
        }}
        accessibilityLabel="Open care assistant"
      >
        <MessageCircle color="#FFFFFF" size={26} />
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/30"
        >
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
          <View className="max-h-[82%] rounded-t-3xl border border-border bg-surface">
            <View className="flex-row items-center justify-between rounded-t-3xl bg-primary px-5 py-4">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <HeartPulse color="#FFFFFF" size={22} />
                </View>
                <View>
                  <Text className="text-base font-bold text-white">Care Assistant</Text>
                  <Text className="text-xs text-white/75">For mothers</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
                accessibilityLabel="Close care assistant"
              >
                <X color="#FFFFFF" size={22} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={messages}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ padding: 16, gap: 10 }}
              renderItem={({ item }) => (
                <View
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 ${
                    item.role === "mother" ? "self-end bg-primary" : "self-start bg-white"
                  }`}
                >
                  <Text className={`text-sm leading-5 ${item.role === "mother" ? "text-white" : "text-ink"}`}>
                    {item.text}
                  </Text>
                </View>
              )}
            />

            <View className="border-t border-border bg-white px-4 pb-5 pt-3">
              <FlatList
                horizontal
                data={QUICK_PROMPTS}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => send(item)}
                    className="rounded-full border border-border bg-surface px-3 py-2"
                  >
                    <Text className="text-xs font-medium text-primary">{item}</Text>
                  </TouchableOpacity>
                )}
              />

              <View className="flex-row items-center gap-2">
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Type your question"
                  placeholderTextColor="#7A7A8A"
                  className="min-h-12 flex-1 rounded-xl border border-border bg-white px-3 text-base text-ink"
                />
                <TouchableOpacity
                  onPress={() => send(draft)}
                  disabled={!draft.trim()}
                  className="h-12 w-12 items-center justify-center rounded-xl bg-primary disabled:opacity-50"
                  accessibilityLabel="Send message"
                >
                  <Send color="#FFFFFF" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
