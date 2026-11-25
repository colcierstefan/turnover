import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";
import type { UserLanguage } from "@turnover/db/enums";

class IssueSummaryRepository {
  findByOrganizationIdAndLanguage(
    organizationId: string,
    language: UserLanguage,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issueSummary.findUnique({
      where: { organizationId_language: { organizationId, language } },
    });
  }

  upsert(
    data: Readonly<{
      organizationId: string;
      language: UserLanguage;
      factsFingerprint: string;
      content: Prisma.InputJsonValue;
    }>,
    db: Prisma.TransactionClient = prisma,
  ) {
    const { organizationId, language, factsFingerprint, content } = data;
    return db.issueSummary.upsert({
      where: { organizationId_language: { organizationId, language } },
      create: data,
      update: { factsFingerprint, content, createdAt: new Date() },
    });
  }
}

const issueSummaryRepository = new IssueSummaryRepository();
export default issueSummaryRepository;
