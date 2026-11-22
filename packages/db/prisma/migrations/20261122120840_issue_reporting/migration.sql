-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('NEW', 'DIAGNOSED', 'CONTACTED', 'SCHEDULED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('SELF_FIX', 'PART', 'REPAIR', 'REPLACE');

-- CreateEnum
CREATE TYPE "ReporterRole" AS ENUM ('GUEST', 'CLEANER', 'MANAGER');

-- CreateEnum
CREATE TYPE "ReporterLanguage" AS ENUM ('EN', 'RO');

-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('GAS_SMELL', 'WATER_LEAK', 'ELECTRICAL_BURNING');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "contactPhone" TEXT;

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "applianceId" TEXT,
    "reporterRole" "ReporterRole" NOT NULL,
    "reporterName" TEXT,
    "reporterLanguage" "ReporterLanguage" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'NEW',
    "category" "IssueCategory",
    "diagnosis" JSONB,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "emergencyType" "EmergencyType",
    "selfHelpTips" JSONB,
    "resolvedByReporter" BOOLEAN NOT NULL DEFAULT false,
    "costRon" DECIMAL(10,2),
    "costNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssuePhoto" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssuePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueFollowUp" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Issue_unitId_createdAt_idx" ON "Issue"("unitId", "createdAt");

-- CreateIndex
CREATE INDEX "Issue_applianceId_idx" ON "Issue"("applianceId");

-- CreateIndex
CREATE INDEX "IssuePhoto_issueId_idx" ON "IssuePhoto"("issueId");

-- CreateIndex
CREATE INDEX "IssueFollowUp_issueId_idx" ON "IssueFollowUp"("issueId");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_applianceId_fkey" FOREIGN KEY ("applianceId") REFERENCES "Appliance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuePhoto" ADD CONSTRAINT "IssuePhoto_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueFollowUp" ADD CONSTRAINT "IssueFollowUp_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
