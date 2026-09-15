import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isManager } from "@/lib/permissions";
import TopNav from "@/components/TopNav";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav name={session.name} role={session.role} isManager={isManager(session)} />
      <main className="max-w-[1400px] w-full mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
