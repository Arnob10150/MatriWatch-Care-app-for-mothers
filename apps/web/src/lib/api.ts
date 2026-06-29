import type { Alert, PatientSummary, RiskLevel } from "@matriwatch/shared";
import { alerts as mockAlerts, patientSummaries as mockPatients } from "@matriwatch/shared";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

function toRiskLevel(level: string | null | undefined): RiskLevel {
  if (level === "high") return "High";
  if (level === "mid") return "Mid";
  return "Low";
}

type ApiMother = {
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

type ApiCheckin = {
  id: string;
  mother_id: string;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  blood_sugar: number | null;
  body_temp: number | null;
  heart_rate: number | null;
  symptoms: string[];
  risk_score: number | null;
  risk_level: "low" | "mid" | "high" | null;
  created_at: string;
};

export type ApiAlert = {
  id: string;
  mother_id: string;
  clinic_id: string;
  alert_type: Alert["type"];
  message: string;
  is_read: boolean;
  created_at: string;
  mother_name: string | null;
};

async function getJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store", ...init });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function motherToPatientSummary(mother: ApiMother, latestCheckin?: ApiCheckin): PatientSummary {
  const level = toRiskLevel(mother.current_risk_level);
  return {
    id: mother.id,
    name: mother.name,
    age: mother.age,
    gestationalAgeWeeks: mother.gestational_age ?? 0,
    dueDate: mother.due_date ?? "",
    clinicId: mother.clinic_name ?? mother.clinic_id ?? "Unassigned",
    latestCheckIn: {
      bpSystolic: latestCheckin?.bp_systolic ?? 0,
      bpDiastolic: latestCheckin?.bp_diastolic ?? 0,
      bloodSugar: latestCheckin?.blood_sugar ?? 0,
      bodyTemp: latestCheckin?.body_temp ?? 0,
      heartRate: latestCheckin?.heart_rate ?? 0,
      symptoms: latestCheckin?.symptoms ?? [],
    },
    risk: {
      level,
      score: latestCheckin?.risk_score != null ? Math.round(latestCheckin.risk_score * 100) : 0,
      reasons: mother.current_risk_level ? [`Latest check-in classified as ${level} risk`] : ["No check-ins recorded yet"],
    },
    assignedWorker: "Unassigned",
    lastSeenAt: mother.last_checkin_at ?? mother.due_date ?? new Date().toISOString(),
  };
}

function alertToAlert(alert: ApiAlert): Alert {
  return {
    id: alert.id,
    motherId: alert.mother_id,
    clinicId: alert.clinic_id,
    type: alert.alert_type,
    message: alert.mother_name ? `${alert.message}` : alert.message,
    isRead: alert.is_read,
    createdAt: alert.created_at,
    riskLevel: alert.alert_type === "maternal_risk" ? "High" : "Mid",
  };
}

export async function getPatientSummaries(): Promise<{ patients: PatientSummary[]; live: boolean }> {
  const mothers = await getJson<ApiMother[]>("/mothers");
  if (!mothers) return { patients: mockPatients, live: false };

  const patients = await Promise.all(
    mothers.map(async (mother) => {
      const detail = await getJson<{ recent_checkins: ApiCheckin[] }>(`/mothers/${mother.id}`);
      return motherToPatientSummary(mother, detail?.recent_checkins?.[0]);
    }),
  );

  return { patients, live: true };
}

export async function getPatientById(id: string): Promise<PatientSummary | null> {
  const detail = await getJson<ApiMother & { recent_checkins: ApiCheckin[] }>(`/mothers/${id}`);
  if (!detail) return mockPatients.find((p) => p.id === id) ?? null;
  return motherToPatientSummary(detail, detail.recent_checkins?.[0]);
}

export async function getAlerts(): Promise<{ alerts: Alert[]; live: boolean }> {
  const rows = await getJson<ApiAlert[]>("/alerts");
  if (!rows) return { alerts: mockAlerts, live: false };
  return { alerts: rows.map(alertToAlert), live: true };
}

export async function getDashboardStats(): Promise<{
  stats: { total_patients: number; high_risk_count: number; alerts_today: number; checkins_today: number } | null;
  live: boolean;
}> {
  const stats = await getJson<{ total_patients: number; high_risk_count: number; alerts_today: number; checkins_today: number }>(
    "/dashboard/stats",
  );
  return { stats, live: stats !== null };
}

export async function markAlertRead(id: string): Promise<boolean> {
  const result = await getJson(`/alerts/${id}/read`, { method: "PATCH" });
  return result !== null;
}
