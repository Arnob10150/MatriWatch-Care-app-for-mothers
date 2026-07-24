"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MotherLayout } from "@/components/MotherLayout";
import { useListMothers, useSubmitEpds } from "@/lib/mother-api";
import { getAuth } from "@/lib/auth";
import { playTap, playEpdsComplete, playEpdsAnswer, playButtonPress } from "@/lib/sounds";
import { useQueryClient } from "@tanstack/react-query";
import { getListEpdsForMotherQueryKey } from "@/lib/mother-api";
import { useLanguage } from "@/components/LanguageProvider";

const QUESTION_KEYS = [
  "epds.q1", "epds.q2", "epds.q3", "epds.q4", "epds.q5",
  "epds.q6", "epds.q7", "epds.q8", "epds.q9", "epds.q10",
] as const;

function useQuestions() {
  const { t } = useLanguage();
  return QUESTION_KEYS.map((key) => ({
    text: t(`${key}.text`),
    options: [t(`${key}.o0`), t(`${key}.o1`), t(`${key}.o2`), t(`${key}.o3`)],
    scores: [0, 1, 2, 3],
  }));
}

export default function EpdsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = getAuth();
  const { t } = useLanguage();
  const QUESTIONS = useQuestions();

  const { data: allMothers } = useListMothers({});
  const mother = allMothers?.find((m) =>
    m.name.toLowerCase().includes(user?.name?.split(" ")[0]?.toLowerCase() ?? "__no_match__")
  ) ?? allMothers?.[0];

  const submitEpds = useSubmitEpds();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(-1));
  const [done, setDone] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [ppd, setPpd] = useState(false);
  const [animating, setAnimating] = useState(false);

  function selectAnswer(score: number) {
    playEpdsAnswer();
    const newAnswers = [...answers];
    newAnswers[current] = score;
    setAnswers(newAnswers);
    setAnimating(true);

    setTimeout(() => {
      setAnimating(false);
      if (current < QUESTIONS.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        submitAnswers(newAnswers);
      }
    }, 320);
  }

  function submitAnswers(finalAnswers: number[]) {
    const total = finalAnswers.reduce((s, a) => s + Math.max(0, a), 0);
    const flagged = total >= 10;
    setTotalScore(total);
    setPpd(flagged);

    if (!mother) { setDone(true); playEpdsComplete(); return; }

    const responses: Record<string, number> = {};
    finalAnswers.forEach((a, i) => { responses[`q${i + 1}`] = a; });

    submitEpds.mutate(
      { data: { mother_id: mother.id, responses, total_score: total, ppd_flagged: flagged } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEpdsForMotherQueryKey(mother.id) });
          playEpdsComplete();
          setDone(true);
        },
        onError: () => { playEpdsComplete(); setDone(true); },
      }
    );
  }

  const q = QUESTIONS[current];
  const progress = ((current + (animating ? 1 : 0)) / QUESTIONS.length) * 100;

  if (done) {
    return (
      <MotherLayout title={t("nav.moodCheck")}>
        <div className="px-4 py-10 flex flex-col items-center text-center gap-6">
          <div
            className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
            style={{
              backgroundColor: ppd ? "#FCE8EE" : "#F0F7ED",
              border: `3px solid ${ppd ? "#C94F6D" : "#87A878"}`,
            }}
          >
            <span className="text-4xl font-black" style={{ color: ppd ? "#C94F6D" : "#87A878" }}>
              {totalScore}
            </span>
            <span className="text-xs font-medium" style={{ color: ppd ? "#C94F6D" : "#87A878" }}>
              {t("epds.outOf30")}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#2D2D2D" }}>
              {ppd ? t("epds.thankYouShared") : t("epds.thankYou")}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#7A7A8A" }}>
              {ppd ? t("epds.flaggedMessage") : t("epds.healthyMessage")}
            </p>
          </div>

          {ppd && (
            <div
              className="w-full rounded-2xl p-4 border-2"
              style={{ borderColor: "#D8C4E8", backgroundColor: "#F3EDF9" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "#9B6DC5" }}>
                {t("epds.notAlone")}
              </p>
              <p className="text-xs" style={{ color: "#7A7A8A" }}>
                {t("epds.notAloneMsg")}
              </p>
            </div>
          )}

          <button
            onClick={() => { playButtonPress(); router.push("/mother"); }}
            className="w-full rounded-2xl py-4 text-white font-bold text-base transition-all active:scale-[0.97]"
            style={{ backgroundColor: "#C97C8A" }}
            data-testid="button-epds-done"
          >
            {t("epds.backToHome")}
          </button>
        </div>
      </MotherLayout>
    );
  }

  return (
    <MotherLayout title={t("motherHome.weeklyMoodCheck")}>
      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-2" style={{ color: "#7A7A8A" }}>
            <span>{t("epds.questionOf", { current: current + 1, total: QUESTIONS.length })}</span>
            <span>{t("epds.percentDone", { percent: Math.round(progress) })}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EDE8E3" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: "#D8C4E8" }}
            />
          </div>
        </div>

        {/* Question card */}
        <div
          className="rounded-2xl p-5 transition-opacity duration-200"
          style={{
            backgroundColor: "#F3EDF9",
            opacity: animating ? 0 : 1,
          }}
        >
          <p className="text-xs font-medium mb-2" style={{ color: "#9B6DC5" }}>
            {t("epds.pastWeek")}
          </p>
          <p className="text-base font-semibold leading-snug" style={{ color: "#2D2D2D" }}>
            {q.text}
          </p>
        </div>

        {/* Answer options */}
        <div
          className="space-y-2.5 transition-opacity duration-200"
          style={{ opacity: animating ? 0 : 1 }}
        >
          {q.options.map((opt, i) => {
            const selected = answers[current] === q.scores[i];
            return (
              <button
                key={i}
                onClick={() => selectAnswer(q.scores[i])}
                className="w-full text-left rounded-2xl px-4 py-3.5 text-sm font-medium border-2 transition-all active:scale-[0.98]"
                style={{
                  borderColor: selected ? "#D8C4E8" : "#EDE8E3",
                  backgroundColor: selected ? "#F3EDF9" : "#FFFFFF",
                  color: selected ? "#9B6DC5" : "#2D2D2D",
                }}
                data-testid={`epds-option-${i}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: selected ? "#9B6DC5" : "#AEAEB8",
                      backgroundColor: selected ? "#9B6DC5" : "transparent",
                    }}
                  >
                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  {opt}
                </div>
              </button>
            );
          })}
        </div>

        {/* Back button */}
        {current > 0 && (
          <button
            onClick={() => { playTap(); setCurrent((c) => c - 1); }}
            className="text-sm font-medium self-start"
            style={{ color: "#7A7A8A" }}
          >
            {t("epds.previousQuestion")}
          </button>
        )}
      </div>
    </MotherLayout>
  );
}
