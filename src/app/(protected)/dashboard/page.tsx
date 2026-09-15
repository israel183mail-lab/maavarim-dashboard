import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isManager } from "@/lib/permissions";
import KpiCard from "@/components/KpiCard";
import RiskPieChart from "@/components/RiskPieChart";
import InteractionBarChart from "@/components/InteractionBarChart";
import { RISK_ORDER } from "@/lib/format";

const ACADEMIC_YEAR = 'תשפ"ו';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const manager = isManager(session);

  const coordinatorFilter = manager ? {} : { coordinatorId: session.userId };
  const coordinators = manager
    ? await prisma.user.findMany({ where: { role: "COORDINATOR" }, orderBy: { name: "asc" } })
    : await prisma.user.findMany({ where: { id: session.userId } });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [activeCount, alumniCount, riskCounts] = await Promise.all([
    prisma.student.count({ where: { ...coordinatorFilter, status: "ACTIVE", category: { in: ["GRADE_8", "YESHIVA_1"] } } }),
    prisma.student.count({ where: { ...coordinatorFilter, status: "ACTIVE", category: { in: ["ALUMNI_2", "ALUMNI_3"] } } }),
    Promise.all(
      RISK_ORDER.map(async (risk) => ({
        risk,
        count: await prisma.student.count({ where: { ...coordinatorFilter, riskLevel: risk, status: "ACTIVE" } }),
      }))
    ),
  ]);

  const rows = await Promise.all(
    coordinators.map(async (c) => {
      const [participants, alumni, completedTasks, notes] = await Promise.all([
        prisma.student.count({ where: { coordinatorId: c.id, status: "ACTIVE", category: { in: ["GRADE_8", "YESHIVA_1"] } } }),
        prisma.student.count({ where: { coordinatorId: c.id, status: "ACTIVE", category: { in: ["ALUMNI_2", "ALUMNI_3"] } } }),
        prisma.studentTask.count({
          where: { student: { coordinatorId: c.id }, status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } },
        }),
        prisma.studentNote.count({ where: { authorId: c.id, createdAt: { gte: thirtyDaysAgo } } }),
      ]);
      return { id: c.id, name: c.name, participants, alumni, interactionIndex: completedTasks + notes };
    })
  );

  // "Current" group milestone: the earliest-order group template that still
  // has an open instance somewhere this academic year.
  const openGroupTask = await prisma.groupTask.findFirst({
    where: { academicYear: ACADEMIC_YEAR, status: { not: "COMPLETED" } },
    include: { template: true },
    orderBy: { template: { order: "asc" } },
  });

  const currentMilestoneTemplateId = openGroupTask?.templateId;
  const groupBoard = currentMilestoneTemplateId
    ? await prisma.groupTask.findMany({
        where: { templateId: currentMilestoneTemplateId, academicYear: ACADEMIC_YEAR, ...(manager ? {} : { coordinatorId: session.userId }) },
        include: { institution: true, coordinator: { select: { name: true } }, template: true },
      })
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-slate-800">דשבורד</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KpiCard label="משתתפים פעילים" value={activeCount} />
        <KpiCard label="בוגרים" value={alumniCount} />
        <KpiCard
          label="בסיכון (מוגבר/קריטי)"
          value={(riskCounts.find((r) => r.risk === "ELEVATED")?.count ?? 0) + (riskCounts.find((r) => r.risk === "CRITICAL")?.count ?? 0)}
          accent="red"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-4 lg:col-span-1">
          <h2 className="text-base font-semibold text-slate-700 mb-2">מצב סיכון כללי</h2>
          <RiskPieChart data={riskCounts} />
        </div>

        <div className="lg:col-span-2 card p-4">
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            {manager ? "מדד אינטראקציות לכל רכז" : "הנתונים שלי"}
          </h2>
          <InteractionBarChart data={rows.map((r) => ({ name: r.name, value: r.interactionIndex }))} />
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm">
              <thead className="text-slate-500 text-xs border-b border-slate-100">
                <tr>
                  <th className="text-right py-2 font-medium">רכז</th>
                  <th className="text-right py-2 font-medium">משתתפים</th>
                  <th className="text-right py-2 font-medium">בוגרים</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 font-medium text-slate-700">{r.name}</td>
                    <td className="py-2 text-slate-600">{r.participants}</td>
                    <td className="py-2 text-slate-600">{r.alumni}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {openGroupTask && (
        <section>
          <h2 className="text-lg text-slate-800 mb-3">
            מטלה קבוצתית העומדת על הפרק: {openGroupTask.template.title}
            {openGroupTask.template.targetMonth ? ` (${openGroupTask.template.targetMonth})` : ""}
          </h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-right p-3 font-medium">מוסד</th>
                  <th className="text-right p-3 font-medium">רכז</th>
                  <th className="text-right p-3 font-medium">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {groupBoard.map((g) => (
                  <tr key={g.id} className="border-t border-slate-100">
                    <td className="p-3 text-slate-700">{g.institution.name}</td>
                    <td className="p-3 text-slate-500">{g.coordinator.name}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          g.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {g.status === "COMPLETED" ? "בוצעה" : "טרם"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
