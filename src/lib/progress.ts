import { RISK_MULTIPLIER } from "@/lib/format";

type TaskLike = { status: string; template: { weight: number } };

// Sum of weights of completed individual/redirect tasks for a student in
// one academic year — the "battery" percentage shown on the student card.
export function taskProgressPercent(tasks: TaskLike[]): number {
  const sum = tasks
    .filter((t) => t.status === "COMPLETED")
    .reduce((acc, t) => acc + (t.template?.weight ?? 0), 0);
  return Math.min(100, Math.round(sum * 10) / 10);
}

// Success_Score = Task_Progress_Percentage * Risk_Multiplier (spec ch. 13.3).
export function successScore(progressPercent: number, riskLevel: string): number {
  const mult = RISK_MULTIPLIER[riskLevel] ?? 1;
  return Math.round(progressPercent * mult * 10) / 10;
}
