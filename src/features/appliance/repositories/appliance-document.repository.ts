import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";

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
