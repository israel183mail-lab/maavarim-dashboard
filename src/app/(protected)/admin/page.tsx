import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isManager, isSuperAdmin } from "@/lib/permissions";
import StudentDataGrid from "@/components/StudentDataGrid";
import AdminUserManager from "@/components/AdminUserManager";
import AdminAnnouncementForm from "@/components/AdminAnnouncementForm";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isManager(session)) redirect("/dashboard");

  const superAdmin = isSuperAdmin(session);
  const users = superAdmin
    ? await prisma.user.findMany({
        include: { _count: { select: { students: true } } },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const atRiskCount = await prisma.student.count({
    where: { status: "ACTIVE", riskLevel: { in: ["ELEVATED", "CRITICAL"] } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl text-slate-800">אזור ניהול</h1>

      <section>
        <h2 className="text-lg text-slate-800 mb-3">
          צפייה מרוכזת — כלל התלמידים {atRiskCount > 0 && <span className="text-[#c40000]">({atRiskCount} בסיכון מוגבר/קריטי)</span>}
        </h2>
        <StudentDataGrid showCoordinatorColumn />
      </section>

      <section>
        <h2 className="text-lg text-slate-800 mb-3">פרסום הודעה בדף הבית</h2>
        <AdminAnnouncementForm />
      </section>

      {superAdmin ? (
        <section>
          <h2 className="text-lg text-slate-800 mb-3">ניהול משתמשים — הוספה/הסרה, איפוס סיסמה</h2>
          <AdminUserManager initialUsers={users} />
        </section>
      ) : (
        <div className="text-sm text-slate-400">ניהול משתמשים וסיסמאות זמין למנהל/ת כללי/ת בלבד.</div>
      )}
    </div>
  );
}
