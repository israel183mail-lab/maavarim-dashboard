"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/format";

type NavItem = { href: string; label: string };

const BASE_ITEMS: NavItem[] = [
  { href: "/home", label: "דף הבית" },
  { href: "/dashboard", label: "דשבורד" },
  { href: "/my-area", label: "אזור אישי" },
  { href: "/students", label: "כרטיס תלמיד" },
  { href: "/info-center", label: "מרכז המידע" },
  { href: "/register", label: "רישום" },
];

const ADMIN_ITEM: NavItem = { href: "/admin", label: "אזור מנהל" };

export default function TopNav({
  name,
  role,
  isManager,
}: {
  name: string;
  role: string;
  isManager: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = isManager ? [...BASE_ITEMS, ADMIN_ITEM] : BASE_ITEMS;

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-brand-700 text-white sticky top-0 z-20 shadow-md">
      <div className="max-w-[1400px] mx-auto px-4 flex items-center h-16 gap-6">
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <span className="h-9 w-9 rounded-full bg-white text-brand-700 font-heebo font-extrabold flex items-center justify-center">
            מ
          </span>
          <span className="font-heebo font-extrabold text-lg hidden sm:inline">מעברים.נט</span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto flex-1 no-scrollbar">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active ? "bg-white/15 text-white" : "text-white/75 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-left hidden md:block">
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-xs text-white/60">{ROLE_LABELS[role] ?? role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-white/25 hover:bg-white/10 transition"
          >
            התנתקות
          </button>
        </div>
      </div>
    </header>
  );
}
