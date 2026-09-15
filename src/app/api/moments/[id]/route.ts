import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isManager } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";
import type { MomentStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isManager(session)) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  const { id } = await params;

  const body = await readJson<{ status?: string }>(req);
  const status = body?.status;
  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "סטטוס לא תקין" }, { status: 400 });
  }

  const moment = await prisma.momentOfTransition.update({
    where: { id },
    data: { status: status as MomentStatus, approvedById: session.userId },
  });
  return NextResponse.json({ moment });
}
