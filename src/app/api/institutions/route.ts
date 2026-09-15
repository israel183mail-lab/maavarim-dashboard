import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isManager } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";
import type { InstitutionType } from "@prisma/client";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });

  const institutions = await prisma.institution.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ institutions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isManager(session)) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await readJson<Record<string, string>>(req);
  if (!body?.name) return NextResponse.json({ error: "נא להזין שם מוסד" }, { status: 400 });

  const institution = await prisma.institution.create({
    data: {
      name: body.name,
      type: (body.type as InstitutionType) || "YESHIVA_KTANA",
      city: body.city || null,
      address: body.address || null,
      principalName: body.principalName || null,
      contactPhone: body.contactPhone || null,
      contactEmail: body.contactEmail || null,
      websiteUrl: body.websiteUrl || null,
      info: body.info || "",
    },
  });
  return NextResponse.json({ institution }, { status: 201 });
}
