import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isManager } from "@/lib/permissions";
import KpiPill from "@/components/KpiPill";
import RescueBarChart from "@/components/RescueBarChart";
import MomentOfTransitionBoard from "@/components/MomentOfTransitionBoard";
import { formatDate } from "@/lib/format";

const ACADEMIC_YEAR = 'תשפ"ו';
const CURRENT_YEAR_START = new Date(new Date().getFullYear(), 0, 1);

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [activeCount, alumniCount, coordinators, institutions, announcements, moments] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE", category: { in: ["GRADE_8", "YESHIVA_1"] } } }),
    prisma.student.count({ where: { status: "ACTIVE", category: { in: ["ALUMNI_2", "ALUMNI_3"] } } }),
    prisma.user.findMany({ where: { role: "COORDINATOR" }, orderBy: { name: "asc" } }),
    prisma.institution.findMany({
      include: { students: { select: { coordinator: { select: { id: true, name: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.momentOfTransition.findMany({
      include: { coordinator: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const rescuedTotal = await prisma.riskChange.findMany({
    where: { newRisk: "NORMAL", previousRisk: { in: ["IN_REVIEW", "ELEVATED", "CRITICAL"] } },
    select: { studentId: true },
    distinct: ["studentId"],
  });

  const creditRows = await Promise.all(
    coordinators.map(async (c) => {
      const [annual, lifetime, rescuedAnnual, rescuedLifetime] = await Promise.all([
        prisma.momentOfTransition.count({
          where: { coordinatorId: c.id, status: "APPROVED", academicYear: ACADEMIC_YEAR },
        }),
        prisma.momentOfTransition.count({ where: { coordinatorId: c.id, status: "APPROVED" } }),
        prisma.riskChange.count({
          where: {
            newRisk: "NORMAL",
            previousRisk: { in: ["IN_REVIEW", "ELEVATED", "CRITICAL"] },
            changedById: c.id,
            createdAt: { gte: CURRENT_YEAR_START },
          },
        }),
        prisma.riskChange.count({
          where: { newRisk: "NORMAL", previousRisk: { in: ["IN_REVIEW", "ELEVATED", "CRITICAL"] }, changedById: c.id },
        }),
      ]);
      return { id: c.id, name: c.name, annual, lifetime, rescuedAnnual, rescuedLifetime };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-slate-800">דף הבית</h1>
        <p className="text-slate-500 text-sm mt-1">שלום {session.name}, ברוכים הבאים למעברים.נט</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
        <KpiPill label="סך פעילים" value={activeCount} />
        <KpiPill label="סך בוגרים" value={alumniCount} />
        <KpiPill label="תלמידים שהצלנו" value={rescuedTotal.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg text-slate-800 mb-3">מדד הוצאה מסיכון</h2>
            <div className="card p-4">
              <RescueBarChart
                data={creditRows.map((c) => ({ name: c.name, annual: c.rescuedAnnual, lifetime: c.rescuedLifetime }))}
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg text-slate-800 mb-3">צבירת קרדיטים לרכזים</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {creditRows.map((c) => (
                <div key={c.id} className="rounded-2xl border-2 border-sky-400 p-3">
                  <div className="text-center font-bold text-slate-800 mb-2 bg-sky-50 rounded-full py-1.5">
                    {c.name}
                  </div>
                  <div className="flex items-center justify-center gap-5 text-sm">
                    <div className="text-center">
                      <div className="text-xl font-heebo font-extrabold text-accent-500">⭐ {c.annual}</div>
                      <div className="text-slate-400 text-[11px]">קרדיטים {ACADEMIC_YEAR}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-heebo font-extrabold text-brand-700">⭐ {c.lifetime}</div>
                      <div className="text-slate-400 text-[11px]">קרדיטים כללי</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <MomentOfTransitionBoard
            coordinators={coordinators.map((c) => ({ id: c.id, name: c.name }))}
            currentUserId={session.userId}
            canModerate={isManager(session)}
            initialMoments={moments.map((m) => ({
              id: m.id,
              storyText: m.storyText,
              status: m.status,
              coordinatorName: m.coordinator.name,
              createdAt: m.createdAt.toISOString(),
            }))}
          />

          <section>
            <h2 className="text-lg text-slate-800 mb-3">תלמודי תורה וישיבות קטנות</h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs">
                  <tr>
                    <th className="text-right p-3 font-medium">שם המוסד</th>
                    <th className="text-right p-3 font-medium">עיר</th>
                    <th className="text-right p-3 font-medium">רכזים פעילים במוסד</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((inst) => {
                    const names = [...new Set(inst.students.map((s) => s.coordinator.name))];
                    return (
                      <tr key={inst.id} className="border-t border-slate-100">
                        <td className="p-3 font-medium text-slate-700">{inst.name}</td>
                        <td className="p-3 text-slate-500">{inst.city ?? "—"}</td>
                        <td className="p-3 text-slate-500">{names.length ? names.join(", ") : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div>
          <h2 className="text-lg text-slate-800 mb-3">📌 פינת ההודעות</h2>
          <div className="space-y-3">
            {announcements.length === 0 && (
              <div className="card p-4 text-sm text-slate-400 text-center">אין הודעות חדשות</div>
            )}
            {announcements.map((a) => (
              <div key={a.id} className="card p-4 border-2 border-dashed border-accent-300/60">
                {a.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.imageUrl} alt={a.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                )}
                <div className="font-semibold text-slate-800">{a.title}</div>
                {a.body && <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{a.body}</p>}
                {a.fileUrl && (
                  <a href={a.fileUrl} target="_blank" className="text-xs text-brand-600 underline mt-2 inline-block">
                    קובץ מצורף
                  </a>
                )}
                <div className="text-xs text-slate-400 mt-2">{formatDate(a.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
