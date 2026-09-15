import type { SessionPayload } from "@/lib/auth";

export function isManager(session: SessionPayload): boolean {
  return session.role === "MANAGER" || session.role === "SUPER_ADMIN";
}

export function isSuperAdmin(session: SessionPayload): boolean {
  return session.role === "SUPER_ADMIN";
}

// Coordinators only ever see their own caseload; managers and the super
// admin see everyone's.
export function studentScopeFilter(session: SessionPayload) {
  if (isManager(session)) return {};
  return { coordinatorId: session.userId };
}

export function canAccessStudent(session: SessionPayload, coordinatorId: string): boolean {
  return isManager(session) || session.userId === coordinatorId;
}
