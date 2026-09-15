"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/format";
import MaavarimLogo from "@/components/MaavarimLogo";

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
      <div className="max-w-[1400px] mx-auto px-4 flex items-center h-[72px] gap-4">
        <Link href="/home" className="flex items-center shrink-0 text-2xl">
          <MaavarimLogo light />
        </Link>

        <nav className="flex items-center gap-2 overflow-x-auto flex-1 no-scrollbar py-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className={`pill-nav-btn ${active ? "active" : ""}`}>
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
            className="text-sm px-3 py-1.5 rounded-full border border-white/25 hover:bg-white/10 transition"
          >
            התנתקות
          </button>
        </div>
      </div>
    </header>
  );
}
