/*
  Warnings:

  - You are about to drop the column `resolvedByReporter` on the `Issue` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "IssueResolution" AS ENUM ('REPAIRED', 'REPLACED', 'FIXED_WITHOUT_HANDYMAN', 'FIXED_BY_REPORTER', 'NOT_NEEDED');

-- AlterTable
ALTER TABLE "Appliance" ADD COLUMN     "retiredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "resolvedByReporter",
ADD COLUMN     "resolution" "IssueResolution",
ADD COLUMN     "resolvedByHandymanId" TEXT,
ADD COLUMN     "scheduledFor" DATE,
ADD COLUMN     "scheduledTime" TEXT;

-- CreateIndex
CREATE INDEX "Issue_resolvedByHandymanId_idx" ON "Issue"("resolvedByHandymanId");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_resolvedByHandymanId_fkey" FOREIGN KEY ("resolvedByHandymanId") REFERENCES "Handyman"("id") ON DELETE SET NULL ON UPDATE CASCADE;
