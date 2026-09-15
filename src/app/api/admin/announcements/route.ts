import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isManager } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isManager(session)) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await readJson<{ title?: string; body?: string; imageUrl?: string; fileUrl?: string; expiresAt?: string }>(req);
  if (!body?.title) return NextResponse.json({ error: "נא להזין כותרת" }, { status: 400 });

  const announcement = await prisma.announcement.create({
    data: {
      title: body.title,
      body: body.body || "",
      imageUrl: body.imageUrl || null,
      fileUrl: body.fileUrl || null,
      createdById: session.userId,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });
  return NextResponse.json({ announcement }, { status: 201 });
}
