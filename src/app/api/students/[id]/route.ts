import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessStudent, isManager } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";
import type { RiskLevel } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      coordinator: { select: { id: true, name: true } },
      currentInstitution: true,
      tasks: { include: { template: true }, orderBy: { template: { order: "asc" } } },
      notes: { orderBy: { createdAt: "desc" } },
      transfers: { include: { fromInstitution: true, toInstitution: true }, orderBy: { transferDate: "desc" } },
    },
  });
  if (!student) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  if (!canAccessStudent(session, student.coordinatorId)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  return NextResponse.json({ student });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  if (!canAccessStudent(session, existing.coordinatorId)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  const data: Record<string, unknown> = {};

  for (const field of ["firstName", "lastName", "city", "address", "phone", "parentPhone", "familyStatusNotes", "category", "status", "currentInstitutionId"]) {
    if (field in body) data[field] = body[field] || null;
  }
  if (isManager(session) && "coordinatorId" in body) data.coordinatorId = body.coordinatorId;

  if ("riskLevel" in body && body.riskLevel !== existing.riskLevel) {
    const newRisk = body.riskLevel as RiskLevel;
    data.riskLevel = newRisk;
    await prisma.riskChange.create({
      data: {
        studentId: id,
        previousRisk: existing.riskLevel,
        newRisk,
        changedById: session.userId,
        reason: (body.riskChangeReason as string) || null,
      },
    });
  }

  const student = await prisma.student.update({ where: { id }, data });
  return NextResponse.json({ student });
}
