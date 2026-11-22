import "server-only";

import { randomUUID } from "node:crypto";

import { extractInvoice } from "@turnover/core/appliance/invoice-extractor/invoice-extractor.agent";
import { invoiceExtractorInputSchema } from "@turnover/core/appliance/invoice-extractor/schemas/invoice-extractor.schema";
import { extractLabel } from "@turnover/core/appliance/label-extractor/label-extractor.agent";
import { labelExtractorInputSchema } from "@turnover/core/appliance/label-extractor/schemas/label-extractor.schema";
import applianceDocumentRepository from "@turnover/core/appliance/repositories/appliance-document.repository";
import applianceRepository from "@turnover/core/appliance/repositories/appliance.repository";
import documentRepository from "@turnover/core/appliance/repositories/document.repository";
import type {
  SaveDocumentReviewInput,
  UploadDocumentInput,
} from "@turnover/core/appliance/schemas/document.schema";
import { toApplianceData } from "@turnover/core/appliance/utils/appliance.utils";
import { buildDocumentReview } from "@turnover/core/appliance/utils/document-review.utils";
import prisma from "@turnover/core/lib/db";
import { NotFoundError, ValidationError } from "@turnover/core/lib/errors";
import logger from "@turnover/core/lib/logger";
import { bucket } from "@turnover/core/lib/storage";
import unitService from "@turnover/core/unit/services/unit.service";
import { getUnitStoragePrefix } from "@turnover/core/utils/storage.utils";

class DocumentService {
  async uploadDocument(userId: string, input: UploadDocumentInput) {
    await unitService.getUnit(userId, input.unitId);

    const id = randomUUID();
    const storagePath = `${getUnitStoragePrefix(input.unitId)}documents/${id}`;
    const contentType = input.file.type;
    await bucket
      .file(storagePath)
      .save(Buffer.from(await input.file.arrayBuffer()), {
        contentType,
        resumable: false,
      });
    await documentRepository.create({
      id,
      unitId: input.unitId,
      kind: input.kind,
      storagePath,
      contentType,
    });

    const extractedData = await extractDocument({
      id,
      kind: input.kind,
      fileUri: `gs://${bucket.name}/${storagePath}`,
      contentType,
    });
    if (extractedData) await documentRepository.update(id, { extractedData });
    return id;
  }

  async listUnreviewedDocuments(userId: string, unitId: string) {
    await unitService.getUnit(userId, unitId);
    return documentRepository.listUnreviewedByUnitId(unitId);
  }

  async getDocumentReview(userId: string, documentId: string) {
    const document = await this.getDocument(userId, documentId);
    return { document, ...buildDocumentReview(document) };
  }

  async saveDocumentReview(userId: string, input: SaveDocumentReviewInput) {
    const document = await this.getDocument(userId, input.documentId);
    if (document.reviewedAt) {
      throw new ValidationError("This upload was already reviewed");
    }

    await prisma.$transaction(async (transaction) => {
      for (const { count, ...fields } of input.rows) {
        for (let index = 0; index < count; index++) {
          const appliance = await applianceRepository.create(
            { unitId: document.unitId, ...toApplianceData(fields) },
            transaction,
          );
          await applianceDocumentRepository.create(
            { applianceId: appliance.id, documentId: document.id },
            transaction,
          );
        }
      }
      await documentRepository.update(
        document.id,
        { reviewedAt: new Date() },
        transaction,
      );
    });
    return document;
  }

  async discardDocument(userId: string, documentId: string) {
    const document = await this.getDocument(userId, documentId);
    if (document.reviewedAt) {
      throw new ValidationError("A reviewed upload cannot be discarded");
    }
    await documentRepository.delete(documentId);
    await bucket.file(document.storagePath).delete({ ignoreNotFound: true });
    return document;
  }

  async getDocumentFile(userId: string, documentId: string) {
    const document = await this.getDocument(userId, documentId);
    return {
      contentType: document.contentType,
      stream: bucket.file(document.storagePath).createReadStream(),
    };
  }

  private async getDocument(userId: string, documentId: string) {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError(`Document ${documentId} not found`);
    await unitService.getUnit(userId, document.unitId);
    return document;
  }
}

const extractDocument = async (
  document: Readonly<{
    id: string;
    kind: UploadDocumentInput["kind"];
    fileUri: string;
    contentType: string;
  }>,
) => {
  try {
    if (document.kind === "LABEL_PHOTO") {
      return await extractLabel(labelExtractorInputSchema.parse(document));
    }
    return await extractInvoice(invoiceExtractorInputSchema.parse(document));
  } catch (error) {
    logger.error(
      { err: error, documentId: document.id },
      "Document extraction failed",
    );
    return null;
  }
};

const documentService = new DocumentService();
export default documentService;
