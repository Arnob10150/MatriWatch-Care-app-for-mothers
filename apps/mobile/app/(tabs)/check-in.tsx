import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ruleBasedRisk, type CheckInInput, type RiskResult } from "@matriwatch/shared";
import { RiskPill } from "@/components/risk-pill";
import { Screen } from "@/components/screen";
import { submitCheckIn } from "@/lib/matriwatch-api";

type Field = keyof Pick<CheckInInput, "bpSystolic" | "bpDiastolic" | "bloodSugar" | "bodyTemp" | "heartRate">;

const fields: { key: Field; label: string; unit: string; icon: string }[] = [
  { key: "bpSystolic", label: "BP systolic", unit: "mmHg", icon: "BP" },
  { key: "bpDiastolic", label: "BP diastolic", unit: "mmHg", icon: "BP" },
  { key: "bloodSugar", label: "Blood sugar", unit: "mmol/L", icon: "GL" },
  { key: "bodyTemp", label: "Body temperature", unit: "C", icon: "T" },
  { key: "heartRate", label: "Heart rate", unit: "bpm", icon: "HR" }
];

const symptomsList = ["headache", "dizziness", "swelling", "bleeding", "fever", "nausea", "chest pain", "blurred vision"];

export default function CheckInTabScreen() {
  const [values, setValues] = useState<Record<Field, string>>({
    bpSystolic: "118",
    bpDiastolic: "76",
    bloodSugar: "5.8",
    bodyTemp: "36.7",
    heartRate: "82"
  });
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRisk, setSubmittedRisk] = useState<RiskResult | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const checkIn = useMemo<CheckInInput>(
    () => ({
      age: 24,
      gestationalAgeWeeks: 34,
      bpSystolic: Number(values.bpSystolic),
      bpDiastolic: Number(values.bpDiastolic),
      bloodSugar: Number(values.bloodSugar),
      bodyTemp: Number(values.bodyTemp),
      heartRate: Number(values.heartRate),
      symptoms,
      notes
    }),
    [notes, symptoms, values]
  );

  const visibleRisk = submittedRisk ?? ruleBasedRisk(checkIn);

  function toggleSymptom(symptom: string) {
    setSymptoms((current) => current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitStatus(null);
    const response = await submitCheckIn(checkIn);
    setSubmittedRisk(response.result);
    setSubmitStatus(response.saved ? "Saved and sent to your clinic." : `AI scored via ${response.source}. Add Supabase env vars to persist.`);
    setIsSubmitting(false);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-surface">
      <Screen>
        <View>
          <Text className="text-2xl font-bold text-ink">Today's Check-in</Text>
          <Text className="mt-1 text-sm text-mutedText">Vitals, symptoms, and notes go to your clinic with AI risk scoring.</Text>
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <Text className="mb-3 text-lg font-semibold text-ink">Vitals</Text>
          <View className="gap-3">
            {fields.map((field) => (
              <View key={field.key} className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-blush/40">
                  <Text className="text-xs font-bold text-primary">{field.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-medium text-mutedText">{field.label}</Text>
                  <TextInput
                    value={values[field.key]}
                    onChangeText={(text) => setValues((current) => ({ ...current, [field.key]: text }))}
                    keyboardType="decimal-pad"
                    className="min-h-12 rounded-xl border border-border bg-white px-3 text-base text-ink"
                  />
                </View>
                <Text className="w-16 text-xs text-mutedText">{field.unit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <Text className="mb-3 text-lg font-semibold text-ink">Symptoms</Text>
          <View className="flex-row flex-wrap gap-2">
            {symptomsList.map((symptom) => {
              const selected = symptoms.includes(symptom);
              return (
                <TouchableOpacity
                  key={symptom}
                  onPress={() => toggleSymptom(symptom)}
                  className={`min-h-12 justify-center rounded-full border px-4 ${selected ? "border-primary bg-blush/40" : "border-border bg-white"}`}
                >
                  <Text className={selected ? "font-semibold text-primary" : "text-mutedText"}>{symptom}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <Text className="mb-2 text-lg font-semibold text-ink">Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Anything else you want to tell your clinic?"
            placeholderTextColor="#7A7A8A"
            className="min-h-24 rounded-xl border border-border bg-white px-3 py-3 text-base text-ink"
          />
        </View>

        <View className={`rounded-2xl p-5 ${visibleRisk.level === "High" ? "bg-danger" : visibleRisk.level === "Mid" ? "bg-warning" : "bg-success"}`}>
          <Text className="text-sm font-medium text-white/80">AI result</Text>
          <Text className="mt-2 text-3xl font-bold text-white">{visibleRisk.level} Risk</Text>
          <Text className="mt-2 text-sm leading-6 text-white">{visibleRisk.reasons.join(", ")}</Text>
          {submitStatus ? <Text className="mt-3 text-xs text-white/80">{submitStatus}</Text> : null}
        </View>

        <TouchableOpacity className="min-h-12 items-center justify-center rounded-xl bg-primary p-4" onPress={handleSubmit} disabled={isSubmitting}>
          <Text className="text-base font-semibold text-white">{isSubmitting ? "Scoring with AI..." : "Submit Check-in"}</Text>
        </TouchableOpacity>
      </Screen>
    </KeyboardAvoidingView>
  );
}
