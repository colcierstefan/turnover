import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

class IssueFollowUpRepository {
  createMany(
    data: ReadonlyArray<Prisma.IssueFollowUpCreateManyInput>,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issueFollowUp.createManyAndReturn({ data: [...data] });
  }

  listByIssueId(issueId: string, db: Prisma.TransactionClient = prisma) {
    return db.issueFollowUp.findMany({
      where: { issueId },
      orderBy: { createdAt: "asc" },
    });
  }

  update(
    id: string,
    data: Prisma.IssueFollowUpUncheckedUpdateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issueFollowUp.update({ where: { id }, data });
  }
}

const issueFollowUpRepository = new IssueFollowUpRepository();
export default issueFollowUpRepository;
