import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessStudent } from "@/lib/permissions";
import { ensureStudentTasks, ACADEMIC_YEAR } from "@/lib/ensureTasks";
import { CATEGORY_LABELS, RISK_MULTIPLIER, STUDENT_STATUS_LABELS } from "@/lib/format";
import { taskProgressPercent, successScore } from "@/lib/progress";
import RiskBadge from "@/components/RiskBadge";
import ProgressBattery from "@/components/ProgressBattery";
import BatteryTrendChart from "@/components/BatteryTrendChart";
import RedirectPyramid from "@/components/RedirectPyramid";
import StudentTaskChecklist from "@/components/StudentTaskChecklist";
import StudentNotesTimeline from "@/components/StudentNotesTimeline";
import StudentEditPanel from "@/components/StudentEditPanel";

export default async function StudentCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const studentHeader = await prisma.student.findUnique({ where: { id } });
  if (!studentHeader) notFound();
  if (!canAccessStudent(session, studentHeader.coordinatorId)) {
    redirect("/students");
  }

  await ensureStudentTasks(id, studentHeader.category, "INDIVIDUAL");
  const atRisk = studentHeader.riskLevel !== "NORMAL";
  if (atRisk) await ensureStudentTasks(id, studentHeader.category, "REDIRECT");

  const [student, institutions] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: {
        coordinator: { select: { id: true, name: true } },
        currentInstitution: true,
        tasks: { where: { academicYear: ACADEMIC_YEAR }, include: { template: true }, orderBy: { template: { order: "asc" } } },
        notes: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.institution.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!student) notFound();

  const individualTasks = student.tasks.filter((t) => t.template.axisType === "INDIVIDUAL");
  const redirectTasks = student.tasks.filter((t) => t.template.axisType === "REDIRECT");

  const progressPercent = taskProgressPercent(individualTasks);
  const riskMultiplier = RISK_MULTIPLIER[student.riskLevel] ?? 1;
  const score = successScore(progressPercent, student.riskLevel);

  const orderedTasks = [...individualTasks].sort((a, b) => a.template.order - b.template.order);
  let cumulative = 0;
  const trendPoints = [
    { label: "התחלה", score: 0 },
    ...orderedTasks.map((t) => {
      if (t.status === "COMPLETED") cumulative += t.template.weight;
      return { label: t.template.title, score: Math.round(cumulative * riskMultiplier * 10) / 10 };
    }),
  ];

  const isAlumniPhase = student.category === "ALUMNI_2" || student.category === "ALUMNI_3";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl text-slate-800">
            {student.lastName} {student.firstName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {CATEGORY_LABELS[student.category]} · רכז: {student.coordinator.name} · סטטוס: {STUDENT_STATUS_LABELS[student.status]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressBattery percent={progressPercent} />
          <RiskBadge level={student.riskLevel} />
        </div>
      </div>

      <StudentEditPanel
        studentId={student.id}
        institutions={institutions.map((i) => ({ id: i.id, name: i.name }))}
        initial={{
          firstName: student.firstName,
          lastName: student.lastName,
          city: student.city ?? "",
          address: student.address ?? "",
          phone: student.phone ?? "",
          parentPhone: student.parentPhone ?? "",
          familyStatusNotes: student.familyStatusNotes,
          currentInstitutionId: student.currentInstitutionId ?? "",
          status: student.status,
          riskLevel: student.riskLevel,
        }}
      />

      {atRisk && (
        <div className="rounded-lg bg-[#FF3131]/5 border border-[#FF3131]/30 px-4 py-3 text-sm text-[#c40000]">
          התלמיד במצב סיכון — הועבר אוטומטית למסלול &quot;הכוון&quot; בתחתית העמוד. ציון ההצלחה מוכפל ב-{Math.round(riskMultiplier * 100)}%.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-4">
            <div className="text-center mb-1">
              <span className="text-2xl font-heebo font-extrabold text-brand-700">{score}%</span>
              <span className="text-xs text-slate-400"> מדד הצלחה</span>
            </div>
            <BatteryTrendChart
              points={trendPoints}
              label={isAlumniPhase ? "בוגר" : "משתתף"}
            />
          </div>
          <div className="card p-4">
            <StudentNotesTimeline
              studentId={student.id}
              notes={student.notes.map((n) => ({
                id: n.id,
                note: n.note,
                authorName: n.authorName,
                createdAt: n.createdAt.toISOString(),
              }))}
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-4">
            <StudentTaskChecklist
              studentId={student.id}
              title={`רשימת משימות — ${CATEGORY_LABELS[student.category]}`}
              tasks={individualTasks.map((t) => ({
                id: t.id,
                status: t.status,
                notes: t.notes,
                template: { id: t.templateId, title: t.template.title, weight: t.template.weight, order: t.template.order },
              }))}
            />
          </div>

          {atRisk && redirectTasks.length > 0 && (
            <div className="card p-4 border-[#FF3131]/30 grid sm:grid-cols-2 gap-4">
              <RedirectPyramid
                category={CATEGORY_LABELS[student.category]}
                steps={[...redirectTasks]
                  .sort((a, b) => a.template.order - b.template.order)
                  .map((t) => ({ title: t.template.title, status: t.status }))}
              />
              <StudentTaskChecklist
                studentId={student.id}
                title="רשימת שלבי ההכוון"
                tasks={redirectTasks.map((t) => ({
                  id: t.id,
                  status: t.status,
                  notes: t.notes,
                  template: { id: t.templateId, title: t.template.title, weight: t.template.weight, order: t.template.order },
                }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
