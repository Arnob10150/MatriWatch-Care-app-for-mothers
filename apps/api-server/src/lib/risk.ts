export interface RiskInput {
  bp_systolic: number;
  bp_diastolic: number;
  blood_sugar: number;
  body_temp: number;
  heart_rate: number;
}

export interface RiskResult {
  risk_level: "low" | "mid" | "high";
  risk_score: number;
  triggered_by: string[];
}

export function calculateRisk(input: RiskInput): RiskResult {
  const triggered: string[] = [];

  // High risk thresholds
  if (input.bp_systolic > 140) triggered.push("bp_systolic_high");
  if (input.bp_diastolic > 90) triggered.push("bp_diastolic_high");
  if (input.blood_sugar > 11) triggered.push("blood_sugar_very_high");
  if (input.body_temp > 38.5) triggered.push("body_temp_very_high");

  if (triggered.length > 0) {
    return { risk_level: "high", risk_score: Math.min(1, 0.85 + triggered.length * 0.05), triggered_by: triggered };
  }

  const midTriggered: string[] = [];
  if (input.bp_systolic > 130) midTriggered.push("bp_systolic_elevated");
  if (input.bp_diastolic > 85) midTriggered.push("bp_diastolic_elevated");
  if (input.blood_sugar > 7.8) midTriggered.push("blood_sugar_elevated");

  if (midTriggered.length > 0) {
    return { risk_level: "mid", risk_score: Math.min(1, 0.4 + midTriggered.length * 0.1), triggered_by: midTriggered };
  }

  return { risk_level: "low", risk_score: 0.1, triggered_by: [] };
}
