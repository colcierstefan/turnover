-- CreateTable
CREATE TABLE "IssueSummary" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "language" "UserLanguage" NOT NULL,
    "factsFingerprint" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IssueSummary_organizationId_language_key" ON "IssueSummary"("organizationId", "language");

-- AddForeignKey
ALTER TABLE "IssueSummary" ADD CONSTRAINT "IssueSummary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
