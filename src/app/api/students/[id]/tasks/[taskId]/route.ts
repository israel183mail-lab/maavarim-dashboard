import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessStudent } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";
import type { TaskStatus } from "@prisma/client";

// Enforces the spec's rule: a coordinator can't mark a task done while an
// earlier, lower-order mandatory task in the same axis/category is still
// open ("רכז שהחסיר משימה, המערכת לא תוכל לאפשר לו לעדכן עד שישלים את
// המשימה הקודמת").
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
  const { id, taskId } = await params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  if (!canAccessStudent(session, student.coordinatorId)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const task = await prisma.studentTask.findUnique({ where: { id: taskId }, include: { template: true } });
  if (!task || task.studentId !== id) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });

  const body = await readJson<{ status?: string; notes?: string; skipReason?: string }>(req);
  if (!body?.status) return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  const nextStatus = body.status as TaskStatus;

  if (nextStatus === "COMPLETED") {
    const priorOpen = await prisma.studentTask.findFirst({
      where: {
        studentId: id,
        academicYear: task.academicYear,
        status: { not: "COMPLETED" },
        template: {
          axisType: task.template.axisType,
          category: task.template.category,
          isMandatory: true,
          order: { lt: task.template.order },
        },
      },
    });
    if (priorOpen) {
      return NextResponse.json(
        { error: "יש להשלים קודם את המשימה הקודמת ברשימה לפני סימון משימה זו." },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.studentTask.update({
    where: { id: taskId },
    data: {
      status: nextStatus,
      completedAt: nextStatus === "COMPLETED" ? new Date() : null,
      notes: "notes" in body ? String(body.notes || "") : task.notes,
      skipReason: nextStatus === "SKIPPED" ? body.skipReason || null : null,
    },
  });

  return NextResponse.json({ task: updated });
}
