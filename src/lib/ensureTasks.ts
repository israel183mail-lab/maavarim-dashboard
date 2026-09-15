import { prisma } from "@/lib/prisma";
import type { StudentCategory, AxisType } from "@prisma/client";

const ACADEMIC_YEAR = 'תשפ"ו';

// Lazily creates this year's StudentTask rows for a student's category so a
// freshly-registered student (or one that just entered risk) has its
// checklist ready to check off, instead of requiring a separate admin step.
export async function ensureStudentTasks(studentId: string, category: StudentCategory, axisType: Extract<AxisType, "INDIVIDUAL" | "REDIRECT">) {
  const templates = await prisma.taskTemplate.findMany({ where: { category, axisType } });
  for (const template of templates) {
    await prisma.studentTask.upsert({
      where: { studentId_templateId_academicYear: { studentId, templateId: template.id, academicYear: ACADEMIC_YEAR } },
      update: {},
      create: { studentId, templateId: template.id, academicYear: ACADEMIC_YEAR },
    });
  }
}

export { ACADEMIC_YEAR };
