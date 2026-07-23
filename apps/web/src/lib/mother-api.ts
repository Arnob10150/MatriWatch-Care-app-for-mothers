"use client";

import { useMutation, useQuery, useQueryClient, type UseQueryOptions, type QueryKey } from "@tanstack/react-query";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type ApiMother = {
  id: string;
  name: string;
  age: number;
  gestational_age: number | null;
  clinic_id: string | null;
  clinic_name: string | null;
  due_date: string | null;
  current_risk_level: "low" | "mid" | "high" | null;
  last_checkin_at: string | null;
};

export type ApiCheckin = {
  id: string;
  mother_id: string;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  blood_sugar: number | null;
  body_temp: number | null;
  heart_rate: number | null;
  symptoms: string[];
  notes: string | null;
  risk_score: number | null;
  risk_level: "low" | "mid" | "high" | null;
  created_at: string;
};

export type ApiEpdsResponse = {
  id: string;
  mother_id: string;
  responses: Record<string, number>;
  total_score: number;
  ppd_flagged: boolean;
  created_at: string;
};

function hasSupabaseConfig(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function normalizeRiskLevel(level: unknown): "low" | "mid" | "high" | null {
  if (typeof level !== "string") return null;
  const normalized = level.toLowerCase();
  if (normalized === "low" || normalized === "mid" || normalized === "high") return normalized;
  return null;
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured.");
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Supabase request failed with status ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function trySupabase<T>(loader: () => Promise<T>): Promise<T | null> {
  if (!hasSupabaseConfig()) return null;
  try {
    return await loader();
  } catch {
    return null;
  }
}

function mapSupabaseMother(row: Record<string, unknown>): ApiMother {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    age: Number(row.age ?? 0),
    gestational_age: row.gestational_age == null ? null : Number(row.gestational_age),
    clinic_id: row.clinic_id == null ? null : String(row.clinic_id),
    clinic_name: null,
    due_date: row.due_date == null ? null : String(row.due_date),
    current_risk_level: null,
    last_checkin_at: null,
  };
}

function mapSupabaseCheckin(row: Record<string, unknown>): ApiCheckin {
  return {
    id: String(row.id),
    mother_id: String(row.mother_id),
    bp_systolic: row.bp_systolic == null ? null : Number(row.bp_systolic),
    bp_diastolic: row.bp_diastolic == null ? null : Number(row.bp_diastolic),
    blood_sugar: row.blood_sugar == null ? null : Number(row.blood_sugar),
    body_temp: row.body_temp == null ? null : Number(row.body_temp),
    heart_rate: row.heart_rate == null ? null : Number(row.heart_rate),
    symptoms: Array.isArray(row.symptoms) ? row.symptoms.map(String) : [],
    notes: row.notes == null ? null : String(row.notes),
    risk_score: row.risk_score == null ? null : Number(row.risk_score),
    risk_level: normalizeRiskLevel(row.risk_level),
    created_at: String(row.created_at),
  };
}

function mapSupabaseEpds(row: Record<string, unknown>): ApiEpdsResponse {
  return {
    id: String(row.id),
    mother_id: String(row.mother_id),
    responses: (row.responses && typeof row.responses === "object" ? row.responses : {}) as Record<string, number>,
    total_score: Number(row.total_score ?? 0),
    ppd_flagged: Boolean(row.ppd_flagged),
    created_at: String(row.created_at),
  };
}

async function listMothersFromSupabase(params: { clinic_id?: string; risk_level?: string } = {}) {
  const search = new URLSearchParams({
    select: "id,user_id,name,age,gestational_age,clinic_id,due_date,created_at",
    order: "created_at.desc",
  });
  if (params.clinic_id) search.set("clinic_id", `eq.${params.clinic_id}`);

  const rows = await supabaseRequest<Array<Record<string, unknown>>>(`mothers?${search.toString()}`);
  return rows.map(mapSupabaseMother);
}

async function listCheckinsFromSupabase(params: { mother_id?: string; limit?: number } = {}) {
  const search = new URLSearchParams({
    select: "id,mother_id,bp_systolic,bp_diastolic,blood_sugar,body_temp,heart_rate,symptoms,notes,risk_score,risk_level,created_at",
    order: "created_at.desc",
  });
  if (params.mother_id) search.set("mother_id", `eq.${params.mother_id}`);
  if (params.limit) search.set("limit", String(params.limit));

  const rows = await supabaseRequest<Array<Record<string, unknown>>>(`checkins?${search.toString()}`);
  return rows.map(mapSupabaseCheckin);
}

async function createCheckinInSupabase(data: CreateCheckinInput) {
  const [row] = await supabaseRequest<Array<Record<string, unknown>>>("checkins", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapSupabaseCheckin(row);
}

async function listEpdsFromSupabase(motherId: string) {
  const search = new URLSearchParams({
    select: "id,mother_id,responses,total_score,ppd_flagged,created_at",
    mother_id: `eq.${motherId}`,
    order: "created_at.desc",
  });

  const rows = await supabaseRequest<Array<Record<string, unknown>>>(`epds_responses?${search.toString()}`);
  return rows.map(mapSupabaseEpds);
}

async function submitEpdsToSupabase(data: SubmitEpdsInput) {
  const [row] = await supabaseRequest<Array<Record<string, unknown>>>("epds_responses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapSupabaseEpds(row);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail ?? body?.error;
    const message = detail ? `${path} failed (${res.status}): ${detail}` : `Request to ${path} failed with status ${res.status}`;
    // eslint-disable-next-line no-console
    console.error("[mother-api]", message, body);
    throw new Error(message);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Mothers
// ---------------------------------------------------------------------------

export function getListMothersQueryKey(params: Record<string, unknown> = {}): QueryKey {
  return ["mothers", params];
}

export function useListMothers(params: { clinic_id?: string; risk_level?: string } = {}) {
  return useQuery({
    queryKey: getListMothersQueryKey(params),
    queryFn: async () => {
      const supabaseRows = await trySupabase(() => listMothersFromSupabase(params));
      if (supabaseRows) return supabaseRows;

      const search = new URLSearchParams();
      if (params.clinic_id) search.set("clinic_id", params.clinic_id);
      if (params.risk_level) search.set("risk_level", params.risk_level);
      const qs = search.toString();
      return request<ApiMother[]>(`/mothers${qs ? `?${qs}` : ""}`);
    },
  });
}

// ---------------------------------------------------------------------------
// Checkins
// ---------------------------------------------------------------------------

export function getListCheckinsQueryKey(params: { mother_id?: string; limit?: number } = {}): QueryKey {
  return ["checkins", params];
}

export function useListCheckins(
  params: { mother_id?: string; limit?: number } = {},
  options?: { query?: Pick<UseQueryOptions<ApiCheckin[]>, "enabled" | "queryKey"> },
) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListCheckinsQueryKey(params),
    enabled: options?.query?.enabled,
    queryFn: async () => {
      const supabaseRows = await trySupabase(() => listCheckinsFromSupabase(params));
      if (supabaseRows) return supabaseRows;

      const search = new URLSearchParams();
      if (params.mother_id) search.set("mother_id", params.mother_id);
      if (params.limit) search.set("limit", String(params.limit));
      const qs = search.toString();
      return request<ApiCheckin[]>(`/checkins${qs ? `?${qs}` : ""}`);
    },
  });
}

export type CreateCheckinInput = {
  mother_id: string;
  bp_systolic: number;
  bp_diastolic: number;
  blood_sugar: number;
  body_temp: number;
  heart_rate: number;
  symptoms: string[];
  notes: string | null;
};

export function useCreateCheckin() {
  return useMutation({
    mutationFn: async ({ data }: { data: CreateCheckinInput }) => {
      const supabaseRow = await trySupabase(() => createCheckinInSupabase(data));
      if (supabaseRow) return supabaseRow;
      return request<ApiCheckin>("/checkins", { method: "POST", body: JSON.stringify(data) });
    },
  });
}

// ---------------------------------------------------------------------------
// EPDS
// ---------------------------------------------------------------------------

export function getListEpdsForMotherQueryKey(motherId: string): QueryKey {
  return ["epds", motherId];
}

export function useListEpdsForMother(
  motherId: string,
  options?: { query?: Pick<UseQueryOptions<ApiEpdsResponse[]>, "enabled" | "queryKey"> },
) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListEpdsForMotherQueryKey(motherId),
    enabled: options?.query?.enabled,
    queryFn: async () => {
      const supabaseRows = await trySupabase(() => listEpdsFromSupabase(motherId));
      if (supabaseRows) return supabaseRows;
      return request<ApiEpdsResponse[]>(`/epds/${motherId}`);
    },
  });
}

export type SubmitEpdsInput = {
  mother_id: string;
  responses: Record<string, number>;
  total_score: number;
  ppd_flagged: boolean;
};

export function useSubmitEpds() {
  return useMutation({
    mutationFn: async ({ data }: { data: SubmitEpdsInput }) => {
      const supabaseRow = await trySupabase(() => submitEpdsToSupabase(data));
      if (supabaseRow) return supabaseRow;
      return request<ApiEpdsResponse>("/epds", { method: "POST", body: JSON.stringify(data) });
    },
  });
}

export function useInvalidateMotherQueries() {
  const queryClient = useQueryClient();
  return queryClient;
}
