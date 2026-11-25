import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

const RESOLVED_ISSUE_INCLUDE = {
  unit: { select: { name: true } },
  appliance: { select: { category: true, brand: true, model: true } },
  resolvedByHandyman: { select: { name: true } },
} satisfies Prisma.IssueInclude;

class IssueRepository {
  create(
    data: Prisma.IssueUncheckedCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issue.create({ data });
  }

  findById(id: string, db: Prisma.TransactionClient = prisma) {
    return db.issue.findUnique({ where: { id } });
  }

  findDetailsById(id: string, db: Prisma.TransactionClient = prisma) {
    return db.issue.findUnique({
      where: { id },
      include: {
        unit: true,
        appliance: true,
        photos: { orderBy: { createdAt: "asc" } },
        followUps: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  countByUnitIdSince(
    unitId: string,
    since: Date,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issue.count({ where: { unitId, createdAt: { gte: since } } });
  }

  countByUnitId(unitId: string, db: Prisma.TransactionClient = prisma) {
    return db.issue.count({ where: { unitId } });
  }

  listOpenByUnitId(unitId: string, db: Prisma.TransactionClient = prisma) {
    return db.issue.findMany({
      where: { unitId, status: { not: "RESOLVED" } },
      orderBy: { createdAt: "desc" },
    });
  }

  listOpenByOrganizationId(
    organizationId: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issue.findMany({
      where: { unit: { organizationId }, status: { not: "RESOLVED" } },
      include: { unit: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  listResolvedByUnitId(unitId: string, db: Prisma.TransactionClient = prisma) {
    return db.issue.findMany({
      where: { unitId, status: "RESOLVED" },
      include: RESOLVED_ISSUE_INCLUDE,
      orderBy: { resolvedAt: "desc" },
    });
  }

  listResolvedByApplianceId(
    applianceId: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issue.findMany({
      where: { applianceId, status: "RESOLVED" },
      include: RESOLVED_ISSUE_INCLUDE,
      orderBy: { resolvedAt: "desc" },
    });
  }

  listResolvedByOrganizationId(
    organizationId: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issue.findMany({
      where: { unit: { organizationId }, status: "RESOLVED" },
      include: RESOLVED_ISSUE_INCLUDE,
      orderBy: { resolvedAt: "desc" },
    });
  }

  update(
    id: string,
    data: Prisma.IssueUncheckedUpdateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.issue.update({ where: { id }, data });
  }
}

const issueRepository = new IssueRepository();
export default issueRepository;
