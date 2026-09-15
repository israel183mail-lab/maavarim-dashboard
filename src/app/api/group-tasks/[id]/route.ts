import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isManager } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";
import type { TaskStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  const { id } = await params;

  const task = await prisma.groupTask.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  if (!isManager(session) && task.coordinatorId !== session.userId) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const body = await readJson<{ status?: string; executedDate?: string; description?: string; attendeesCount?: number }>(req);
  if (!body?.status) return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  const updated = await prisma.groupTask.update({
    where: { id },
    data: {
      status: body.status as TaskStatus,
      executedDate: body.status === "COMPLETED" ? new Date(body.executedDate || Date.now()) : null,
      description: "description" in body ? String(body.description || "") : task.description,
      attendeesCount: "attendeesCount" in body ? body.attendeesCount : task.attendeesCount,
    },
  });
  return NextResponse.json({ task: updated });
}
