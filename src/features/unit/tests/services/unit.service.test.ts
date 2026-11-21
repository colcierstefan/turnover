import { beforeEach, describe, expect, it, vi } from "vitest";

import organizationService from "@/features/organization/services/organization.service";
import unitRepository from "@/features/unit/repositories/unit.repository";
import unitService from "@/features/unit/services/unit.service";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

vi.mock("@/features/organization/services/organization.service", () => ({
  default: { requireMembership: vi.fn() },
}));
vi.mock("@/features/unit/repositories/unit.repository", () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    findByReportToken: vi.fn(),
    listByOrganizationId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const membership = {
  organizationId: "org-1",
  userId: "user-1",
  role: "MANAGER" as const,
  createdAt: new Date("2026-11-01T00:00:00Z"),
  organization: {
    id: "org-1",
    name: "Cluj Stays",
    createdAt: new Date("2026-11-01T00:00:00Z"),
  },
};

const unit = {
  id: "unit-1",
  organizationId: "org-2",
  name: "Old Town studio",
  address: "Strada Memorandumului 1, Cluj-Napoca",
  reportToken: "report-token-1",
  reportTokenRotatedAt: null,
  createdAt: new Date("2026-11-01T00:00:00Z"),
};

const rejectOtherOrganization = () => {
  vi.mocked(unitRepository.findById).mockResolvedValue(unit);
  vi.mocked(organizationService.requireMembership).mockRejectedValue(
    new ForbiddenError("not a member"),
  );
};

describe("UnitService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listUnits", () => {
    it("lists the units of the user's organization", async () => {
      vi.mocked(organizationService.requireMembership).mockResolvedValue(
        membership,
      );

      await unitService.listUnits("user-1");

      expect(unitRepository.listByOrganizationId).toHaveBeenCalledWith("org-1");
    });

    it("throws a ForbiddenError when the user has no organization", async () => {
      vi.mocked(organizationService.requireMembership).mockRejectedValue(
        new ForbiddenError("no organization"),
      );

      await expect(unitService.listUnits("user-1")).rejects.toThrow(
        ForbiddenError,
      );
      expect(unitRepository.listByOrganizationId).not.toHaveBeenCalled();
    });
  });

  describe("createUnit", () => {
    it("creates the unit in the user's organization with a 32-character report token", async () => {
      vi.mocked(organizationService.requireMembership).mockResolvedValue(
        membership,
      );

      await unitService.createUnit("user-1", {
        name: "Old Town studio",
        address: "Strada Memorandumului 1, Cluj-Napoca",
      });

      const data = vi.mocked(unitRepository.create).mock.calls[0][0];
      expect(data).toMatchObject({
        organizationId: "org-1",
        name: "Old Town studio",
        address: "Strada Memorandumului 1, Cluj-Napoca",
      });
      expect(data.reportToken).toHaveLength(32);
    });

    it("throws a ForbiddenError when the user has no organization", async () => {
      vi.mocked(organizationService.requireMembership).mockRejectedValue(
        new ForbiddenError("no organization"),
      );

      await expect(
        unitService.createUnit("user-1", { name: "A", address: "B" }),
      ).rejects.toThrow(ForbiddenError);
      expect(unitRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getUnit", () => {
    it("checks membership against the unit's organization", async () => {
      vi.mocked(unitRepository.findById).mockResolvedValue(unit);
      vi.mocked(organizationService.requireMembership).mockResolvedValue(
        membership,
      );

      expect(await unitService.getUnit("user-1", "unit-1")).toEqual(unit);
      expect(organizationService.requireMembership).toHaveBeenCalledWith(
        "user-1",
        "org-2",
      );
    });

    it("throws a NotFoundError for an unknown unit", async () => {
      vi.mocked(unitRepository.findById).mockResolvedValue(null);

      await expect(unitService.getUnit("user-1", "missing")).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws a ForbiddenError for a unit of another organization", async () => {
      rejectOtherOrganization();

      await expect(unitService.getUnit("user-1", "unit-1")).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe("updateUnit", () => {
    it("throws a ForbiddenError for a unit of another organization", async () => {
      rejectOtherOrganization();

      await expect(
        unitService.updateUnit("user-1", {
          unitId: "unit-1",
          name: "New name",
          address: "New address",
        }),
      ).rejects.toThrow(ForbiddenError);
      expect(unitRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteUnit", () => {
    it("deletes a unit of the user's organization", async () => {
      vi.mocked(unitRepository.findById).mockResolvedValue(unit);
      vi.mocked(organizationService.requireMembership).mockResolvedValue(
        membership,
      );

      await unitService.deleteUnit("user-1", "unit-1");

      expect(unitRepository.delete).toHaveBeenCalledWith("unit-1");
    });

    it("throws a ForbiddenError for a unit of another organization", async () => {
      rejectOtherOrganization();

      await expect(unitService.deleteUnit("user-1", "unit-1")).rejects.toThrow(
        ForbiddenError,
      );
      expect(unitRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("regenerateReportToken", () => {
    it("replaces the report token and records when it was rotated", async () => {
      vi.mocked(unitRepository.findById).mockResolvedValue(unit);
      vi.mocked(organizationService.requireMembership).mockResolvedValue(
        membership,
      );

      await unitService.regenerateReportToken("user-1", "unit-1");

      const [id, data] = vi.mocked(unitRepository.update).mock.calls[0];
      expect(id).toBe("unit-1");
      expect(data.reportToken).toHaveLength(32);
      expect(data.reportToken).not.toBe(unit.reportToken);
      expect(data.reportTokenRotatedAt).toBeInstanceOf(Date);
    });

    it("throws a ForbiddenError for a unit of another organization", async () => {
      rejectOtherOrganization();

      await expect(
        unitService.regenerateReportToken("user-1", "unit-1"),
      ).rejects.toThrow(ForbiddenError);
      expect(unitRepository.update).not.toHaveBeenCalled();
    });
  });
});
