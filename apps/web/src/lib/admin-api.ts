const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

export type ApiClinic = {
  id: string;
  name: string;
  location: string | null;
  contact: string | null;
  created_at: string;
};

export type ApiStaff = {
  id: string;
  user_id: string | null;
  name: string;
  role: string | null;
  clinic_id: string | null;
  clinic_name: string | null;
  created_at: string;
};

export type ApiMotherRecord = {
  id: string;
  name: string;
  age: number;
  gestational_age: number | null;
  clinic_id: string | null;
  clinic_name: string | null;
  due_date: string | null;
  created_at: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "content-type": "application/json" },
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail ?? body?.error;
    const message = detail ? `${path} failed (${res.status}): ${detail}` : `Request to ${path} failed with status ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function getClinics(): Promise<ApiClinic[]> {
  return request<ApiClinic[]>("/clinics");
}

export function createClinic(input: { name: string; location?: string; contact?: string }): Promise<ApiClinic> {
  return request<ApiClinic>("/clinics", { method: "POST", body: JSON.stringify(input) });
}

export function getStaff(): Promise<ApiStaff[]> {
  return request<ApiStaff[]>("/staff");
}

export function createStaff(input: { name: string; role: "doctor" | "nurse"; clinic_id?: string | null }): Promise<ApiStaff> {
  return request<ApiStaff>("/staff", { method: "POST", body: JSON.stringify(input) });
}

export function deleteStaff(id: string): Promise<void> {
  return request<void>(`/staff/${id}`, { method: "DELETE" });
}

export function getMotherRecords(): Promise<ApiMotherRecord[]> {
  return request<ApiMotherRecord[]>("/mothers");
}

export function createMotherRecord(input: {
  name: string;
  age: number;
  gestational_age?: number | null;
  clinic_id?: string | null;
  due_date?: string | null;
}): Promise<ApiMotherRecord> {
  return request<ApiMotherRecord>("/mothers", { method: "POST", body: JSON.stringify(input) });
}

export function deleteMotherRecord(id: string): Promise<void> {
  return request<void>(`/mothers/${id}`, { method: "DELETE" });
}
