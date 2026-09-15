import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isManager } from "@/lib/permissions";
import InteractionBarChart from "@/components/InteractionBarChart";
import ParticipantStatusPie from "@/components/ParticipantStatusPie";

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
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [onTrack, atRisk, droppingOut] = await Promise.all([
    prisma.student.count({ where: { ...coordinatorFilter, status: "ACTIVE", riskLevel: "NORMAL" } }),
    prisma.student.count({ where: { ...coordinatorFilter, status: "ACTIVE", riskLevel: { in: ["IN_REVIEW", "ELEVATED"] } } }),
    prisma.student.count({ where: { ...coordinatorFilter, status: "ACTIVE", riskLevel: "CRITICAL" } }),
  ]);

  // "Current" group milestone: the earliest-order group template that still
  // has an open instance somewhere this academic year.
  const openGroupTask = await prisma.groupTask.findFirst({
    where: { academicYear: ACADEMIC_YEAR, status: { not: "COMPLETED" } },
    include: { template: true },
    orderBy: { template: { order: "asc" } },
  });

  const rows = await Promise.all(
    coordinators.map(async (c) => {
      const [participants, alumni, completedTasks, notes, groupDone, individualDoneThisMonth] = await Promise.all([
        prisma.student.count({ where: { coordinatorId: c.id, status: "ACTIVE", category: { in: ["GRADE_8", "YESHIVA_1"] } } }),
        prisma.student.count({ where: { coordinatorId: c.id, status: "ACTIVE", category: { in: ["ALUMNI_2", "ALUMNI_3"] } } }),
        prisma.studentTask.count({
          where: { student: { coordinatorId: c.id }, status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } },
        }),
        prisma.studentNote.count({ where: { authorId: c.id, createdAt: { gte: thirtyDaysAgo } } }),
        openGroupTask
          ? prisma.groupTask.count({
              where: { templateId: openGroupTask.templateId, academicYear: ACADEMIC_YEAR, coordinatorId: c.id, status: "COMPLETED" },
            })
          : 0,
        prisma.studentTask.count({
          where: { student: { coordinatorId: c.id }, status: "COMPLETED", completedAt: { gte: monthStart } },
        }),
      ]);
      return {
        id: c.id,
        name: c.name,
        participants,
        alumni,
        interactionIndex: completedTasks + notes,
        groupTaskDone: groupDone > 0,
        individualTaskDone: individualDoneThisMonth > 0,
      };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-slate-800">דשבורד</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-4">
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            {manager ? "מדד אינטראקציות לכל רכז" : "הנתונים שלי"}
          </h2>
          <InteractionBarChart data={rows.map((r) => ({ name: r.name, value: r.interactionIndex }))} />

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead className="text-slate-500 text-xs border-b border-slate-100">
                <tr>
                  <th className="text-right py-2 font-medium">רכז</th>
                  <th className="text-right py-2 font-medium">משתתפים</th>
                  <th className="text-right py-2 font-medium">בוגרים</th>
                  <th className="text-right py-2 font-medium">משימת החודש קבוצתי</th>
                  <th className="text-right py-2 font-medium">משימת החודש פרטני</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 font-medium text-slate-700">{r.name}</td>
                    <td className="py-2 text-slate-600">{r.participants}</td>
                    <td className="py-2 text-slate-600">{r.alumni}</td>
                    <td className="py-2">
                      {r.groupTaskDone ? (
                        <span className="text-emerald-600 font-medium">✔ בוצעה</span>
                      ) : (
                        <span className="text-rose-500 font-medium">✘ טרם</span>
                      )}
                    </td>
                    <td className="py-2">
                      {r.individualTaskDone ? (
                        <span className="text-emerald-600 font-medium">✔ בוצעה</span>
                      ) : (
                        <span className="text-rose-500 font-medium">✘ טרם</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {openGroupTask && (
            <div className="flex rounded-full overflow-hidden text-sm font-bold shadow-sm">
              <span className="bg-accent-500 text-white px-4 py-2">{openGroupTask.template.title}</span>
              <span className="bg-brand-700 text-white px-4 py-2">משימת החודש</span>
            </div>
          )}
          <div className="card p-4">
            <h2 className="text-base font-semibold text-slate-700 mb-2">תמונת מצב פעילים</h2>
            <ParticipantStatusPie onTrack={onTrack} atRisk={atRisk} droppingOut={droppingOut} />
          </div>
        </div>
      </div>
    </div>
  );
}
