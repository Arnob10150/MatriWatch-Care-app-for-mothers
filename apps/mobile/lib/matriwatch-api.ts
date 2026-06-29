import { scoreEpds, ruleBasedRisk, type CheckInInput, type EpdsAnswer, type EpdsResult, type RiskResult } from "@matriwatch/shared";

const apiBase = process.env.EXPO_PUBLIC_MATRIWATCH_API_URL?.replace(/\/$/, "");
const mlBase = process.env.EXPO_PUBLIC_MATRIWATCH_ML_URL?.replace(/\/$/, "");
const demoMotherId = process.env.EXPO_PUBLIC_MOTHER_ID;

type SubmitResult<T> = {
  result: T;
  saved: boolean;
  source: "ml" | "next-api" | "local";
};

async function postJson<T>(url: string, payload: unknown): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function scoreCheckIn(input: CheckInInput): Promise<SubmitResult<RiskResult>> {
  if (mlBase) {
    const result = await postJson<RiskResult>(`${mlBase}/score/checkin`, input);
    if (result) return { result, saved: false, source: "ml" };
  }

  if (apiBase) {
    const result = await postJson<RiskResult>(`${apiBase}/risk/calculate`, input);
    if (result) return { result, saved: false, source: "next-api" };
  }

  return { result: { ...ruleBasedRisk(input), model: "shared-rule-engine-v1" }, saved: false, source: "local" };
}

export async function submitCheckIn(input: CheckInInput): Promise<SubmitResult<RiskResult>> {
  const scored = await scoreCheckIn(input);
  let saved = false;

  if (apiBase && demoMotherId) {
    const created = await postJson(`${apiBase}/checkins`, {
      mother_id: demoMotherId,
      bp_systolic: input.bpSystolic,
      bp_diastolic: input.bpDiastolic,
      blood_sugar: input.bloodSugar,
      body_temp: input.bodyTemp,
      heart_rate: input.heartRate,
      symptoms: input.symptoms ?? [],
      notes: input.notes ?? null
    });
    saved = created !== null;
  }

  return { ...scored, saved };
}

export async function scoreEpdsRemote(responses: EpdsAnswer[]): Promise<SubmitResult<EpdsResult>> {
  if (mlBase) {
    const result = await postJson<EpdsResult>(`${mlBase}/score/epds`, { responses });
    if (result) return { result, saved: false, source: "ml" };
  }

  return { result: { ...scoreEpds(responses), model: "shared-epds-threshold-v1" }, saved: false, source: "local" };
}

export async function submitEpds(responses: EpdsAnswer[]): Promise<SubmitResult<EpdsResult>> {
  const scored = await scoreEpdsRemote(responses);
  let saved = false;

  if (apiBase && demoMotherId) {
    const created = await postJson(`${apiBase}/epds`, {
      mother_id: demoMotherId,
      responses,
      total_score: scored.result.totalScore,
      ppd_flagged: scored.result.flagged
    });
    saved = created !== null;
  }

  return { ...scored, saved };
}
