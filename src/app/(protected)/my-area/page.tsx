import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isManager } from "@/lib/permissions";
import GroupAxis from "@/components/GroupAxis";
import StudentDataGrid from "@/components/StudentDataGrid";
import RiskPieChart from "@/components/RiskPieChart";
import CoordinatorSelect from "@/components/CoordinatorSelect";
import { RISK_ORDER } from "@/lib/format";

const ACADEMIC_YEAR = 'תשפ"ו';

export default async function MyAreaPage({
  searchParams,
}: {
  searchParams: Promise<{ coordinatorId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const manager = isManager(session);
  const params = await searchParams;

  const coordinators = manager
    ? await prisma.user.findMany({ where: { role: "COORDINATOR" }, orderBy: { name: "asc" } })
    : [];
  const targetCoordinatorId = manager ? params.coordinatorId || coordinators[0]?.id : session.userId;

  if (!targetCoordinatorId) {
    return <div className="text-slate-500">אין רכזים במערכת עדיין.</div>;
  }

  const coordinator = await prisma.user.findUnique({ where: { id: targetCoordinatorId } });

  const groupTasksRaw = await prisma.groupTask.findMany({
    where: { coordinatorId: targetCoordinatorId, academicYear: ACADEMIC_YEAR },
    include: { institution: true, template: true },
    orderBy: { template: { order: "asc" } },
  });

  const byInstitution = new Map<string, { name: string; tasks: typeof groupTasksRaw }>();
  for (const gt of groupTasksRaw) {
    const key = gt.institutionId;
    if (!byInstitution.has(key)) byInstitution.set(key, { name: gt.institution.name, tasks: [] });
    byInstitution.get(key)!.tasks.push(gt);
  }

  const riskCounts = await Promise.all(
    RISK_ORDER.map(async (risk) => ({
      risk,
      count: await prisma.student.count({ where: { coordinatorId: targetCoordinatorId, riskLevel: risk, status: "ACTIVE" } }),
    }))
  );

  const staleCount = await prisma.student.count({
    where: {
      coordinatorId: targetCoordinatorId,
      status: "ACTIVE",
      tasks: {
        none: { academicYear: ACADEMIC_YEAR, status: "COMPLETED", completedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl text-slate-800">
          אזור אישי {manager && coordinator ? `— ${coordinator.name}` : ""}
        </h1>
        {manager && (
          <CoordinatorSelect
            coordinators={coordinators.map((c) => ({ id: c.id, name: c.name }))}
            defaultValue={targetCoordinatorId}
          />
        )}
      </div>

      {staleCount > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          ⚠ {staleCount} פעילים שלא עודכנה עבורם משימה ב-30 הימים האחרונים. נא לעדכן את כרטיס התלמיד.
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 card p-4">
          <h2 className="text-base font-semibold text-slate-700 mb-2">מצב סיכון</h2>
          <RiskPieChart data={riskCounts} />
        </div>
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-lg text-slate-800">ציר הקבוצה</h2>
          {[...byInstitution.entries()].map(([id, data]) => {
            const done = data.tasks.filter((t) => t.status === "COMPLETED").length;
            const pct = data.tasks.length ? Math.round((done / data.tasks.length) * 100) : 0;
            return (
              <GroupAxis
                key={id}
                institutionName={data.name}
                percentDone={pct}
                tasks={data.tasks.map((t) => ({
                  id: t.id,
                  status: t.status,
                  executedDate: t.executedDate?.toISOString() ?? null,
                  description: t.description,
                  template: { title: t.template.title, targetMonth: t.template.targetMonth, order: t.template.order },
                }))}
              />
            );
          })}
          {byInstitution.size === 0 && (
            <div className="card p-4 text-sm text-slate-400 text-center">אין עדיין מטלות קבוצתיות משויכות</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg text-slate-800 mb-3">ציר הפרט</h2>
        <StudentDataGrid coordinatorId={targetCoordinatorId} />
      </div>
    </div>
  );
}
