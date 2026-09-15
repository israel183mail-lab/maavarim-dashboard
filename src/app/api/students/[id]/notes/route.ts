import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessStudent } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  const { id } = await params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  if (!canAccessStudent(session, student.coordinatorId)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const body = await readJson<{ note?: string }>(req);
  const note = body?.note;
  if (!note || !String(note).trim()) {
    return NextResponse.json({ error: "נא לכתוב הערה" }, { status: 400 });
  }

  const created = await prisma.studentNote.create({
    data: {
      studentId: id,
      authorId: session.userId,
      authorName: session.name,
      note: String(note).trim(),
    },
  });

  return NextResponse.json({ note: created }, { status: 201 });
}
