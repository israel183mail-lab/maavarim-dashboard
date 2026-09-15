import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { readJson } from "@/lib/readJson";

const ACADEMIC_YEAR = 'תשפ"ו';
const MAX_LENGTH = 200;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });

  const body = await readJson<{ coordinatorId?: string; storyText?: string }>(req);
  if (!body) return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  const coordinatorId = body.coordinatorId || session.userId;
  const storyText = String(body.storyText || "").trim();

  if (!storyText) return NextResponse.json({ error: "נא לכתוב את הסיפור" }, { status: 400 });
  if (storyText.length > MAX_LENGTH) {
    return NextResponse.json({ error: `הסיפור ארוך מדי (מקסימום ${MAX_LENGTH} תווים)` }, { status: 400 });
  }

  const moment = await prisma.momentOfTransition.create({
    data: { coordinatorId, storyText, academicYear: ACADEMIC_YEAR },
  });

  return NextResponse.json({ moment }, { status: 201 });
}
