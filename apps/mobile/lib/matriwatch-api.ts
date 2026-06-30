import { scoreEpds, ruleBasedRisk, type CheckInInput, type EpdsAnswer, type EpdsResult, type RiskResult } from "@matriwatch/shared";
import { getActiveMotherId } from "./auth";

const apiBase = process.env.EXPO_PUBLIC_MATRIWATCH_API_URL?.replace(/\/$/, "");
const mlBase = process.env.EXPO_PUBLIC_MATRIWATCH_ML_URL?.replace(/\/$/, "");

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

export type ApiMother = {
  id: string;
  name: string;
  age: number;
  gestational_age: number | null;
  due_date: string | null;
};

/**
 * Demo-mode "login": looks up a mother record by name from the local API.
 * There is no real password check anywhere in this app yet — this just
 * resolves which mother record subsequent check-ins/EPDS submissions
 * should attach to.
 */
export async function findMotherByName(name: string): Promise<ApiMother | null> {
  if (!apiBase) return null;
  try {
    const response = await fetch(`${apiBase}/mothers`);
    if (!response.ok) return null;
    const mothers = (await response.json()) as ApiMother[];
    const needle = name.trim().toLowerCase();
    if (!needle) return null;
    return mothers.find((m) => m.name.toLowerCase().includes(needle)) ?? null;
  } catch {
    return null;
  }
}

export async function fetchMother(id: string): Promise<ApiMother | null> {
  if (!apiBase) return null;
  try {
    const response = await fetch(`${apiBase}/mothers/${id}`);
    if (!response.ok) return null;
    return (await response.json()) as ApiMother;
  } catch {
    return null;
  }
}

export async function updateMother(
  id: string,
  updates: Partial<Pick<ApiMother, "name" | "age" | "gestational_age" | "due_date">>
): Promise<ApiMother | null> {
  if (!apiBase) return null;
  try {
    const response = await fetch(`${apiBase}/mothers/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: updates.name,
        age: updates.age,
        gestational_age: updates.gestational_age,
        due_date: updates.due_date,
      }),
    });
    if (!response.ok) return null;
    return (await response.json()) as ApiMother;
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
  const motherId = await getActiveMotherId();

  if (apiBase && motherId) {
    const created = await postJson(`${apiBase}/checkins`, {
      mother_id: motherId,
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
  const motherId = await getActiveMotherId();

  if (apiBase && motherId) {
    const created = await postJson(`${apiBase}/epds`, {
      mother_id: motherId,
      responses,
      total_score: scored.result.totalScore,
      ppd_flagged: scored.result.flagged
    });
    saved = created !== null;
  }

  return { ...scored, saved };
}
