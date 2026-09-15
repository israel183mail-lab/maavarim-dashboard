import type { RiskLevel, StudentCategory } from "@prisma/client";

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("he-IL", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export const ROLE_LABELS: Record<string, string> = {
  COORDINATOR: "רכז/ת",
  MANAGER: "מנהל/ת תוכנית",
  SUPER_ADMIN: "מנהל/ת כללי/ת",
};

export const CATEGORY_LABELS: Record<string, string> = {
  GRADE_8: "משתתף כיתה ח'",
  YESHIVA_1: "משתתף שיעור א'",
  ALUMNI_2: "בוגר שיעור ב'",
  ALUMNI_3: "בוגר שיעור ג'",
};

export const CATEGORY_ORDER: StudentCategory[] = ["GRADE_8", "YESHIVA_1", "ALUMNI_2", "ALUMNI_3"];

export const RISK_LABELS: Record<string, string> = {
  NORMAL: "תקין",
  IN_REVIEW: "בבדיקה",
  ELEVATED: "מוגבר",
  CRITICAL: "קריטי",
};

// Risk_Multiplier applied to the task-progress percentage to get the
// displayed success score (Chapter 13.3 of the spec).
export const RISK_MULTIPLIER: Record<string, number> = {
  NORMAL: 1.0,
  IN_REVIEW: 0.9,
  ELEVATED: 0.65,
  CRITICAL: 0.4,
};

export const RISK_ORDER: RiskLevel[] = ["NORMAL", "IN_REVIEW", "ELEVATED", "CRITICAL"];

export const RISK_DOT_COLOR: Record<string, string> = {
  NORMAL: "bg-risk-normal",
  IN_REVIEW: "bg-risk-review",
  ELEVATED: "bg-risk-elevated",
  CRITICAL: "bg-risk-critical",
};

export const RISK_BADGE_COLOR: Record<string, string> = {
  NORMAL: "bg-[#21B524]/10 text-[#178018] border border-[#21B524]/30",
  IN_REVIEW: "bg-[#F5C518]/15 text-[#8a6d00] border border-[#F5C518]/40",
  ELEVATED: "bg-[#F7901E]/10 text-[#b35e00] border border-[#F7901E]/30",
  CRITICAL: "bg-[#FF3131]/10 text-[#c40000] border border-[#FF3131]/30",
};

export const STUDENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "פעיל",
  INACTIVE: "לא פעיל",
  DROPPED: "נשר",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: "טרם",
  COMPLETED: "בוצע",
  DELAYED: "בעיכוב",
  SKIPPED: "דולג",
};

export const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  TALMUD_TORAH: "תלמוד תורה",
  YESHIVA_KTANA: "ישיבה קטנה",
  OTHER: "אחר",
};

export const MOMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין לאישור",
  APPROVED: "אושר",
  REJECTED: "נדחה",
};
