import { beforeEach, describe, expect, it, vi } from "vitest";

import applianceDocumentRepository from "@turnover/core/appliance/repositories/appliance-document.repository";
import applianceRepository from "@turnover/core/appliance/repositories/appliance.repository";
import documentRepository from "@turnover/core/appliance/repositories/document.repository";
import applianceService from "@turnover/core/appliance/services/appliance.service";
import { ForbiddenError } from "@turnover/core/lib/errors";
import { bucket } from "@turnover/core/lib/storage";
import unitService from "@turnover/core/unit/services/unit.service";
import { Prisma } from "@turnover/db/client";

vi.mock("@turnover/core/lib/db", () => ({
  default: {
    $transaction: vi.fn((run: (transaction: unknown) => unknown) =>
      run("transaction"),
    ),
  },
}));
vi.mock("@turnover/core/lib/storage", () => ({ bucket: { file: vi.fn() } }));
vi.mock("@turnover/core/unit/services/unit.service", () => ({
  default: { getUnit: vi.fn() },
}));
vi.mock("@turnover/core/appliance/repositories/appliance.repository", () => ({
  default: {
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countByUnitId: vi.fn(),
  },
}));
vi.mock("@turnover/core/appliance/repositories/document.repository", () => ({
  default: { delete: vi.fn(), countByUnitId: vi.fn() },
}));
vi.mock(
  "@turnover/core/appliance/repositories/appliance-document.repository",
  () => ({ default: { countByDocumentId: vi.fn() } }),
);

const storedFile = { delete: vi.fn() };

const buildDocument = (id: string) => ({
  id,
  unitId: "unit-1",
  kind: "INVOICE" as const,
  storagePath: `units/unit-1/documents/${id}`,
  contentType: "application/pdf",
  extractedData: null,
  reviewedAt: new Date("2026-11-21T00:00:00Z"),
  createdAt: new Date("2026-11-21T00:00:00Z"),
});

const appliance = {
  id: "appliance-1",
  unitId: "unit-1",
  category: "FRIDGE" as const,
  brand: "Arctic",
  model: null,
  serialNumber: null,
  manufactureDate: null,
  purchaseDate: null,
  purchasePriceRon: new Prisma.Decimal("1899.99"),
  warrantyUntil: null,
  notes: null,
  retiredAt: null,
  createdAt: new Date("2026-11-21T00:00:00Z"),
  documents: [
    {
      applianceId: "appliance-1",
      documentId: "shared",
      document: buildDocument("shared"),
    },
    {
      applianceId: "appliance-1",
      documentId: "own",
      document: buildDocument("own"),
    },
  ],
};

describe("ApplianceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bucket.file).mockReturnValue(
      storedFile as unknown as ReturnType<typeof bucket.file>,
    );
    vi.mocked(applianceRepository.findById).mockResolvedValue(appliance);
  });

  describe("getAppliance", () => {
    it("returns the price as a number and the linked documents", async () => {
      const result = await applianceService.getAppliance(
        "user-1",
        "appliance-1",
      );

      expect(result.purchasePriceRon).toBe(1899.99);
      expect(result.documents.map((document) => document.id)).toEqual([
        "shared",
        "own",
      ]);
      expect(unitService.getUnit).toHaveBeenCalledWith("user-1", "unit-1");
    });

    it("throws a ForbiddenError for an appliance in another organization", async () => {
      vi.mocked(unitService.getUnit).mockRejectedValueOnce(
        new ForbiddenError("not a member"),
      );

      await expect(
        applianceService.getAppliance("user-1", "appliance-1"),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("retireAppliance", () => {
    it("marks the appliance retired", async () => {
      await applianceService.retireAppliance("user-1", "appliance-1");

      expect(applianceRepository.update).toHaveBeenCalledWith("appliance-1", {
        retiredAt: expect.any(Date),
      });
    });

    it("throws a ForbiddenError for an appliance in another organization", async () => {
      vi.mocked(unitService.getUnit).mockRejectedValueOnce(
        new ForbiddenError("not a member"),
      );

      await expect(
        applianceService.retireAppliance("user-1", "appliance-1"),
      ).rejects.toThrow(ForbiddenError);
      expect(applianceRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteAppliance", () => {
    it("deletes documents no other appliance uses, with their files, and keeps shared ones", async () => {
      vi.mocked(
        applianceDocumentRepository.countByDocumentId,
      ).mockImplementation(
        (documentId) => (documentId === "shared" ? 1 : 0) as never,
      );

      await applianceService.deleteAppliance("user-1", "appliance-1");

      expect(applianceRepository.delete).toHaveBeenCalledWith(
        "appliance-1",
        "transaction",
      );
      expect(documentRepository.delete).toHaveBeenCalledTimes(1);
      expect(documentRepository.delete).toHaveBeenCalledWith(
        "own",
        "transaction",
      );
      expect(bucket.file).toHaveBeenCalledTimes(1);
      expect(bucket.file).toHaveBeenCalledWith("units/unit-1/documents/own");
    });
  });

  describe("countUnitContents", () => {
    it("counts the unit's appliances and documents", async () => {
      vi.mocked(applianceRepository.countByUnitId).mockResolvedValue(6);
      vi.mocked(documentRepository.countByUnitId).mockResolvedValue(4);

      expect(
        await applianceService.countUnitContents("user-1", "unit-1"),
      ).toEqual({ applianceCount: 6, documentCount: 4 });
    });
  });
});
