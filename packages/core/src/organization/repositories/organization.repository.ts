import "server-only";

import prisma from "@turnover/core/lib/db";
import type { Prisma } from "@turnover/db/client";

class OrganizationRepository {
  create(
    data: Prisma.OrganizationCreateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.organization.create({ data });
  }

  update(
    id: string,
    data: Prisma.OrganizationUpdateInput,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.organization.update({ where: { id }, data });
  }
}

const organizationRepository = new OrganizationRepository();
export default organizationRepository;
