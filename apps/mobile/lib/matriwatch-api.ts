import { scoreEpds, ruleBasedRisk, type CheckInInput, type EpdsAnswer, type EpdsResult, type RiskResult } from "@matriwatch/shared";
import { getActiveMotherId } from "./auth";

const apiBase = process.env.EXPO_PUBLIC_MATRIWATCH_API_URL?.replace(/\/$/, "");
const mlBase = process.env.EXPO_PUBLIC_MATRIWATCH_ML_URL?.replace(/\/$/, "");
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

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

function hasSupabaseConfig(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey!,
      authorization: `Bearer ${supabaseAnonKey}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function trySupabase<T>(loader: () => Promise<T>): Promise<T | null> {
  if (!hasSupabaseConfig()) return null;
  try {
    return await loader();
  } catch {
    return null;
  }
}

function normalizeMother(row: Record<string, unknown>): ApiMother {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    age: Number(row.age ?? 0),
    gestational_age: row.gestational_age == null ? null : Number(row.gestational_age),
    due_date: row.due_date == null ? null : String(row.due_date),
  };
}

async function listMothersFromSupabase(): Promise<ApiMother[]> {
  const rows = await supabaseRequest<Array<Record<string, unknown>>>(
    "mothers?select=id,name,age,gestational_age,due_date&order=created_at.desc"
  );
  return rows.map(normalizeMother);
}

async function fetchMotherFromSupabase(id: string): Promise<ApiMother | null> {
  const rows = await supabaseRequest<Array<Record<string, unknown>>>(
    `mothers?select=id,name,age,gestational_age,due_date&id=eq.${id}&limit=1`
  );
  return rows[0] ? normalizeMother(rows[0]) : null;
}

async function updateMotherInSupabase(
  id: string,
  updates: Partial<Pick<ApiMother, "name" | "age" | "gestational_age" | "due_date">>
): Promise<ApiMother | null> {
  const [row] = await supabaseRequest<Array<Record<string, unknown>>>(`mothers?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return row ? normalizeMother(row) : null;
}

/**
 * Demo-mode "login": looks up a mother record by name from the local API.
 * There is no real password check anywhere in this app yet — this just
 * resolves which mother record subsequent check-ins/EPDS submissions
 * should attach to.
 */
export async function findMotherByName(name: string): Promise<ApiMother | null> {
  const needle = name.trim().toLowerCase();
  if (!needle) return null;

  const supabaseMothers = await trySupabase(listMothersFromSupabase);
  const supabaseMother = supabaseMothers?.find((m) => m.name.toLowerCase().includes(needle));
  if (supabaseMother) return supabaseMother;

  if (!apiBase) return null;
  try {
    const response = await fetch(`${apiBase}/mothers`);
    if (!response.ok) return null;
    const mothers = (await response.json()) as ApiMother[];
    return mothers.find((m) => m.name.toLowerCase().includes(needle)) ?? null;
  } catch {
    return null;
  }
}

export async function fetchMother(id: string): Promise<ApiMother | null> {
  const supabaseMother = await trySupabase(() => fetchMotherFromSupabase(id));
  if (supabaseMother) return supabaseMother;

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
  const supabaseMother = await trySupabase(() => updateMotherInSupabase(id, updates));
  if (supabaseMother) return supabaseMother;

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

  if (motherId) {
    const supabaseSaved = await trySupabase(async () => {
      const created = await supabaseRequest<Array<Record<string, unknown>>>("checkins", {
        method: "POST",
        body: JSON.stringify({
          mother_id: motherId,
          bp_systolic: input.bpSystolic,
          bp_diastolic: input.bpDiastolic,
          blood_sugar: input.bloodSugar,
          body_temp: input.bodyTemp,
          heart_rate: input.heartRate,
          symptoms: input.symptoms ?? [],
          notes: input.notes ?? null,
        }),
      });
      return created.length > 0;
    });
    saved = supabaseSaved ?? false;
  }

  if (!saved && apiBase && motherId) {
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

  if (motherId) {
    const payload = {
      mother_id: motherId,
      responses,
      total_score: scored.result.totalScore,
      ppd_flagged: scored.result.flagged
    };

    const supabaseSaved = await trySupabase(async () => {
      const created = await supabaseRequest<Array<Record<string, unknown>>>("epds_responses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return created.length > 0;
    });
    saved = supabaseSaved ?? false;
  }

  if (!saved && apiBase && motherId) {
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
