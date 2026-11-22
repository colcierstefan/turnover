import { beforeEach, describe, expect, it, vi } from "vitest";

import handymanMessageRepository from "@turnover/core/handyman/repositories/handyman-message.repository";
import handymanRepository from "@turnover/core/handyman/repositories/handyman.repository";
import handymanMessageDraftService from "@turnover/core/handyman/services/handyman-message-draft.service";
import handymanService from "@turnover/core/handyman/services/handyman.service";
import issueService from "@turnover/core/issue/services/issue.service";
import { NotFoundError, ValidationError } from "@turnover/core/lib/errors";
import organizationService from "@turnover/core/organization/services/organization.service";

vi.mock("@turnover/core/lib/db", () => ({
  default: {
    $transaction: vi.fn((run: (transaction: unknown) => unknown) =>
      run("transaction"),
    ),
  },
}));
vi.mock("@turnover/core/organization/services/organization.service", () => ({
  default: { requireMembership: vi.fn() },
}));
vi.mock("@turnover/core/issue/services/issue.service", () => ({
  default: { getIssue: vi.fn(), markIssueContacted: vi.fn() },
}));
vi.mock(
  "@turnover/core/handyman/services/handyman-message-draft.service",
  () => ({
    default: { draft: vi.fn() },
  }),
);
vi.mock(
  "@turnover/core/handyman/services/handyman-message-translation.service",
  () => ({ default: { translate: vi.fn() } }),
);
vi.mock("@turnover/core/handyman/repositories/handyman.repository", () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    findByOrganizationIdAndPhone: vi.fn(),
    listByOrganizationId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock(
  "@turnover/core/handyman/repositories/handyman-message.repository",
  () => ({
    default: {
      create: vi.fn(),
      findById: vi.fn(),
      listByIssueId: vi.fn(),
      update: vi.fn(),
    },
  }),
);

const organizationId = "org-1";
const userId = "user-1";
const issueId = "0c7a3d7e-2f4b-4f43-8c3a-5b1e1f6e2d22";
const handymanId = "5d0f1a2b-3c4d-4e5f-8a9b-0c1d2e3f4a5b";
const messageId = "7e6d5c4b-3a29-4180-9f7e-6d5c4b3a2918";
const manager = { id: userId, language: "EN" as const };

const buildHandyman = (
  overrides: Partial<{
    id: string;
    organizationId: string;
    name: string;
    phone: string;
    trades: Array<"PLUMBER" | "APPLIANCE_TECHNICIAN" | "ELECTRICIAN">;
  }> = {},
) => ({
  id: handymanId,
  organizationId,
  name: "Ion Popescu",
  phone: "+40712345678",
  trades: ["APPLIANCE_TECHNICIAN" as const],
  notes: null,
  createdAt: new Date("2026-11-01T00:00:00Z"),
  ...overrides,
});

const issue = {
  id: issueId,
  unitId: "unit-1",
  reporterName: "Anna Schmidt",
  description: "The washing machine does not drain",
  unit: {
    id: "unit-1",
    organizationId,
    address: "Str. Memorandumului 1, Cluj-Napoca",
  },
  appliance: {
    id: "appliance-1",
    category: "WASHING_MACHINE" as const,
    brand: "Bosch",
    model: "WAN28262BY",
  },
  diagnosis: {
    likelyCause: "The drain pump filter is blocked.",
    nextSteps: ["Clean the filter"],
    trade: "APPLIANCE_TECHNICIAN" as const,
    partCostRon: { minRon: 80, maxRon: 120 },
    labourCostRon: { minRon: 150, maxRon: 220 },
    newApplianceCostRon: { minRon: 1800, maxRon: 2500 },
  },
};

const draftInput = { issueId, recipient: { kind: "WHATSAPP_CHAT" as const } };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(organizationService.requireMembership).mockResolvedValue({
    organizationId,
  } as Awaited<ReturnType<typeof organizationService.requireMembership>>);
  vi.mocked(issueService.getIssue).mockResolvedValue(
    issue as unknown as Awaited<ReturnType<typeof issueService.getIssue>>,
  );
  vi.mocked(handymanRepository.findByOrganizationIdAndPhone).mockResolvedValue(
    null,
  );
  vi.mocked(handymanMessageRepository.create).mockResolvedValue({
    id: messageId,
    handymanId: null,
  } as Awaited<ReturnType<typeof handymanMessageRepository.create>>);
});

describe("HandymanService", () => {
  describe("listHandymen", () => {
    it("puts handymen with the preferred trade first and keeps name order", async () => {
      vi.mocked(handymanRepository.listByOrganizationId).mockResolvedValue([
        buildHandyman({ id: "a", name: "Andrei", trades: ["PLUMBER"] }),
        buildHandyman({ id: "b", name: "Bogdan" }),
        buildHandyman({ id: "c", name: "Cristi", trades: ["ELECTRICIAN"] }),
        buildHandyman({ id: "d", name: "Dan" }),
      ]);

      const handymen = await handymanService.listHandymen(
        userId,
        "APPLIANCE_TECHNICIAN",
      );

      expect(handymen.map((handyman) => handyman.id)).toEqual([
        "b",
        "d",
        "a",
        "c",
      ]);
    });
  });

  describe("createHandyman", () => {
    it("rejects a phone number already saved in the organization", async () => {
      vi.mocked(
        handymanRepository.findByOrganizationIdAndPhone,
      ).mockResolvedValue(buildHandyman());

      await expect(
        handymanService.createHandyman(userId, {
          name: "Ion",
          phone: "+40712345678",
          trades: ["PLUMBER"],
          notes: null,
        }),
      ).rejects.toThrow(ValidationError);
      expect(handymanRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("updateHandyman", () => {
    it("lets a handyman keep their own phone number", async () => {
      vi.mocked(handymanRepository.findById).mockResolvedValue(buildHandyman());
      vi.mocked(
        handymanRepository.findByOrganizationIdAndPhone,
      ).mockResolvedValue(buildHandyman());

      await handymanService.updateHandyman(userId, {
        handymanId,
        name: "Ion Popescu",
        phone: "+40712345678",
        trades: ["PLUMBER"],
        notes: "Has keys",
      });

      expect(handymanRepository.update).toHaveBeenCalledWith(handymanId, {
        name: "Ion Popescu",
        phone: "+40712345678",
        trades: ["PLUMBER"],
        notes: "Has keys",
      });
    });
  });

  describe("draftMessage", () => {
    it("drafts from the address, appliance, problem and handyman name only", async () => {
      vi.mocked(handymanRepository.findById).mockResolvedValue(buildHandyman());

      await handymanService.draftMessage(manager, {
        issueId,
        recipient: { kind: "HANDYMAN", handymanId },
      });

      expect(handymanMessageDraftService.draft).toHaveBeenCalledWith({
        unitAddress: "Str. Memorandumului 1, Cluj-Napoca",
        appliance: {
          category: "WASHING_MACHINE",
          brand: "Bosch",
          model: "WAN28262BY",
        },
        description: "The washing machine does not drain",
        likelyCause: "The drain pump filter is blocked.",
        trade: "APPLIANCE_TECHNICIAN",
        recipientName: "Ion Popescu",
        managerLanguage: "EN",
      });
    });

    it("throws a NotFoundError for a handyman of another organization", async () => {
      vi.mocked(handymanRepository.findById).mockResolvedValue(
        buildHandyman({ organizationId: "org-2" }),
      );

      await expect(
        handymanService.draftMessage(manager, {
          issueId,
          recipient: { kind: "HANDYMAN", handymanId },
        }),
      ).rejects.toThrow(NotFoundError);
      expect(handymanMessageDraftService.draft).not.toHaveBeenCalled();
    });

    it("drafts without a name for a chat chosen in WhatsApp", async () => {
      await handymanService.draftMessage(manager, draftInput);

      expect(handymanMessageDraftService.draft).toHaveBeenCalledWith(
        expect.objectContaining({ recipientName: null }),
      );
    });
  });

  describe("recordMessageOpened", () => {
    const texts = { textRo: "Bună ziua", textEn: "Hello" };

    it("stores the saved handyman's name and phone and marks the issue contacted", async () => {
      vi.mocked(handymanRepository.findById).mockResolvedValue(buildHandyman());

      await handymanService.recordMessageOpened(userId, {
        issueId,
        recipient: { kind: "HANDYMAN", handymanId },
        ...texts,
      });

      expect(handymanMessageRepository.create).toHaveBeenCalledWith({
        issueId,
        handymanId,
        recipientName: "Ion Popescu",
        recipientPhone: "+40712345678",
        ...texts,
        openedInWhatsAppAt: expect.any(Date),
      });
      expect(issueService.markIssueContacted).toHaveBeenCalledWith(issueId);
    });

    it("links a typed number to the saved handyman with that phone", async () => {
      vi.mocked(
        handymanRepository.findByOrganizationIdAndPhone,
      ).mockResolvedValue(buildHandyman());

      await handymanService.recordMessageOpened(userId, {
        issueId,
        recipient: { kind: "PHONE", phone: "+40712345678", name: null },
        ...texts,
      });

      expect(handymanMessageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          handymanId,
          recipientName: "Ion Popescu",
          recipientPhone: "+40712345678",
        }),
      );
    });

    it("stores no recipient for a chat chosen in WhatsApp", async () => {
      await handymanService.recordMessageOpened(userId, {
        ...draftInput,
        ...texts,
      });

      expect(handymanMessageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          handymanId: null,
          recipientName: null,
          recipientPhone: null,
        }),
      );
    });
  });

  describe("saveRecipientAsHandyman", () => {
    it("saves the handyman and links the message to them", async () => {
      vi.mocked(handymanMessageRepository.findById).mockResolvedValue({
        id: messageId,
        issueId,
      } as Awaited<ReturnType<typeof handymanMessageRepository.findById>>);
      vi.mocked(handymanRepository.create).mockResolvedValue(buildHandyman());

      await handymanService.saveRecipientAsHandyman(userId, {
        handymanMessageId: messageId,
        name: "Ion Popescu",
        phone: "+40712345678",
        trades: ["APPLIANCE_TECHNICIAN"],
        notes: null,
      });

      expect(handymanRepository.create).toHaveBeenCalledWith(
        {
          organizationId,
          name: "Ion Popescu",
          phone: "+40712345678",
          trades: ["APPLIANCE_TECHNICIAN"],
          notes: null,
        },
        "transaction",
      );
      expect(handymanMessageRepository.update).toHaveBeenCalledWith(
        messageId,
        { handymanId },
        "transaction",
      );
    });
  });
});
