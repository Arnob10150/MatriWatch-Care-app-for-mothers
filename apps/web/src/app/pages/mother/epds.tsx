import { useState } from "react";
import { useLocation } from "wouter";
import { MotherLayout } from "@/components/MotherLayout";
import { useListMothers, useSubmitEpds } from "@workspace/api-client-react";
import { getAuth } from "@/lib/auth";
import { playTap, playEpdsComplete, playEpdsAnswer, playButtonPress } from "@/lib/sounds";
import { useQueryClient } from "@tanstack/react-query";
import { getListEpdsForMotherQueryKey } from "@workspace/api-client-react";

const QUESTIONS = [
  {
    text: "I have been able to laugh and see the funny side of things",
    options: ["As much as I always could", "Not quite so much now", "Definitely not so much now", "Not at all"],
    scores: [0, 1, 2, 3],
  },
  {
    text: "I have looked forward with enjoyment to things",
    options: ["As much as I always could", "Rather less than I used to", "Definitely less than I used to", "Hardly at all"],
    scores: [0, 1, 2, 3],
  },
  {
    text: "I have blamed myself unnecessarily when things went wrong",
    options: ["No, never", "Not very often", "Yes, some of the time", "Yes, most of the time"],
    scores: [0, 1, 2, 3],
  },
  {
    text: "I have been anxious or worried for no good reason",
    options: ["No, not at all", "Hardly ever", "Yes, sometimes", "Yes, very often"],
    scores: [0, 1, 2, 3],
  },
  {
    text: "I have felt scared or panicky for no very good reason",
    options: ["No, not at all", "No, not much", "Yes, sometimes", "Yes, quite a lot"],
    scores: [0, 1, 2, 3],
  },
  {
    text: "Things have been getting on top of me",
    options: [
      "No, I have been coping as well as ever",
      "No, most of the time I have coped quite well",
      "Yes, sometimes I haven't coped as well as usual",
      "Yes, most of the time I haven't been coping at all",
    ],
    scores: [0, 1, 2, 3],
  },
  {
    text: "I have been so unhappy that I have had difficulty sleeping",
    options: ["No, not at all", "Not very often", "Yes, sometimes", "Yes, most of the time"],
    scores: [0, 1, 2, 3],
  },
  {
    text: "I have felt sad or miserable",
    options: ["No, not at all", "Not very often", "Yes, quite often", "Yes, most of the time"],
    scores: [0, 1, 2, 3],
  },
  {
    text: "I have been so unhappy that I have been crying",
    options: ["No, never", "Only occasionally", "Yes, quite often", "Yes, most of the time"],
    scores: [0, 1, 2, 3],
  },
  {
    text: "The thought of harming myself has occurred to me",
    options: ["Never", "Hardly ever", "Sometimes", "Yes, quite often"],
    scores: [0, 1, 2, 3],
  },
];

export default function EpdsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const user = getAuth();

  const { data: allMothers } = useListMothers({});
  const mother = allMothers?.find(m =>
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
        setCurrent(c => c + 1);
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
      <MotherLayout title="Mood Check">
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
              out of 30
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#2D2D2D" }}>
              {ppd ? "Thank you for sharing" : "Thank you!"}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#7A7A8A" }}>
              {ppd
                ? "Your score suggests you may be experiencing some emotional difficulties. A nurse from your clinic will reach out to you soon. You are not alone."
                : "Your score is in the healthy range. Keep checking in regularly — your wellbeing matters."}
            </p>
          </div>

          {ppd && (
            <div
              className="w-full rounded-2xl p-4 border-2"
              style={{ borderColor: "#D8C4E8", backgroundColor: "#F3EDF9" }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: "#9B6DC5" }}>
                You are not alone
              </p>
              <p className="text-xs" style={{ color: "#7A7A8A" }}>
                Postpartum feelings are common and treatable. Your care team has been notified and will follow up with you.
              </p>
            </div>
          )}

          <button
            onClick={() => { playButtonPress(); setLocation("/mother/home"); }}
            className="w-full rounded-2xl py-4 text-white font-bold text-base transition-all active:scale-[0.97]"
            style={{ backgroundColor: "#C97C8A" }}
            data-testid="button-epds-done"
          >
            Back to Home
          </button>
        </div>
      </MotherLayout>
    );
  }

  return (
    <MotherLayout title="Weekly Mood Check">
      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-2" style={{ color: "#7A7A8A" }}>
            <span>Question {current + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% done</span>
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
            Over the past 7 days...
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
            onClick={() => { playTap(); setCurrent(c => c - 1); }}
            className="text-sm font-medium self-start"
            style={{ color: "#7A7A8A" }}
          >
            ← Previous question
          </button>
        )}
      </div>
    </MotherLayout>
  );
}
