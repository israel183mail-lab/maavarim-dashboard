import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isSuperAdmin(session)) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  const { id } = await params;

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });

  if (body.action === "resetPassword") {
    const tempPassword = generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
    return NextResponse.json({ tempPassword });
  }

  const data: Record<string, unknown> = {};
  for (const field of ["name", "role", "phone", "isActive"]) {
    if (field in body) data[field] = body[field];
  }
  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ user });
}
