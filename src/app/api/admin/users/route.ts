import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { readJson } from "@/lib/readJson";
import type { Role } from "@prisma/client";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET() {
  const session = await getSession();
  if (!session || !isSuperAdmin(session)) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const users = await prisma.user.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isSuperAdmin(session)) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await readJson<{ name?: string; email?: string; role?: string; phone?: string }>(req);
  if (!body) return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  const { name, email, role, phone } = body;
  if (!name || !email || !role) {
    return NextResponse.json({ error: "נא למלא שם, דוא\"ל ותפקיד" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (existing) return NextResponse.json({ error: "כתובת הדוא\"ל כבר קיימת במערכת" }, { status: 409 });

  const tempPassword = generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: role as Role,
      phone: phone || null,
    },
  });

  return NextResponse.json({ user, tempPassword }, { status: 201 });
}
