import type { CheckInInput, RiskLevel, RiskResult } from "./types";
import { matchConditions } from "./conditions";

const HIGH_RISK_SYMPTOMS = new Set([
  "severe headache",
  "blurred vision",
  "heavy bleeding",
  "seizure",
  "chest pain",
  "shortness of breath",
  "reduced fetal movement",
  "suicidal thoughts"
]);

const MID_RISK_SYMPTOMS = new Set([
  "dizziness",
  "swelling",
  "fever",
  "vomiting",
  "abdominal pain",
  "sad mood",
  "poor sleep"
]);

export function classifyRiskScore(score: number): RiskLevel {
  if (score >= 70) return "High";
  if (score >= 35) return "Mid";
  return "Low";
}

export function ruleBasedRisk(input: CheckInInput): RiskResult {
  let score = 0;
  const reasons: string[] = [];

  if (input.bpSystolic >= 160 || input.bpDiastolic >= 110) {
    score += 45;
    reasons.push("Severe hypertension range blood pressure");
  } else if (input.bpSystolic >= 140 || input.bpDiastolic >= 90) {
    score += 25;
    reasons.push("Elevated blood pressure");
  }

  if (input.bloodSugar >= 200) {
    score += 30;
    reasons.push("Very high blood sugar");
  } else if (input.bloodSugar >= 140) {
    score += 18;
    reasons.push("Elevated blood sugar");
  }

  if (input.bodyTemp >= 38) {
    score += 18;
    reasons.push("Fever detected");
  }

  if (input.heartRate >= 120) {
    score += 20;
    reasons.push("Very high heart rate");
  } else if (input.heartRate >= 105) {
    score += 10;
    reasons.push("Elevated heart rate");
  }

  if (typeof input.age === "number" && (input.age < 18 || input.age > 35)) {
    score += 8;
    reasons.push("Age is outside the lower-risk pregnancy range");
  }

  for (const symptom of input.symptoms ?? []) {
    const normalized = symptom.trim().toLowerCase();
    if (HIGH_RISK_SYMPTOMS.has(normalized)) {
      score += 30;
      reasons.push(`High-risk symptom reported: ${symptom}`);
    } else if (MID_RISK_SYMPTOMS.has(normalized)) {
      score += 12;
      reasons.push(`Symptom needs follow-up: ${symptom}`);
    }
  }

  const matchedConditions = matchConditions(input.symptoms ?? [], input.notes);
  for (const condition of matchedConditions) {
    score += condition.severity === "urgent" ? 25 : 10;
    reasons.push(`Possible match: ${condition.name} — ${condition.note}`);
  }

  const boundedScore = Math.min(100, Math.max(0, score));

  return {
    score: boundedScore,
    level: classifyRiskScore(boundedScore),
    reasons: reasons.length > 0 ? reasons : ["Vitals are within configured MVP thresholds"],
    matchedConditions: matchedConditions.map((c) => c.name)
  };
}

