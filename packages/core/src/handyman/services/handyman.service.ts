import "server-only";

import type { HandymanTrade } from "@turnover/core/handyman/constants/handyman.constants";
import handymanMessageRepository from "@turnover/core/handyman/repositories/handyman-message.repository";
import handymanRepository from "@turnover/core/handyman/repositories/handyman.repository";
import { handymanMessageDraftInputSchema } from "@turnover/core/handyman/schemas/handyman-message-draft.schema";
import type {
  CreateHandymanInput,
  DraftHandymanMessageInput,
  HandymanMessageRecipient,
  RecordHandymanMessageInput,
  SaveRecipientAsHandymanInput,
  TranslateHandymanMessageInput,
  UpdateHandymanInput,
} from "@turnover/core/handyman/schemas/handyman.schema";
import handymanMessageDraftService from "@turnover/core/handyman/services/handyman-message-draft.service";
import handymanMessageTranslationService from "@turnover/core/handyman/services/handyman-message-translation.service";
import issueService from "@turnover/core/issue/services/issue.service";
import prisma from "@turnover/core/lib/db";
import { NotFoundError, ValidationError } from "@turnover/core/lib/errors";
import organizationService from "@turnover/core/organization/services/organization.service";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

type Manager = Readonly<{ id: string; language: UserLanguage }>;

class HandymanService {
  async listHandymen(userId: string, preferredTrade: HandymanTrade | null) {
    const membership = await organizationService.requireMembership(userId);
    const handymen = await handymanRepository.listByOrganizationId(
      membership.organizationId,
    );
    if (!preferredTrade) return handymen;
    return [
      ...handymen.filter((handyman) =>
        handyman.trades.includes(preferredTrade),
      ),
      ...handymen.filter(
        (handyman) => !handyman.trades.includes(preferredTrade),
      ),
    ];
  }

  async getHandyman(userId: string, handymanId: string) {
    const handyman = await handymanRepository.findById(handymanId);
    if (!handyman) throw new NotFoundError(`Handyman ${handymanId} not found`);
    await organizationService.requireMembership(
      userId,
      handyman.organizationId,
    );
    return handyman;
  }

  async createHandyman(userId: string, input: CreateHandymanInput) {
    const membership = await organizationService.requireMembership(userId);
    await requirePhoneNotSaved(membership.organizationId, input.phone);
    return handymanRepository.create({
      ...input,
      organizationId: membership.organizationId,
    });
  }

  async updateHandyman(userId: string, input: UpdateHandymanInput) {
    const { handymanId, ...fields } = input;
    const handyman = await this.getHandyman(userId, handymanId);
    await requirePhoneNotSaved(
      handyman.organizationId,
      fields.phone,
      handymanId,
    );
    return handymanRepository.update(handymanId, fields);
  }

  async deleteHandyman(userId: string, handymanId: string) {
    await this.getHandyman(userId, handymanId);
    await handymanRepository.delete(handymanId);
  }

  async draftMessage(manager: Manager, input: DraftHandymanMessageInput) {
    const issue = await issueService.getIssue(manager.id, input.issueId);
    const recipient = await resolveRecipient(
      issue.unit.organizationId,
      input.recipient,
    );
    return handymanMessageDraftService.draft(
      handymanMessageDraftInputSchema.parse({
        unitAddress: issue.unit.address,
        appliance: issue.appliance && {
          category: issue.appliance.category,
          brand: issue.appliance.brand,
          model: issue.appliance.model,
        },
        description: issue.description,
        likelyCause: issue.diagnosis?.likelyCause ?? null,
        trade: issue.diagnosis?.trade ?? null,
        recipientName: recipient.recipientName,
        managerLanguage: manager.language,
      }),
    );
  }

  async translateMessage(userId: string, input: TranslateHandymanMessageInput) {
    await organizationService.requireMembership(userId);
    return handymanMessageTranslationService.translate(input);
  }

  async recordMessageOpened(userId: string, input: RecordHandymanMessageInput) {
    const issue = await issueService.getIssue(userId, input.issueId);
    const recipient = await resolveRecipient(
      issue.unit.organizationId,
      input.recipient,
    );
    const message = await handymanMessageRepository.create({
      ...recipient,
      issueId: issue.id,
      textRo: input.textRo,
      textEn: input.textEn,
      openedInWhatsAppAt: new Date(),
    });
    await issueService.markIssueContacted(issue.id);
    return { id: message.id, handymanId: message.handymanId };
  }

  async saveRecipientAsHandyman(
    userId: string,
    input: SaveRecipientAsHandymanInput,
  ) {
    const { handymanMessageId, ...fields } = input;
    const message = await handymanMessageRepository.findById(handymanMessageId);
    if (!message) {
      throw new NotFoundError(
        `Handyman message ${handymanMessageId} not found`,
      );
    }
    const issue = await issueService.getIssue(userId, message.issueId);
    const organizationId = issue.unit.organizationId;
    await requirePhoneNotSaved(organizationId, fields.phone);
    return prisma.$transaction(async (transaction) => {
      const handyman = await handymanRepository.create(
        { ...fields, organizationId },
        transaction,
      );
      await handymanMessageRepository.update(
        message.id,
        { handymanId: handyman.id },
        transaction,
      );
      return handyman;
    });
  }

  async requireOrganizationHandyman(
    organizationId: string,
    handymanId: string,
  ) {
    const handyman = await handymanRepository.findById(handymanId);
    if (!handyman || handyman.organizationId !== organizationId) {
      throw new NotFoundError(`Handyman ${handymanId} not found`);
    }
    return handyman;
  }

  async hasMessages(issueId: string) {
    return (await handymanMessageRepository.countByIssueId(issueId)) > 0;
  }

  async listMessages(userId: string, issueId: string) {
    await issueService.getIssue(userId, issueId);
    return handymanMessageRepository.listByIssueId(issueId);
  }
}

const requirePhoneNotSaved = async (
  organizationId: string,
  phone: string,
  exceptHandymanId?: string,
) => {
  const saved = await handymanRepository.findByOrganizationIdAndPhone(
    organizationId,
    phone,
  );
  if (saved && saved.id !== exceptHandymanId) {
    throw new ValidationError(
      `Phone ${phone} is already saved as handyman ${saved.id}`,
      "HANDYMAN_PHONE_TAKEN",
    );
  }
};

const resolveRecipient = async (
  organizationId: string,
  recipient: HandymanMessageRecipient,
) => {
  switch (recipient.kind) {
    case "HANDYMAN": {
      const handyman = await handymanRepository.findById(recipient.handymanId);
      if (!handyman || handyman.organizationId !== organizationId) {
        throw new NotFoundError(`Handyman ${recipient.handymanId} not found`);
      }
      return {
        handymanId: handyman.id,
        recipientName: handyman.name,
        recipientPhone: handyman.phone,
      };
    }
    case "PHONE": {
      const saved = await handymanRepository.findByOrganizationIdAndPhone(
        organizationId,
        recipient.phone,
      );
      return {
        handymanId: saved?.id ?? null,
        recipientName: recipient.name ?? saved?.name ?? null,
        recipientPhone: recipient.phone,
      };
    }
    case "WHATSAPP_CHAT":
      return { handymanId: null, recipientName: null, recipientPhone: null };
  }
};

const handymanService = new HandymanService();
export default handymanService;
