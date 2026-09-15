import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { studentScopeFilter, isManager } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";
import type { StudentCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const risk = searchParams.get("risk");
  const coordinatorId = searchParams.get("coordinatorId");

  const where: Record<string, unknown> = { ...studentScopeFilter(session) };
  if (isManager(session) && coordinatorId) where.coordinatorId = coordinatorId;
  if (category) where.category = category;
  if (risk) where.riskLevel = risk;
  if (q) {
    where.OR = [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }];
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      coordinator: { select: { id: true, name: true } },
      currentInstitution: { select: { id: true, name: true } },
      tasks: { include: { template: true } },
      notes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });

  const body = await readJson<{
    firstName?: string;
    lastName?: string;
    category?: string;
    city?: string;
    address?: string;
    phone?: string;
    parentPhone?: string;
    familyStatusNotes?: string;
    currentInstitutionId?: string;
    coordinatorId?: string;
  }>(req);
  if (!body) return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  const { firstName, lastName, category, city, address, phone, parentPhone, familyStatusNotes, currentInstitutionId, coordinatorId } = body;

  if (!firstName || !lastName || !category) {
    return NextResponse.json({ error: "נא למלא שם פרטי, שם משפחה וקטגוריה" }, { status: 400 });
  }

  const assignedCoordinatorId = isManager(session) && coordinatorId ? coordinatorId : session.userId;

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      category: category as StudentCategory,
      city: city || null,
      address: address || null,
      phone: phone || null,
      parentPhone: parentPhone || null,
      familyStatusNotes: familyStatusNotes || "",
      currentInstitutionId: currentInstitutionId || null,
      coordinatorId: assignedCoordinatorId,
    },
  });

  return NextResponse.json({ student }, { status: 201 });
}
