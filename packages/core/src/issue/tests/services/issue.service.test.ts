import { beforeEach, describe, expect, it, vi } from "vitest";

import applianceService from "@turnover/core/appliance/services/appliance.service";
import issueFollowUpRepository from "@turnover/core/issue/repositories/issue-follow-up.repository";
import issuePhotoRepository from "@turnover/core/issue/repositories/issue-photo.repository";
import issueRepository from "@turnover/core/issue/repositories/issue.repository";
import issueService from "@turnover/core/issue/services/issue.service";
import reportTriageService from "@turnover/core/issue/services/report-triage.service";
import selfHelpTipsService from "@turnover/core/issue/services/self-help-tips.service";
import {
  NotFoundError,
  TooManyRequestsError,
  ValidationError,
} from "@turnover/core/lib/errors";
import { bucket } from "@turnover/core/lib/storage";
import unitService from "@turnover/core/unit/services/unit.service";

vi.mock("@turnover/core/lib/logger", () => ({ default: { error: vi.fn() } }));
vi.mock("@turnover/core/lib/storage", () => ({
  bucket: { name: "test-bucket", file: vi.fn() },
}));
vi.mock("@turnover/core/unit/services/unit.service", () => ({
  default: { getUnit: vi.fn(), getUnitByReportToken: vi.fn() },
}));
vi.mock("@turnover/core/appliance/services/appliance.service", () => ({
  default: { listAppliancesByReportToken: vi.fn() },
}));
vi.mock("@turnover/core/issue/services/report-triage.service", () => ({
  default: { triage: vi.fn() },
}));
vi.mock("@turnover/core/issue/services/self-help-tips.service", () => ({
  default: { suggest: vi.fn() },
}));
vi.mock("@turnover/core/issue/repositories/issue.repository", () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    countByUnitIdSince: vi.fn(),
    countByUnitId: vi.fn(),
    listOpenByUnitId: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock("@turnover/core/issue/repositories/issue-photo.repository", () => ({
  default: { create: vi.fn() },
}));
vi.mock("@turnover/core/issue/repositories/issue-follow-up.repository", () => ({
  default: { createMany: vi.fn(), listByIssueId: vi.fn(), update: vi.fn() },
}));

const unitId = "6f1c2a52-6b9e-4d55-9a57-0a1d3c1f0a11";
const issueId = "0c7a3d7e-2f4b-4f43-8c3a-5b1e1f6e2d22";
const followUpId = "9b8f7e6d-5c4b-4a39-8281-706f5e4d3c2b";
const reportToken = "report-token";

const unit = {
  id: unitId,
  organizationId: "org-1",
  name: "Old Town Studio",
  address: "Str. Memorandumului 1, Cluj-Napoca",
  reportToken,
  reportTokenRotatedAt: null,
  createdAt: new Date("2026-11-01T00:00:00Z"),
  organization: {
    id: "org-1",
    name: "Cluj Stays",
    contactPhone: "+40 712 345 678",
    createdAt: new Date("2026-11-01T00:00:00Z"),
  },
};

const appliance = {
  id: "appliance-1",
  unitId,
  category: "WASHING_MACHINE" as const,
  brand: "Bosch",
  model: "WAN28262BY",
  serialNumber: null,
  manufactureDate: null,
  purchaseDate: null,
  purchasePriceRon: null,
  warrantyUntil: null,
  notes: null,
  createdAt: new Date("2026-11-01T00:00:00Z"),
};

const buildIssue = (
  overrides: Partial<{
    unitId: string;
    status: "NEW" | "RESOLVED";
    isEmergency: boolean;
  }> = {},
) => ({
  id: issueId,
  unitId,
  applianceId: null,
  reporterRole: "GUEST" as const,
  reporterName: null,
  reporterLanguage: "EN" as const,
  description: "The washing machine does not start",
  status: "NEW" as const,
  category: null,
  diagnosis: null,
  isEmergency: false,
  emergencyType: null,
  selfHelpTips: null,
  resolvedByReporter: false,
  costRon: null,
  costNote: null,
  resolvedAt: null,
  createdAt: new Date("2026-11-22T10:00:00Z"),
  ...overrides,
});

const followUp = {
  id: followUpId,
  issueId,
  question: "Does the display show anything?",
  answer: null,
  createdAt: new Date("2026-11-22T10:00:00Z"),
};

const submitInput = {
  reportToken,
  reporterRole: "GUEST" as const,
  reporterName: null,
  reporterLanguage: "EN" as const,
  description: "The washing machine does not start",
  photos: [new File(["photo"], "photo.jpg", { type: "image/jpeg" })],
};

const storedFile = { save: vi.fn() };

describe("IssueService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(unitService.getUnitByReportToken).mockResolvedValue(unit);
    vi.mocked(applianceService.listAppliancesByReportToken).mockResolvedValue([
      appliance,
    ]);
    vi.mocked(issueRepository.countByUnitIdSince).mockResolvedValue(0);
    vi.mocked(issueRepository.create).mockResolvedValue(buildIssue());
    vi.mocked(issueRepository.findById).mockResolvedValue(buildIssue());
    vi.mocked(issueFollowUpRepository.listByIssueId).mockResolvedValue([]);
    vi.mocked(bucket.file).mockReturnValue(
      storedFile as unknown as ReturnType<typeof bucket.file>,
    );
  });

  describe("submitReport", () => {
    it("throws a NotFoundError for an unknown report link", async () => {
      vi.mocked(unitService.getUnitByReportToken).mockResolvedValue(null);

      await expect(issueService.submitReport(submitInput)).rejects.toThrow(
        NotFoundError,
      );
      expect(issueRepository.create).not.toHaveBeenCalled();
    });

    it("throws a TooManyRequestsError after 10 reports in the last hour", async () => {
      vi.mocked(issueRepository.countByUnitIdSince).mockResolvedValue(10);

      await expect(issueService.submitReport(submitInput)).rejects.toThrow(
        TooManyRequestsError,
      );
      expect(issueRepository.create).not.toHaveBeenCalled();
    });

    it("stores the photos under the unit folder and passes them to triage", async () => {
      vi.mocked(reportTriageService.triage).mockResolvedValue({
        emergencyType: null,
        questions: ["Does the display show anything?"],
      });
      vi.mocked(issueFollowUpRepository.createMany).mockResolvedValue([
        followUp,
      ]);

      await issueService.submitReport(submitInput);

      const storagePath = vi.mocked(issuePhotoRepository.create).mock
        .calls[0][0].storagePath;
      expect(storagePath).toMatch(
        new RegExp(`^units/${unitId}/issues/${issueId}/`),
      );
      expect(reportTriageService.triage).toHaveBeenCalledWith({
        description: submitInput.description,
        reporterRole: "GUEST",
        reporterLanguage: "EN",
        appliances: [
          { category: "WASHING_MACHINE", brand: "Bosch", model: "WAN28262BY" },
        ],
        photos: [
          {
            fileUri: `gs://test-bucket/${storagePath}`,
            contentType: "image/jpeg",
          },
        ],
      });
    });

    it("marks an emergency and returns the emergency step", async () => {
      vi.mocked(reportTriageService.triage).mockResolvedValue({
        emergencyType: "GAS_SMELL",
        questions: [],
      });

      expect(await issueService.submitReport(submitInput)).toEqual({
        step: "EMERGENCY",
        issueId,
        emergencyType: "GAS_SMELL",
      });
      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        isEmergency: true,
        emergencyType: "GAS_SMELL",
      });
      expect(selfHelpTipsService.suggest).not.toHaveBeenCalled();
    });

    it("saves the follow-up questions and returns them", async () => {
      vi.mocked(reportTriageService.triage).mockResolvedValue({
        emergencyType: null,
        questions: ["Does the display show anything?"],
      });
      vi.mocked(issueFollowUpRepository.createMany).mockResolvedValue([
        followUp,
      ]);

      expect(await issueService.submitReport(submitInput)).toEqual({
        step: "FOLLOW_UPS",
        issueId,
        followUps: [{ id: followUpId, question: followUp.question }],
      });
      expect(issueFollowUpRepository.createMany).toHaveBeenCalledWith([
        { issueId, question: followUp.question },
      ]);
    });

    it("goes straight to tips when triage asks no questions", async () => {
      vi.mocked(reportTriageService.triage).mockResolvedValue({
        emergencyType: null,
        questions: [],
      });
      vi.mocked(selfHelpTipsService.suggest).mockResolvedValue({
        tips: ["Turn off the child lock."],
      });

      expect(await issueService.submitReport(submitInput)).toEqual({
        step: "TIPS",
        issueId,
        tips: ["Turn off the child lock."],
      });
      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        selfHelpTips: ["Turn off the child lock."],
      });
    });

    it("returns the sent step when no tips apply", async () => {
      vi.mocked(reportTriageService.triage).mockResolvedValue({
        emergencyType: null,
        questions: [],
      });
      vi.mocked(selfHelpTipsService.suggest).mockResolvedValue({ tips: [] });

      expect(await issueService.submitReport(submitInput)).toEqual({
        step: "SENT",
        issueId,
      });
    });

    it("keeps the issue and returns the sent step when triage fails", async () => {
      vi.mocked(reportTriageService.triage).mockRejectedValue(
        new Error("Vertex unavailable"),
      );

      expect(await issueService.submitReport(submitInput)).toEqual({
        step: "SENT",
        issueId,
      });
      expect(issueRepository.create).toHaveBeenCalled();
    });
  });

  describe("answerFollowUps", () => {
    it("saves the answers and passes them to the tips call", async () => {
      vi.mocked(issueFollowUpRepository.listByIssueId).mockResolvedValue([
        { ...followUp, answer: "E18" },
      ]);
      vi.mocked(selfHelpTipsService.suggest).mockResolvedValue({ tips: [] });

      await issueService.answerFollowUps({
        reportToken,
        issueId,
        answers: [{ followUpId, answer: "E18" }],
      });

      expect(issueFollowUpRepository.update).toHaveBeenCalledWith(followUpId, {
        answer: "E18",
      });
      expect(
        vi.mocked(selfHelpTipsService.suggest).mock.calls[0][0].followUps,
      ).toEqual([{ question: followUp.question, answer: "E18" }]);
    });

    it("throws a NotFoundError for a follow-up of another issue", async () => {
      vi.mocked(issueFollowUpRepository.listByIssueId).mockResolvedValue([]);

      await expect(
        issueService.answerFollowUps({
          reportToken,
          issueId,
          answers: [{ followUpId, answer: "E18" }],
        }),
      ).rejects.toThrow(NotFoundError);
      expect(issueFollowUpRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("markFixedByReporter", () => {
    it("resolves the issue as fixed by the reporter", async () => {
      await issueService.markFixedByReporter({ reportToken, issueId });

      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        status: "RESOLVED",
        resolvedByReporter: true,
        resolvedAt: expect.any(Date),
      });
    });

    it("throws a NotFoundError for an issue of another unit", async () => {
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ unitId: "another-unit" }),
      );

      await expect(
        issueService.markFixedByReporter({ reportToken, issueId }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws a ValidationError for an emergency", async () => {
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ isEmergency: true }),
      );

      await expect(
        issueService.markFixedByReporter({ reportToken, issueId }),
      ).rejects.toThrow(ValidationError);
    });

    it("throws a ValidationError for an issue that is already resolved", async () => {
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ status: "RESOLVED" }),
      );

      await expect(
        issueService.markFixedByReporter({ reportToken, issueId }),
      ).rejects.toThrow(ValidationError);
    });
  });
});
