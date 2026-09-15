import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// /api/setup/seed carries its own key-based check (see that route) and is
// meant to be hit once, unauthenticated, right after a fresh deploy.
const PUBLIC_PATHS = ["/login", "/api/login", "/api/setup/seed"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Coarse gate: only managers/super-admins get past here at all. Each
  // route/page then applies its own finer-grained check (e.g. user-account
  // management is super-admin only — see isSuperAdmin() calls in
  // /api/admin/users/*).
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    session.role !== "MANAGER" &&
    session.role !== "SUPER_ADMIN"
  ) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
