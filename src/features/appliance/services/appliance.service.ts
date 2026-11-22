import "server-only";

import applianceDocumentRepository from "@/features/appliance/repositories/appliance-document.repository";
import applianceRepository from "@/features/appliance/repositories/appliance.repository";
import documentRepository from "@/features/appliance/repositories/document.repository";
import type {
  CreateApplianceInput,
  UpdateApplianceInput,
} from "@/features/appliance/schemas/appliance.schema";
import {
  toApplianceData,
  toApplianceView,
} from "@/features/appliance/utils/appliance.utils";
import unitService from "@/features/unit/services/unit.service";
import prisma from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { bucket } from "@/lib/storage";

class ApplianceService {
  async listAppliances(userId: string, unitId: string) {
    await unitService.getUnit(userId, unitId);
    const appliances = await applianceRepository.listByUnitId(unitId);
    return appliances.map(toApplianceView);
  }

  async getAppliance(userId: string, applianceId: string) {
    const appliance = await applianceRepository.findById(applianceId);
    if (!appliance)
      throw new NotFoundError(`Appliance ${applianceId} not found`);
    await unitService.getUnit(userId, appliance.unitId);
    return {
      ...toApplianceView(appliance),
      documents: appliance.documents.map((link) => link.document),
    };
  }

  async createAppliance(userId: string, input: CreateApplianceInput) {
    const { unitId, ...fields } = input;
    await unitService.getUnit(userId, unitId);
    return applianceRepository.create({ unitId, ...toApplianceData(fields) });
  }

  async updateAppliance(userId: string, input: UpdateApplianceInput) {
    const { applianceId, ...fields } = input;
    await this.getAppliance(userId, applianceId);
    await applianceRepository.update(applianceId, toApplianceData(fields));
  }

  async deleteAppliance(userId: string, applianceId: string) {
    const appliance = await this.getAppliance(userId, applianceId);

    const orphanedDocuments = await prisma.$transaction(async (transaction) => {
      await applianceRepository.delete(applianceId, transaction);
      const orphaned = [];
      for (const document of appliance.documents) {
        const linkCount = await applianceDocumentRepository.countByDocumentId(
          document.id,
          transaction,
        );
        if (linkCount === 0) {
          await documentRepository.delete(document.id, transaction);
          orphaned.push(document);
        }
      }
      return orphaned;
    });

    await Promise.all(
      orphanedDocuments.map((document) =>
        bucket.file(document.storagePath).delete({ ignoreNotFound: true }),
      ),
    );
    return appliance;
  }

  async countUnitContents(userId: string, unitId: string) {
    await unitService.getUnit(userId, unitId);
    const [applianceCount, documentCount] = await Promise.all([
      applianceRepository.countByUnitId(unitId),
      documentRepository.countByUnitId(unitId),
    ]);
    return { applianceCount, documentCount };
  }
}

const applianceService = new ApplianceService();
export default applianceService;
