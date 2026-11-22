import { beforeEach, describe, expect, it, vi } from "vitest";

import applianceDocumentRepository from "@turnover/core/appliance/repositories/appliance-document.repository";
import applianceRepository from "@turnover/core/appliance/repositories/appliance.repository";
import documentRepository from "@turnover/core/appliance/repositories/document.repository";
import documentService from "@turnover/core/appliance/services/document.service";
import invoiceExtractionService from "@turnover/core/appliance/services/invoice-extraction.service";
import labelExtractionService from "@turnover/core/appliance/services/label-extraction.service";
import { ForbiddenError, ValidationError } from "@turnover/core/lib/errors";
import { bucket } from "@turnover/core/lib/storage";
import unitService from "@turnover/core/unit/services/unit.service";

vi.mock("@turnover/core/lib/db", () => ({
  default: {
    $transaction: vi.fn((run: (transaction: unknown) => unknown) =>
      run("transaction"),
    ),
  },
}));
vi.mock("@turnover/core/lib/logger", () => ({ default: { error: vi.fn() } }));
vi.mock("@turnover/core/lib/storage", () => ({
  bucket: { name: "test-bucket", file: vi.fn() },
}));
vi.mock("@turnover/core/appliance/services/label-extraction.service", () => ({
  default: { extract: vi.fn() },
}));
vi.mock("@turnover/core/appliance/services/invoice-extraction.service", () => ({
  default: { extract: vi.fn() },
}));
vi.mock("@turnover/core/unit/services/unit.service", () => ({
  default: { getUnit: vi.fn() },
}));
vi.mock("@turnover/core/appliance/repositories/document.repository", () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("@turnover/core/appliance/repositories/appliance.repository", () => ({
  default: { create: vi.fn() },
}));
vi.mock(
  "@turnover/core/appliance/repositories/appliance-document.repository",
  () => ({ default: { create: vi.fn() } }),
);

const unitId = "6f1c2a52-6b9e-4d55-9a57-0a1d3c1f0a11";
const documentId = "0c7a3d7e-2f4b-4f43-8c3a-5b1e1f6e2d22";

const storedFile = { save: vi.fn(), delete: vi.fn() };

const labelOutput = {
  category: "WASHING_MACHINE" as const,
  brand: "Bosch",
  model: "WAN28262BY/01",
  serialNumber: null,
  manufactureDate: "2019-06",
};

const buildDocument = (
  overrides: Partial<{ reviewedAt: Date | null }> = {},
) => ({
  id: documentId,
  unitId,
  kind: "LABEL_PHOTO" as const,
  storagePath: `units/${unitId}/documents/${documentId}`,
  contentType: "image/jpeg",
  extractedData: labelOutput,
  reviewedAt: null,
  createdAt: new Date("2026-11-21T00:00:00Z"),
  ...overrides,
});

const fields = {
  category: "FRIDGE" as const,
  brand: "Arctic",
  model: "AK60350M40W",
  serialNumber: null,
  manufactureDate: null,
  purchaseDate: "2024-03-01",
  purchasePriceRon: 1899.99,
  warrantyUntil: "2026-03-01",
  notes: null,
};

describe("DocumentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bucket.file).mockReturnValue(
      storedFile as unknown as ReturnType<typeof bucket.file>,
    );
  });

  describe("uploadDocument", () => {
    const upload = () =>
      documentService.uploadDocument("user-1", {
        unitId,
        kind: "LABEL_PHOTO",
        file: new File(["label"], "label.jpg", { type: "image/jpeg" }),
      });

    it("stores the file under the unit, saves the document and keeps the extracted fields", async () => {
      vi.mocked(labelExtractionService.extract).mockResolvedValue(labelOutput);

      const id = await upload();

      const storagePath = `units/${unitId}/documents/${id}`;
      expect(bucket.file).toHaveBeenCalledWith(storagePath);
      expect(storedFile.save).toHaveBeenCalled();
      expect(documentRepository.create).toHaveBeenCalledWith({
        id,
        unitId,
        kind: "LABEL_PHOTO",
        storagePath,
        contentType: "image/jpeg",
      });
      expect(labelExtractionService.extract).toHaveBeenCalledWith({
        fileUri: `gs://test-bucket/${storagePath}`,
        contentType: "image/jpeg",
      });
      expect(invoiceExtractionService.extract).not.toHaveBeenCalled();
      expect(documentRepository.update).toHaveBeenCalledWith(id, {
        extractedData: labelOutput,
      });
    });

    it("keeps the document without extracted fields when extraction fails", async () => {
      vi.mocked(labelExtractionService.extract).mockRejectedValue(
        new Error("schema mismatch"),
      );

      await upload();

      expect(documentRepository.create).toHaveBeenCalled();
      expect(documentRepository.update).not.toHaveBeenCalled();
    });

    it("stores nothing for a unit of another organization", async () => {
      vi.mocked(unitService.getUnit).mockRejectedValueOnce(
        new ForbiddenError("not a member"),
      );

      await expect(upload()).rejects.toThrow(ForbiddenError);
      expect(storedFile.save).not.toHaveBeenCalled();
      expect(documentRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("saveDocumentReview", () => {
    it("creates each accepted appliance as many times as asked and links it to the document", async () => {
      vi.mocked(documentRepository.findById).mockResolvedValue(buildDocument());
      vi.mocked(applianceRepository.create)
        .mockResolvedValueOnce({ id: "appliance-1" } as never)
        .mockResolvedValueOnce({ id: "appliance-2" } as never);

      await documentService.saveDocumentReview("user-1", {
        documentId,
        rows: [{ ...fields, count: 2 }],
      });

      expect(applianceRepository.create).toHaveBeenCalledTimes(2);
      expect(applianceRepository.create).toHaveBeenCalledWith(
        {
          unitId,
          ...fields,
          purchaseDate: new Date("2024-03-01"),
          warrantyUntil: new Date("2026-03-01"),
        },
        "transaction",
      );
      expect(applianceDocumentRepository.create).toHaveBeenCalledWith(
        { applianceId: "appliance-2", documentId },
        "transaction",
      );
      expect(documentRepository.update).toHaveBeenCalledWith(
        documentId,
        { reviewedAt: expect.any(Date) },
        "transaction",
      );
    });

    it("throws a ValidationError with reason DOCUMENT_ALREADY_REVIEWED when the document was already reviewed", async () => {
      vi.mocked(documentRepository.findById).mockResolvedValue(
        buildDocument({ reviewedAt: new Date() }),
      );

      await expect(
        documentService.saveDocumentReview("user-1", {
          documentId,
          rows: [{ ...fields, count: 1 }],
        }),
      ).rejects.toMatchObject({
        name: "ValidationError",
        reason: "DOCUMENT_ALREADY_REVIEWED",
      });
      expect(applianceRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("discardDocument", () => {
    it("deletes the document and its file", async () => {
      vi.mocked(documentRepository.findById).mockResolvedValue(buildDocument());

      await documentService.discardDocument("user-1", documentId);

      expect(documentRepository.delete).toHaveBeenCalledWith(documentId);
      expect(bucket.file).toHaveBeenCalledWith(
        `units/${unitId}/documents/${documentId}`,
      );
      expect(storedFile.delete).toHaveBeenCalledWith({ ignoreNotFound: true });
    });

    it("throws a ValidationError for a reviewed document", async () => {
      vi.mocked(documentRepository.findById).mockResolvedValue(
        buildDocument({ reviewedAt: new Date() }),
      );

      await expect(
        documentService.discardDocument("user-1", documentId),
      ).rejects.toThrow(ValidationError);
      expect(documentRepository.delete).not.toHaveBeenCalled();
    });
  });
});
