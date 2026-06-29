"use client";

import { useMutation, useQuery, useQueryClient, type UseQueryOptions, type QueryKey } from "@tanstack/react-query";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

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
    queryFn: () => {
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
    queryFn: () => {
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
    mutationFn: ({ data }: { data: CreateCheckinInput }) =>
      request<ApiCheckin>("/checkins", { method: "POST", body: JSON.stringify(data) }),
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
    queryFn: () => request<ApiEpdsResponse[]>(`/epds/${motherId}`),
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
    mutationFn: ({ data }: { data: SubmitEpdsInput }) =>
      request<ApiEpdsResponse>("/epds", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useInvalidateMotherQueries() {
  const queryClient = useQueryClient();
  return queryClient;
}
