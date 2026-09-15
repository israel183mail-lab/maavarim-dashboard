import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessStudent } from "@/lib/permissions";
import { formatDate } from "@/lib/format";

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "asc" } } },
  });
  if (!student) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  if (!canAccessStudent(session, student.coordinatorId)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const header = ["תאריך", "כותב", "הערה"].map(csvEscape).join(",");
  const rows = student.notes.map((n) => [formatDate(n.createdAt), n.authorName, n.note].map(csvEscape).join(","));
  const csv = "﻿" + [header, ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${student.lastName}_${student.firstName}_notes.csv"`,
    },
  });
}
