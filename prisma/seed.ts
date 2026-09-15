import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const ACADEMIC_YEAR = "תשפ\"ו";

async function main() {
  const passwordHash = await bcrypt.hash("Maavarim2026!", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@maavarim.org.il" },
    update: {},
    create: {
      name: "מנהל מערכת",
      email: "admin@maavarim.org.il",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@maavarim.org.il" },
    update: {},
    create: {
      name: "מנהלת תוכנית",
      email: "manager@maavarim.org.il",
      passwordHash,
      role: "MANAGER",
    },
  });

  const coordinatorNames = [
    ["עדו כהן", "ido@maavarim.org.il"],
    ["שמחה פישר", "simcha@maavarim.org.il"],
    ["גבריאל מלכן", "gavriel@maavarim.org.il"],
    ["אלעד חדד", "elad@maavarim.org.il"],
    ["נהוראי לוי", "nehorai@maavarim.org.il"],
  ];
  const coordinators = [];
  for (const [name, email] of coordinatorNames) {
    coordinators.push(
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: { name, email, passwordHash, role: "COORDINATOR" },
      })
    );
  }

  const institutionData: { name: string; city: string }[] = [
    { name: "חזון מאיר", city: "בני ברק" },
    { name: "עטרת שלמה", city: "ירושלים" },
    { name: "חדוות התורה", city: "אלעד" },
    { name: "אור ישראל", city: "מודיעין עילית" },
    { name: "נזר התלמוד", city: "בית שמש" },
  ];
  const institutions = [];
  for (const inst of institutionData) {
    const existing = await prisma.institution.findFirst({ where: { name: inst.name } });
    institutions.push(
      existing ??
        (await prisma.institution.create({
          data: { name: inst.name, city: inst.city, type: "YESHIVA_KTANA" },
        }))
    );
  }

  // ---- Task templates: individual axis, exact weights from the spec ----
  const grade8Steps: [string, number][] = [
    ["פגישת היכרות", 18],
    ["מיפוי תלמידים", 18],
    ["פגישת אינטייק", 18],
    ["פגישה שניה", 18],
    ["סודר בישיבה", 18],
    ["מפגש אישי סיכום שנה - סיום", 10],
  ];
  const yeshiva1Steps: [string, number][] = [
    ["ביקור בישיבה והיכרות עם הצוות", 12.5],
    ["הגדרת רמת סיכון", 12.5],
    ["ביקור שני בישיבה", 12.5],
    ["ביקור קיץ", 12.5],
    ["בחירת רמת ליווי לשנה הבאה", 12.5],
    ["ביקור אחרון בישיבה", 12.5],
    ["טלפון לפני סיום תהליך", 12.5],
    ["מילוי כרטיס סיום תהליך", 12.5],
  ];
  const alumniSteps: [string, number][] = [
    ["ביקור בישיבה", 25],
    ["המשך מעקב", 25],
    ["טלפון לפני סיום תהליך", 25],
    ["מילוי כרטיס לפני סיום תהליך", 25],
  ];
  const redirectSteps: Record<string, string[]> = {
    GRADE_8: ["פגישת הורים + צוות", "התאמת מסגרת", "קביעת מבחן"],
    YESHIVA_1: [
      "שיחה אישית מחוץ לישיבה + צוות/הורים",
      "חיפוש מסגרת חילופית",
      "מציאת מסגרת והמשך מעקב",
      "ביקור נוסף - עד שבועיים",
      "ביקור קיץ (לכתומים)",
    ],
    ALUMNI_2: ["שיחה אישית מחוץ לישיבה + צוות/הורים", "חיפוש מסגרת חילופית", "מציאת מסגרת והמשך מעקב"],
    ALUMNI_3: ["שיחה אישית מחוץ לישיבה + צוות/הורים", "חיפוש מסגרת חילופית", "מציאת מסגרת והמשך מעקב"],
  };

  async function seedIndividualSteps(category: "GRADE_8" | "YESHIVA_1" | "ALUMNI_2" | "ALUMNI_3", steps: [string, number][]) {
    const created = [];
    let order = 0;
    for (const [title, weight] of steps) {
      order += 1;
      const existing = await prisma.taskTemplate.findFirst({ where: { title, category, axisType: "INDIVIDUAL" } });
      created.push(
        existing ??
          (await prisma.taskTemplate.create({
            data: { title, axisType: "INDIVIDUAL", category, weight, order, isMandatory: true },
          }))
      );
    }
    order = 100;
    for (const title of redirectSteps[category]) {
      order += 1;
      const existing = await prisma.taskTemplate.findFirst({ where: { title, category, axisType: "REDIRECT" } });
      if (!existing) {
        await prisma.taskTemplate.create({
          data: { title, axisType: "REDIRECT", category, weight: 0, order, isMandatory: false },
        });
      }
    }
    return created;
  }

  const grade8Templates = await seedIndividualSteps("GRADE_8", grade8Steps);
  const yeshiva1Templates = await seedIndividualSteps("YESHIVA_1", yeshiva1Steps);
  const alumni2Templates = await seedIndividualSteps("ALUMNI_2", alumniSteps);
  const alumni3Templates = await seedIndividualSteps("ALUMNI_3", alumniSteps);

  // ---- Group axis templates (monthly breakdown, ch.10 of the spec) ----
  const groupSteps: [string, string, number][] = [
    ["פגישת פתיחה עם המנהל/מחנך", "אלול/תשרי", 15],
    ["רישום נוכחות ותיאור פעילות", "חשוון", 15],
    ["סדנה 1", "כסלו", 10],
    ["סדנה 2", "טבת", 10],
    ["סדנה 3", "שבט", 10],
    ["ערב הכנה וישיבת הורים", "אדר/ניסן", 15],
    ["פעילות חוץ מגובשת", "אייר/סיון", 15],
    ["מפגש סיכום שנה", "תמוז", 10],
  ];
  const groupTemplates = [];
  let gOrder = 0;
  for (const [title, month, weight] of groupSteps) {
    gOrder += 1;
    const existing = await prisma.taskTemplate.findFirst({ where: { title, axisType: "GROUP", targetMonth: month } });
    groupTemplates.push(
      existing ??
        (await prisma.taskTemplate.create({
          data: { title, axisType: "GROUP", targetMonth: month, weight, order: gOrder, isMandatory: true },
        }))
    );
  }

  // ---- Group task instances for this academic year, one set per institution ----
  for (let i = 0; i < institutions.length; i++) {
    const inst = institutions[i];
    const coord = coordinators[i % coordinators.length];
    for (let t = 0; t < groupTemplates.length; t++) {
      const tmpl = groupTemplates[t];
      const done = t < institutions.length - i; // vary completion per institution
      const existing = await prisma.groupTask.findFirst({
        where: { institutionId: inst.id, templateId: tmpl.id, academicYear: ACADEMIC_YEAR },
      });
      if (!existing) {
        await prisma.groupTask.create({
          data: {
            institutionId: inst.id,
            templateId: tmpl.id,
            coordinatorId: coord.id,
            academicYear: ACADEMIC_YEAR,
            status: done ? "COMPLETED" : "PENDING",
            executedDate: done ? new Date() : null,
          },
        });
      }
    }
  }

  // ---- Sample students ----
  const studentSeed: {
    firstName: string;
    lastName: string;
    category: "GRADE_8" | "YESHIVA_1" | "ALUMNI_2" | "ALUMNI_3";
    risk: "NORMAL" | "IN_REVIEW" | "ELEVATED" | "CRITICAL";
    coordinatorIdx: number;
    institutionIdx: number;
    completedCount: number;
  }[] = [
    { firstName: "יצחק", lastName: "אזולאי", category: "GRADE_8", risk: "IN_REVIEW", coordinatorIdx: 0, institutionIdx: 0, completedCount: 2 },
    { firstName: "יונתן", lastName: "בארי", category: "YESHIVA_1", risk: "NORMAL", coordinatorIdx: 0, institutionIdx: 2, completedCount: 5 },
    { firstName: "יחיאל", lastName: "ג'רופי", category: "ALUMNI_2", risk: "NORMAL", coordinatorIdx: 1, institutionIdx: 1, completedCount: 3 },
    { firstName: "עילאי", lastName: "דהן", category: "ALUMNI_3", risk: "CRITICAL", coordinatorIdx: 2, institutionIdx: 3, completedCount: 1 },
    { firstName: "מנחם", lastName: "כהן", category: "GRADE_8", risk: "NORMAL", coordinatorIdx: 1, institutionIdx: 0, completedCount: 4 },
    { firstName: "שלמה", lastName: "פרידמן", category: "YESHIVA_1", risk: "ELEVATED", coordinatorIdx: 2, institutionIdx: 4, completedCount: 3 },
    { firstName: "אריאל", lastName: "וייס", category: "GRADE_8", risk: "NORMAL", coordinatorIdx: 3, institutionIdx: 2, completedCount: 6 },
    { firstName: "דוד", lastName: "מזרחי", category: "YESHIVA_1", risk: "NORMAL", coordinatorIdx: 4, institutionIdx: 3, completedCount: 8 },
    { firstName: "נתנאל", lastName: "אוחיון", category: "ALUMNI_2", risk: "IN_REVIEW", coordinatorIdx: 0, institutionIdx: 1, completedCount: 2 },
    { firstName: "יוסף", lastName: "בן שושן", category: "GRADE_8", risk: "ELEVATED", coordinatorIdx: 4, institutionIdx: 0, completedCount: 3 },
  ];

  const templatesByCategory: Record<string, { id: string; weight: number }[]> = {
    GRADE_8: grade8Templates,
    YESHIVA_1: yeshiva1Templates,
    ALUMNI_2: alumni2Templates,
    ALUMNI_3: alumni3Templates,
  };

  for (const s of studentSeed) {
    const inst = institutions[s.institutionIdx];
    const coord = coordinators[s.coordinatorIdx];
    let student = await prisma.student.findFirst({ where: { firstName: s.firstName, lastName: s.lastName } });
    if (!student) {
      student = await prisma.student.create({
        data: {
          firstName: s.firstName,
          lastName: s.lastName,
          category: s.category,
          riskLevel: s.risk,
          status: "ACTIVE",
          coordinatorId: coord.id,
          currentInstitutionId: inst.id,
          city: inst.city,
        },
      });
    }

    const templates = templatesByCategory[s.category];
    for (let i = 0; i < templates.length; i++) {
      const tmpl = templates[i];
      const completed = i < s.completedCount;
      const existing = await prisma.studentTask.findFirst({
        where: { studentId: student.id, templateId: tmpl.id, academicYear: ACADEMIC_YEAR },
      });
      if (!existing) {
        await prisma.studentTask.create({
          data: {
            studentId: student.id,
            templateId: tmpl.id,
            academicYear: ACADEMIC_YEAR,
            status: completed ? "COMPLETED" : "PENDING",
            completedAt: completed ? new Date() : null,
          },
        });
      }
    }

    const noteCount = await prisma.studentNote.count({ where: { studentId: student.id } });
    if (noteCount === 0) {
      await prisma.studentNote.create({
        data: {
          studentId: student.id,
          authorId: coord.id,
          authorName: coord.name,
          note: "שיחת טלפון ראשונית עם התלמיד וההורים, הכל תקין.",
        },
      });
    }
  }

  // ---- Sample "רגע של מעבר" moments ----
  const momentSeed = [
    { coordIdx: 0, story: "יצחק סוף סוף נרשם לישיבה שהוא תמיד רצה, אחרי חודשיים של חיפושים!", status: "APPROVED" as const },
    { coordIdx: 1, story: "יחיאל התקשר בעצמו לספר שהוא מתאקלם מצוין, גאווה גדולה.", status: "APPROVED" as const },
    { coordIdx: 2, story: "אחרי שיחה קשה עם ההורים, הצלחנו למצוא מסגרת חלופית לשלמה.", status: "PENDING" as const },
  ];
  for (const m of momentSeed) {
    const coord = coordinators[m.coordIdx];
    const existing = await prisma.momentOfTransition.findFirst({
      where: { coordinatorId: coord.id, storyText: m.story },
    });
    if (!existing) {
      await prisma.momentOfTransition.create({
        data: {
          coordinatorId: coord.id,
          storyText: m.story,
          status: m.status,
          academicYear: ACADEMIC_YEAR,
          approvedById: m.status === "APPROVED" ? manager.id : null,
        },
      });
    }
  }

  const annCount = await prisma.announcement.count();
  if (annCount === 0) {
    await prisma.announcement.create({
      data: {
        title: "פתיחת שנת הלימודים תשפ\"ו",
        body: "בהצלחה לכל הרכזים בתחילת שנת הפעילות! נא לעדכן את רשימת התלמידים באזור הרישום.",
        createdById: superAdmin.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Login: admin@maavarim.org.il / manager@maavarim.org.il / " + coordinatorNames.map(([, e]) => e).join(", "));
  console.log("Password for all: Maavarim2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
