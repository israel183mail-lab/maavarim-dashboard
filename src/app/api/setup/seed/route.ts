import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seedData";

// One-time setup helper for a fresh deploy with no local shell access: visit
// this URL once (with ?key=<AUTH_SECRET>) to load demo users/students. Only
// runs on a database with zero users, so it can't be used to silently reset
// the super-admin password later even if AUTH_SECRET ever leaked — delete
// this route once real data is in the system.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key || key !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    return NextResponse.json({ error: "המערכת כבר מכילה משתמשים — ה-seed לא ירוץ שוב." }, { status: 409 });
  }

  const { coordinatorEmails } = await runSeed(prisma);
  return NextResponse.json({
    ok: true,
    message: "נתוני הדוגמה נטענו בהצלחה.",
    login: {
      admin: "admin@maavarim.org.il",
      manager: "manager@maavarim.org.il",
      coordinators: coordinatorEmails,
      password: "Maavarim2026!",
    },
  });
}
