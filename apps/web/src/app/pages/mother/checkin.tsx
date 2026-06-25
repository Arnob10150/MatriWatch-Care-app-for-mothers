import { useState } from "react";
import { useLocation } from "wouter";
import { MotherLayout } from "@/components/MotherLayout";
import { useListMothers, useCreateCheckin } from "@workspace/api-client-react";
import { getAuth } from "@/lib/auth";
import { playForRisk, playTap, playButtonPress, playFormSubmit, playError } from "@/lib/sounds";
import { useQueryClient } from "@tanstack/react-query";
import { getListMothersQueryKey, getListCheckinsQueryKey } from "@workspace/api-client-react";

const SYMPTOMS = [
  "Headache", "Dizziness", "Swollen feet", "Blurred vision",
  "Nausea", "Chest pain", "Shortness of breath", "Fever",
  "Abdominal pain", "Decreased fetal movement",
];

type Step = "vitals" | "symptoms" | "result";

const RISK_RESULT = {
  low: {
    bg: "#F0F7ED",
    border: "#C6DFC0",
    titleColor: "#87A878",
    title: "You're doing well",
    message: "Your readings are in the healthy range. Keep up the great work and continue checking in daily.",
    icon: "✓",
    iconBg: "#87A878",
  },
  mid: {
    bg: "#FDF3E7",
    border: "#F0CCA4",
    titleColor: "#D4914A",
    title: "Keep a close watch",
    message: "Some of your readings are slightly elevated. Monitor how you feel and contact your clinic if symptoms worsen.",
    icon: "!",
    iconBg: "#D4914A",
  },
  high: {
    bg: "#FCE8EE",
    border: "#F0ABBE",
    titleColor: "#C94F6D",
    title: "Please contact your clinic today",
    message: "Your readings show warning signs that need medical attention. Call your clinic or visit in person as soon as possible.",
    icon: "!",
    iconBg: "#C94F6D",
  },
};

export default function CheckinPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const user = getAuth();

  const { data: allMothers } = useListMothers({});
  const mother = allMothers?.find(m =>
    m.name.toLowerCase().includes(user?.name?.split(" ")[0]?.toLowerCase() ?? "__no_match__")
  ) ?? allMothers?.[0];

  const createCheckin = useCreateCheckin();

  const [step, setStep] = useState<Step>("vitals");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [resultLevel, setResultLevel] = useState<string>("low");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [vitals, setVitals] = useState({
    bp_systolic: "",
    bp_diastolic: "",
    blood_sugar: "",
    body_temp: "",
    heart_rate: "",
  });

  function setVital(key: keyof typeof vitals, val: string) {
    setVitals(v => ({ ...v, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  function validateVitals() {
    const e: Record<string, string> = {};
    if (!vitals.bp_systolic || isNaN(+vitals.bp_systolic)) e.bp_systolic = "Required";
    if (!vitals.bp_diastolic || isNaN(+vitals.bp_diastolic)) e.bp_diastolic = "Required";
    if (!vitals.blood_sugar || isNaN(+vitals.blood_sugar)) e.blood_sugar = "Required";
    if (!vitals.body_temp || isNaN(+vitals.body_temp)) e.body_temp = "Required";
    if (!vitals.heart_rate || isNaN(+vitals.heart_rate)) e.heart_rate = "Required";
    setErrors(e);
    if (Object.keys(e).length > 0) playError();
    return Object.keys(e).length === 0;
  }

  function toggleSymptom(s: string) {
    playTap();
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit() {
    if (!mother) return;
    setSubmitting(true);
    playFormSubmit();
    createCheckin.mutate(
      {
        data: {
          mother_id: mother.id,
          bp_systolic: +vitals.bp_systolic,
          bp_diastolic: +vitals.bp_diastolic,
          blood_sugar: +vitals.blood_sugar,
          body_temp: +vitals.body_temp,
          heart_rate: +vitals.heart_rate,
          symptoms: selectedSymptoms,
          notes: null,
        },
      },
      {
        onSuccess: (data) => {
          const level = data.risk_level ?? "low";
          setResultLevel(level);
          queryClient.invalidateQueries({ queryKey: getListMothersQueryKey({}) });
          queryClient.invalidateQueries({ queryKey: getListCheckinsQueryKey({ mother_id: mother.id }) });
          setTimeout(() => playForRisk(level), 300);
          setStep("result");
          setSubmitting(false);
        },
        onError: () => { playError(); setSubmitting(false); },
      }
    );
  }

  const result = RISK_RESULT[resultLevel as keyof typeof RISK_RESULT] ?? RISK_RESULT.low;

  return (
    <MotherLayout title="Daily Check-In">
      <div className="px-4 py-5">

        {/* Steps indicator */}
        {step !== "result" && (
          <div className="flex items-center gap-2 mb-5">
            {(["vitals", "symptoms"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: step === s ? "#C97C8A" : s === "vitals" && step === "symptoms" ? "#87A878" : "#EDE8E3",
                    color: step === s || (s === "vitals" && step === "symptoms") ? "white" : "#7A7A8A",
                  }}
                >
                  {s === "vitals" && step === "symptoms" ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium capitalize" style={{ color: step === s ? "#2D2D2D" : "#AEAEB8" }}>
                  {s === "vitals" ? "Vitals" : "Symptoms"}
                </span>
                {i < 1 && <div className="h-px w-6" style={{ backgroundColor: step === "symptoms" ? "#87A878" : "#EDE8E3" }} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Vitals */}
        {step === "vitals" && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "#7A7A8A" }}>
              Enter your readings from your home kit or nearest pharmacy.
            </p>

            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A7A8A" }}>
                Blood Pressure
              </p>
              <div className="grid grid-cols-2 gap-3">
                <VitalInput label="Systolic (top)" placeholder="e.g. 120" value={vitals.bp_systolic} onChange={v => setVital("bp_systolic", v)} unit="mmHg" error={errors.bp_systolic} inputMode="numeric" />
                <VitalInput label="Diastolic (bottom)" placeholder="e.g. 80" value={vitals.bp_diastolic} onChange={v => setVital("bp_diastolic", v)} unit="mmHg" error={errors.bp_diastolic} inputMode="numeric" />
              </div>
            </div>

            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 4px rgba(201,124,138,0.08)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#7A7A8A" }}>
                Other Readings
              </p>
              <VitalInput label="Blood Sugar" placeholder="e.g. 5.5" value={vitals.blood_sugar} onChange={v => setVital("blood_sugar", v)} unit="mmol/L" error={errors.blood_sugar} inputMode="decimal" />
              <VitalInput label="Body Temperature" placeholder="e.g. 36.8" value={vitals.body_temp} onChange={v => setVital("body_temp", v)} unit="°C" error={errors.body_temp} inputMode="decimal" />
              <VitalInput label="Heart Rate" placeholder="e.g. 78" value={vitals.heart_rate} onChange={v => setVital("heart_rate", v)} unit="bpm" error={errors.heart_rate} inputMode="numeric" />
            </div>

            <button
              onClick={() => {
                if (validateVitals()) {
                  playButtonPress();
                  setStep("symptoms");
                }
              }}
              className="w-full rounded-2xl py-4 text-white font-bold text-base mt-1 transition-all active:scale-[0.97]"
              style={{ backgroundColor: "#C97C8A" }}
            >
              Next — Symptoms
            </button>
          </div>
        )}

        {/* STEP 2: Symptoms */}
        {step === "symptoms" && (
          <div className="space-y-4">
            <div>
              <p className="text-base font-semibold mb-1" style={{ color: "#2D2D2D" }}>
                Any symptoms today?
              </p>
              <p className="text-sm" style={{ color: "#7A7A8A" }}>
                Tap all that apply. It's okay to select none.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map(s => {
                const selected = selectedSymptoms.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className="px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all active:scale-95"
                    style={{
                      borderColor: selected ? "#C97C8A" : "#EDE8E3",
                      backgroundColor: selected ? "#FCE8EE" : "#FFFFFF",
                      color: selected ? "#C94F6D" : "#7A7A8A",
                    }}
                    data-testid={`symptom-${s.toLowerCase().replace(/ /g, "-")}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { playTap(); setStep("vitals"); }}
                className="flex-1 rounded-2xl py-4 font-semibold text-sm border-2 transition-all"
                style={{ borderColor: "#EDE8E3", color: "#7A7A8A", backgroundColor: "#FFFFFF" }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !mother}
                className="flex-[2] rounded-2xl py-4 text-white font-bold text-base transition-all active:scale-[0.97] disabled:opacity-60"
                style={{ backgroundColor: "#C97C8A" }}
                data-testid="button-submit-checkin"
              >
                {submitting ? "Submitting..." : "Submit Check-In"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Result */}
        {step === "result" && (
          <div className="flex flex-col items-center text-center gap-5 py-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black"
              style={{ backgroundColor: result.iconBg, color: "white" }}
            >
              {result.icon}
            </div>

            <div
              className="w-full rounded-2xl p-6 border"
              style={{ backgroundColor: result.bg, borderColor: result.border }}
            >
              <h2 className="text-2xl font-black mb-2" style={{ color: result.titleColor }}>
                {result.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#2D2D2D" }}>
                {result.message}
              </p>
            </div>

            {resultLevel === "high" && (
              <div
                className="w-full rounded-2xl p-4 border-2"
                style={{ borderColor: "#C94F6D", backgroundColor: "#FCE8EE" }}
              >
                <p className="font-bold text-sm mb-1" style={{ color: "#C94F6D" }}>
                  What to do right now
                </p>
                <p className="text-sm" style={{ color: "#2D2D2D" }}>
                  Show this screen to your nearest clinic or community health worker. If you feel very unwell, go to the hospital.
                </p>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => { playTap(); setLocation("/mother/history"); }}
                className="flex-1 rounded-2xl py-4 font-semibold text-sm border-2 transition-all"
                style={{ borderColor: "#EDE8E3", color: "#7A7A8A", backgroundColor: "#FFFFFF" }}
              >
                View History
              </button>
              <button
                onClick={() => { playButtonPress(); setLocation("/mother/home"); }}
                className="flex-1 rounded-2xl py-4 text-white font-bold text-sm transition-all active:scale-95"
                style={{ backgroundColor: "#C97C8A" }}
                data-testid="button-done"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </MotherLayout>
  );
}

function VitalInput({
  label, placeholder, value, onChange, unit, error, inputMode,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  error?: string;
  inputMode: "numeric" | "decimal";
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "#2D2D2D" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode={inputMode}
          pattern="[0-9]*[.]?[0-9]*"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl px-3.5 py-3 text-sm border outline-none transition-all pr-14"
          style={{
            borderColor: error ? "#C94F6D" : "#EDE8E3",
            color: "#2D2D2D",
            backgroundColor: "#FAFAFA",
            fontSize: "16px",
          }}
          onFocus={e => (e.target.style.borderColor = "#F9B8C4")}
          onBlur={e => (e.target.style.borderColor = error ? "#C94F6D" : "#EDE8E3")}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: "#AEAEB8" }}
        >
          {unit}
        </span>
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#C94F6D" }}>{error}</p>}
    </div>
  );
}
