-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COORDINATOR', 'MANAGER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('TALMUD_TORAH', 'YESHIVA_KTANA', 'OTHER');

-- CreateEnum
CREATE TYPE "StudentCategory" AS ENUM ('GRADE_8', 'YESHIVA_1', 'ALUMNI_2', 'ALUMNI_3');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NORMAL', 'IN_REVIEW', 'ELEVATED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DROPPED');

-- CreateEnum
CREATE TYPE "AxisType" AS ENUM ('GROUP', 'INDIVIDUAL', 'REDIRECT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'DELAYED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "MomentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COORDINATOR',
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL DEFAULT 'YESHIVA_KTANA',
    "city" TEXT,
    "address" TEXT,
    "principalName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "websiteUrl" TEXT,
    "info" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "internalCode" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "city" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "parentPhone" TEXT,
    "familyStatusNotes" TEXT NOT NULL DEFAULT '',
    "currentInstitutionId" TEXT,
    "coordinatorId" TEXT NOT NULL,
    "category" "StudentCategory" NOT NULL DEFAULT 'GRADE_8',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'NORMAL',
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitDate" TIMESTAMP(3),
    "exitReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskChange" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "previousRisk" "RiskLevel" NOT NULL,
    "newRisk" "RiskLevel" NOT NULL,
    "changedById" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTransfer" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fromInstitutionId" TEXT,
    "toInstitutionId" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL DEFAULT '',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "axisType" "AxisType" NOT NULL,
    "category" "StudentCategory",
    "targetMonth" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTask" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "skipReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupTask" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "plannedDate" TIMESTAMP(3),
    "executedDate" TIMESTAMP(3),
    "description" TEXT NOT NULL DEFAULT '',
    "attendeesCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentNote" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MomentOfTransition" (
    "id" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "storyText" TEXT NOT NULL,
    "status" "MomentStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "academicYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MomentOfTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "fileUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_internalCode_key" ON "Student"("internalCode");

-- CreateIndex
CREATE INDEX "Student_coordinatorId_idx" ON "Student"("coordinatorId");

-- CreateIndex
CREATE INDEX "Student_riskLevel_idx" ON "Student"("riskLevel");

-- CreateIndex
CREATE INDEX "Student_category_idx" ON "Student"("category");

-- CreateIndex
CREATE INDEX "RiskChange_studentId_idx" ON "RiskChange"("studentId");

-- CreateIndex
CREATE INDEX "RiskChange_createdAt_idx" ON "RiskChange"("createdAt");

-- CreateIndex
CREATE INDEX "StudentTransfer_studentId_idx" ON "StudentTransfer"("studentId");

-- CreateIndex
CREATE INDEX "TaskTemplate_axisType_idx" ON "TaskTemplate"("axisType");

-- CreateIndex
CREATE INDEX "TaskTemplate_category_idx" ON "TaskTemplate"("category");

-- CreateIndex
CREATE INDEX "StudentTask_studentId_idx" ON "StudentTask"("studentId");

-- CreateIndex
CREATE INDEX "StudentTask_status_idx" ON "StudentTask"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTask_studentId_templateId_academicYear_key" ON "StudentTask"("studentId", "templateId", "academicYear");

-- CreateIndex
CREATE INDEX "GroupTask_institutionId_idx" ON "GroupTask"("institutionId");

-- CreateIndex
CREATE INDEX "GroupTask_coordinatorId_idx" ON "GroupTask"("coordinatorId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupTask_institutionId_templateId_academicYear_key" ON "GroupTask"("institutionId", "templateId", "academicYear");

-- CreateIndex
CREATE INDEX "StudentNote_studentId_idx" ON "StudentNote"("studentId");

-- CreateIndex
CREATE INDEX "MomentOfTransition_coordinatorId_idx" ON "MomentOfTransition"("coordinatorId");

-- CreateIndex
CREATE INDEX "MomentOfTransition_academicYear_idx" ON "MomentOfTransition"("academicYear");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_currentInstitutionId_fkey" FOREIGN KEY ("currentInstitutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskChange" ADD CONSTRAINT "RiskChange_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskChange" ADD CONSTRAINT "RiskChange_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTransfer" ADD CONSTRAINT "StudentTransfer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTransfer" ADD CONSTRAINT "StudentTransfer_fromInstitutionId_fkey" FOREIGN KEY ("fromInstitutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTransfer" ADD CONSTRAINT "StudentTransfer_toInstitutionId_fkey" FOREIGN KEY ("toInstitutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTransfer" ADD CONSTRAINT "StudentTransfer_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupTask" ADD CONSTRAINT "GroupTask_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupTask" ADD CONSTRAINT "GroupTask_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupTask" ADD CONSTRAINT "GroupTask_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MomentOfTransition" ADD CONSTRAINT "MomentOfTransition_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MomentOfTransition" ADD CONSTRAINT "MomentOfTransition_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
