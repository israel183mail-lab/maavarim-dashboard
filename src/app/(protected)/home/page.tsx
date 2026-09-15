import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isManager } from "@/lib/permissions";
import KpiCard from "@/components/KpiCard";
import MomentOfTransitionBoard from "@/components/MomentOfTransitionBoard";
import { formatDate } from "@/lib/format";

const ACADEMIC_YEAR = 'תשפ"ו';

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [activeCount, alumniCount, coordinators, institutions, announcements, moments, rescuedChanges] =
    await Promise.all([
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
      prisma.riskChange.findMany({
        where: { newRisk: "NORMAL", previousRisk: { in: ["IN_REVIEW", "ELEVATED", "CRITICAL"] } },
        select: { studentId: true },
        distinct: ["studentId"],
      }),
    ]);

  const creditRows = await Promise.all(
    coordinators.map(async (c) => {
      const [annual, lifetime] = await Promise.all([
        prisma.momentOfTransition.count({
          where: { coordinatorId: c.id, status: "APPROVED", academicYear: ACADEMIC_YEAR },
        }),
        prisma.momentOfTransition.count({ where: { coordinatorId: c.id, status: "APPROVED" } }),
      ]);
      return { id: c.id, name: c.name, annual, lifetime };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-slate-800">דף הבית</h1>
        <p className="text-slate-500 text-sm mt-1">שלום {session.name}, ברוכים הבאים למעברים.נט</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="רכזים פעילים" value={coordinators.length} accent="brand" />
        <KpiCard label="סך פעילים" value={activeCount} accent="brand" />
        <KpiCard label="סך בוגרים" value={alumniCount} accent="brand" />
        <KpiCard label="תלמידים שהצלנו מסיכון" value={rescuedChanges.length} accent="green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg text-slate-800 mb-3">מדד הוצאה מסיכון וצבירת קרדיטים לרכזים</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {creditRows.map((c) => (
                <div key={c.id} className="card p-4">
                  <div className="font-semibold text-slate-800 mb-2">{c.name}</div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-heebo font-extrabold text-brand-700">{c.annual}</div>
                      <div className="text-slate-400 text-xs">קרדיטים {ACADEMIC_YEAR}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-heebo font-extrabold text-slate-500">{c.lifetime}</div>
                      <div className="text-slate-400 text-xs">קרדיטים כללי</div>
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
          <h2 className="text-lg text-slate-800 mb-3">פינת ההודעות</h2>
          <div className="space-y-3">
            {announcements.length === 0 && (
              <div className="card p-4 text-sm text-slate-400 text-center">אין הודעות חדשות</div>
            )}
            {announcements.map((a) => (
              <div key={a.id} className="card p-4">
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
