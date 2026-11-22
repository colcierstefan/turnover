-- CreateEnum
CREATE TYPE "HandymanTrade" AS ENUM ('PLUMBER', 'ELECTRICIAN', 'APPLIANCE_TECHNICIAN', 'AC_TECHNICIAN', 'LOCKSMITH', 'GENERAL_HANDYMAN');

-- CreateTable
CREATE TABLE "Handyman" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "trades" "HandymanTrade"[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Handyman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandymanMessage" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "handymanId" TEXT,
    "recipientName" TEXT,
    "recipientPhone" TEXT,
    "textRo" TEXT NOT NULL,
    "textEn" TEXT,
    "openedInWhatsAppAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandymanMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Handyman_organizationId_phone_key" ON "Handyman"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "HandymanMessage_issueId_idx" ON "HandymanMessage"("issueId");

-- CreateIndex
CREATE INDEX "HandymanMessage_handymanId_idx" ON "HandymanMessage"("handymanId");

-- AddForeignKey
ALTER TABLE "Handyman" ADD CONSTRAINT "Handyman_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandymanMessage" ADD CONSTRAINT "HandymanMessage_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandymanMessage" ADD CONSTRAINT "HandymanMessage_handymanId_fkey" FOREIGN KEY ("handymanId") REFERENCES "Handyman"("id") ON DELETE SET NULL ON UPDATE CASCADE;
