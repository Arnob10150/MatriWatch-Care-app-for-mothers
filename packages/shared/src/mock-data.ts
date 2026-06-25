import { scoreEpds } from "./epds";
import { ruleBasedRisk } from "./risk";
import type { Alert, CheckInInput, Clinic, PatientSummary } from "./types";

export const clinics: Clinic[] = [
  {
    id: "clinic-dhaka-01",
    name: "Dhaka North Maternal Clinic",
    location: "Mirpur, Dhaka",
    contact: "+8801700000001"
  },
  {
    id: "clinic-sylhet-01",
    name: "Sylhet Community Health Post",
    location: "Beanibazar, Sylhet",
    contact: "+8801700000002"
  }
];

export const demoCheckIns: CheckInInput[] = [
  {
    age: 24,
    gestationalAgeWeeks: 34,
    bpSystolic: 118,
    bpDiastolic: 76,
    bloodSugar: 106,
    bodyTemp: 36.7,
    heartRate: 82,
    symptoms: ["poor sleep"]
  },
  {
    age: 31,
    gestationalAgeWeeks: 38,
    bpSystolic: 146,
    bpDiastolic: 94,
    bloodSugar: 157,
    bodyTemp: 37.4,
    heartRate: 108,
    symptoms: ["swelling", "dizziness"]
  },
  {
    age: 19,
    gestationalAgeWeeks: 29,
    bpSystolic: 166,
    bpDiastolic: 112,
    bloodSugar: 214,
    bodyTemp: 38.2,
    heartRate: 124,
    symptoms: ["severe headache", "blurred vision"]
  }
];

export const patientSummaries: PatientSummary[] = [
  {
    id: "m-1001",
    name: "Nusrat Akter",
    age: 24,
    gestationalAgeWeeks: 34,
    dueDate: "2026-06-18",
    clinicId: "clinic-dhaka-01",
    assignedWorker: "CHW Farzana",
    lastSeenAt: "2026-05-09T16:40:00+06:00",
    latestCheckIn: demoCheckIns[0],
    risk: ruleBasedRisk(demoCheckIns[0]),
    epds: scoreEpds([0, 0, 1, 1, 1, 0, 1, 1, 0, 0])
  },
  {
    id: "m-1002",
    name: "Mst. Rina Begum",
    age: 31,
    gestationalAgeWeeks: 38,
    dueDate: "2026-05-26",
    clinicId: "clinic-dhaka-01",
    assignedWorker: "CHW Sultana",
    lastSeenAt: "2026-05-10T08:15:00+06:00",
    latestCheckIn: demoCheckIns[1],
    risk: ruleBasedRisk(demoCheckIns[1]),
    epds: scoreEpds([1, 1, 2, 2, 1, 1, 1, 2, 1, 0])
  },
  {
    id: "m-1003",
    name: "Ayesha Khatun",
    age: 19,
    gestationalAgeWeeks: 29,
    dueDate: "2026-07-21",
    clinicId: "clinic-sylhet-01",
    assignedWorker: "CHW Maliha",
    lastSeenAt: "2026-05-10T09:05:00+06:00",
    latestCheckIn: demoCheckIns[2],
    risk: ruleBasedRisk(demoCheckIns[2]),
    epds: scoreEpds([2, 2, 3, 2, 3, 2, 2, 3, 2, 1])
  }
];

export const alerts: Alert[] = patientSummaries
  .filter((patient) => patient.risk.level === "High" || patient.epds?.flagged)
  .map((patient, index) => ({
    id: `alert-${index + 1}`,
    motherId: patient.id,
    clinicId: patient.clinicId,
    type: patient.risk.level === "High" ? "maternal_risk" : "ppd",
    message:
      patient.risk.level === "High"
        ? `${patient.name} needs urgent vitals review`
        : `${patient.name} has an EPDS flag`,
    isRead: false,
    createdAt: patient.lastSeenAt,
    riskLevel: patient.risk.level
  }));

