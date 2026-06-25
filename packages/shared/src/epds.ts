import type { EpdsAnswer, EpdsResult } from "./types";

export const EPDS_QUESTIONS = [
  "I have been able to laugh and see the funny side of things.",
  "I have looked forward with enjoyment to things.",
  "I have blamed myself unnecessarily when things went wrong.",
  "I have been anxious or worried for no good reason.",
  "I have felt scared or panicky for no very good reason.",
  "Things have been getting on top of me.",
  "I have been so unhappy that I have had difficulty sleeping.",
  "I have felt sad or miserable.",
  "I have been so unhappy that I have been crying.",
  "The thought of harming myself has occurred to me."
] as const;

export function scoreEpds(responses: EpdsAnswer[]): EpdsResult {
  if (responses.length !== EPDS_QUESTIONS.length) {
    throw new Error(`EPDS requires ${EPDS_QUESTIONS.length} answers`);
  }

  const totalScore = responses.reduce<number>((sum, value) => sum + value, 0);
  const selfHarmFlag = responses[9] > 0;

  if (selfHarmFlag || totalScore >= 20) {
    return {
      totalScore,
      flagged: true,
      severity: "Urgent"
    };
  }

  if (totalScore >= 13) {
    return {
      totalScore,
      flagged: true,
      severity: "Probable"
    };
  }

  if (totalScore >= 10) {
    return {
      totalScore,
      flagged: true,
      severity: "Possible"
    };
  }

  return {
    totalScore,
    flagged: false,
    severity: "Minimal"
  };
}
