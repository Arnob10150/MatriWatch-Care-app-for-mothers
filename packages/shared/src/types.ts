export type RiskLevel = "Low" | "Mid" | "High";

export type UserRole = "mother" | "clinic_staff" | "community_health_worker" | "admin";

export type CheckInInput = {
  age?: number;
  gestationalAgeWeeks?: number;
  bpSystolic: number;
  bpDiastolic: number;
  bloodSugar: number;
  bodyTemp: number;
  heartRate: number;
  symptoms?: string[];
  notes?: string;
};

export type RiskResult = {
  level: RiskLevel;
  score: number;
  reasons: string[];
  model?: string;
  matchedConditions?: string[];
};

export type EpdsAnswer = 0 | 1 | 2 | 3;

export type EpdsResult = {
  totalScore: number;
  flagged: boolean;
  severity: "Minimal" | "Possible" | "Probable" | "Urgent";
  model?: string;
};

export type Clinic = {
  id: string;
  name: string;
  location: string;
  contact: string;
};

export type Mother = {
  id: string;
  name: string;
  age: number;
  gestationalAgeWeeks: number;
  dueDate: string;
  clinicId: string;
  phone?: string;
};

export type PatientSummary = Mother & {
  latestCheckIn: CheckInInput;
  risk: RiskResult;
  epds?: EpdsResult;
  assignedWorker: string;
  lastSeenAt: string;
};

export type Alert = {
  id: string;
  motherId: string;
  clinicId: string;
  type: "maternal_risk" | "ppd" | "gdm" | "symptom" | "missed_checkin";
  message: string;
  isRead: boolean;
  createdAt: string;
  riskLevel: RiskLevel;
};
