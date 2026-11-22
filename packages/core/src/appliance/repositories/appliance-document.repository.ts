import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

class ApplianceDocumentRepository {
  create(
    data: Prisma.ApplianceDocumentUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.applianceDocument.create({ data });
  }

  countByDocumentId(documentId: string, db: Prisma.TransactionClient = prisma) {
    return db.applianceDocument.count({ where: { documentId } });
  }
}

const applianceDocumentRepository = new ApplianceDocumentRepository();
export default applianceDocumentRepository;
