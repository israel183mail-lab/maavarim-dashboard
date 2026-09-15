import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { readJson } from "@/lib/readJson";

export async function POST(req: NextRequest) {
  const body = await readJson<{ email?: string; password?: string }>(req);
  const { email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json({ error: "נא להזין דוא\"ל וסיסמה" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!user) {
    return NextResponse.json({ error: "פרטי התחברות שגויים" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "פרטי התחברות שגויים" }, { status: 401 });
  }

  const token = await createSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
