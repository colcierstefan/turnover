import "server-only";

import { NotFoundError } from "@turnover/core/lib/errors";
import { bucket } from "@turnover/core/lib/storage";
import organizationService from "@turnover/core/organization/services/organization.service";
import unitRepository from "@turnover/core/unit/repositories/unit.repository";
import type {
  CreateUnitInput,
  UpdateUnitInput,
} from "@turnover/core/unit/schemas/unit.schema";
import { getUnitStoragePrefix } from "@turnover/core/utils/storage.utils";
import { generateToken } from "@turnover/core/utils/token.utils";

class UnitService {
  async listUnits(userId: string) {
    const membership = await organizationService.requireMembership(userId);
    return unitRepository.listByOrganizationId(membership.organizationId);
  }

  async getUnit(userId: string, unitId: string) {
    const unit = await unitRepository.findById(unitId);
    if (!unit) throw new NotFoundError(`Unit ${unitId} not found`);
    await organizationService.requireMembership(userId, unit.organizationId);
    return unit;
  }

  async createUnit(userId: string, input: CreateUnitInput) {
    const membership = await organizationService.requireMembership(userId);
    return unitRepository.create({
      organizationId: membership.organizationId,
      name: input.name,
      address: input.address,
      reportToken: generateToken(),
    });
  }

  async updateUnit(userId: string, input: UpdateUnitInput) {
    await this.getUnit(userId, input.unitId);
    return unitRepository.update(input.unitId, {
      name: input.name,
      address: input.address,
    });
  }

  async deleteUnit(userId: string, unitId: string) {
    await this.getUnit(userId, unitId);
    await unitRepository.delete(unitId);
    await bucket.deleteFiles({ prefix: getUnitStoragePrefix(unitId) });
  }

  async regenerateReportToken(userId: string, unitId: string) {
    await this.getUnit(userId, unitId);
    return unitRepository.update(unitId, {
      reportToken: generateToken(),
      reportTokenRotatedAt: new Date(),
    });
  }

  getUnitByReportToken(reportToken: string) {
    return unitRepository.findByReportToken(reportToken);
  }
}

const unitService = new UnitService();
export default unitService;
