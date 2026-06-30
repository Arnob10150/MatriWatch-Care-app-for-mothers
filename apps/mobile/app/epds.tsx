import { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { EPDS_QUESTIONS, scoreEpds, type EpdsAnswer, type EpdsResult } from "@matriwatch/shared";
import { Screen } from "@/components/screen";
import { submitEpds } from "@/lib/matriwatch-api";

const options: EpdsAnswer[] = [0, 1, 2, 3];

export default function EpdsScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<EpdsAnswer[]>(Array(10).fill(0) as EpdsAnswer[]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<EpdsResult | null>(null);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const result = useMemo(() => scoreEpds(responses), [responses]);
  const visibleResult = submittedResult ?? result;
  const complete = questionIndex >= EPDS_QUESTIONS.length;
  const progress = Math.min(((questionIndex + 1) / EPDS_QUESTIONS.length) * 100, 100);

  function setAnswer(value: EpdsAnswer) {
    setResponses((current) => current.map((answer, index) => (index === questionIndex ? value : answer)));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitStatus(null);
    const response = await submitEpds(responses);
    setSubmittedResult(response.result);
    setSubmitStatus(response.saved ? "Saved and shared with your clinic." : `AI scored via ${response.source}. Set EXPO_PUBLIC_MOTHER_ID and EXPO_PUBLIC_MATRIWATCH_API_URL to save this to your clinic record.`);
    setIsSubmitting(false);
  }

  return (
    <Screen>
      <View className="rounded-2xl bg-lavender p-5">
        <Text className="text-2xl font-bold text-ink">Mental Health Check</Text>
        <Text className="mt-1 text-sm text-ink/70">EPDS weekly screening</Text>
        <View className="mt-4 h-2 overflow-hidden rounded-full bg-white/60">
          <View className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </View>
      </View>

      {!complete ? (
        <View className="rounded-2xl border border-border bg-card p-5">
          <Text className="text-sm font-semibold text-primary">Question {questionIndex + 1} of {EPDS_QUESTIONS.length}</Text>
          <Text className="mt-3 text-lg font-semibold leading-7 text-ink">{EPDS_QUESTIONS[questionIndex]}</Text>

          <View className="mt-5 gap-3">
            {options.map((value) => {
              const selected = responses[questionIndex] === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => setAnswer(value)}
                  className={`min-h-12 justify-center rounded-full border px-4 ${selected ? "border-primary bg-lavender/60" : "border-border bg-white"}`}
                >
                  <Text className={selected ? "font-semibold text-primary" : "text-ink"}>{value}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            className="mt-6 min-h-12 items-center justify-center rounded-xl bg-primary p-4"
            onPress={() => setQuestionIndex((current) => current + 1)}
          >
            <Text className="font-semibold text-white">{questionIndex === EPDS_QUESTIONS.length - 1 ? "See Result" : "Next"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="rounded-2xl border border-border bg-card p-5">
          <Text className="text-sm text-mutedText">Score out of 30</Text>
          <Text className="mt-1 text-4xl font-bold text-ink">{visibleResult.totalScore}</Text>
          <View className={`mt-4 rounded-2xl p-4 ${visibleResult.flagged ? "bg-highBg" : "bg-lowBg"}`}>
            <Text className={`text-lg font-bold ${visibleResult.flagged ? "text-danger" : "text-success"}`}>
              {visibleResult.flagged ? "Clinic follow-up recommended" : "No PPD flag today"}
            </Text>
            <Text className="mt-2 text-sm leading-6 text-ink">
              {visibleResult.flagged
                ? "Thank you for answering honestly. Your clinic will review this and support you."
                : "You are not alone. Keep checking in weekly so your clinic can support you early."}
            </Text>
          </View>
          {submitStatus ? <Text className="mt-3 text-sm text-mutedText">{submitStatus}</Text> : null}
          <TouchableOpacity className="mt-5 min-h-12 items-center justify-center rounded-xl bg-primary p-4" onPress={handleSubmit} disabled={isSubmitting}>
            <Text className="font-semibold text-white">{isSubmitting ? "Submitting..." : "Submit EPDS Screening"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
}
