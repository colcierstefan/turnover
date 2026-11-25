import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import applianceService from "@turnover/core/appliance/services/appliance.service";
import handymanService from "@turnover/core/handyman/services/handyman.service";
import issueFollowUpRepository from "@turnover/core/issue/repositories/issue-follow-up.repository";
import issuePhotoRepository from "@turnover/core/issue/repositories/issue-photo.repository";
import issueSummaryRepository from "@turnover/core/issue/repositories/issue-summary.repository";
import issueRepository from "@turnover/core/issue/repositories/issue.repository";
import issueDiagnosisService from "@turnover/core/issue/services/issue-diagnosis.service";
import issueSummaryService from "@turnover/core/issue/services/issue-summary.service";
import issueService from "@turnover/core/issue/services/issue.service";
import reportTriageService from "@turnover/core/issue/services/report-triage.service";
import selfHelpTipsService from "@turnover/core/issue/services/self-help-tips.service";
import {
  buildIssueSummaryFacts,
  getIssueSummaryFactsFingerprint,
} from "@turnover/core/issue/utils/issue-summary.utils";
import {
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  ValidationError,
} from "@turnover/core/lib/errors";
import logger from "@turnover/core/lib/logger";
import { bucket } from "@turnover/core/lib/storage";
import organizationService from "@turnover/core/organization/services/organization.service";
import unitService from "@turnover/core/unit/services/unit.service";
import { Prisma } from "@turnover/db/client";

vi.mock("@turnover/core/lib/logger", () => ({ default: { error: vi.fn() } }));
vi.mock("@turnover/core/lib/storage", () => ({
  bucket: { name: "test-bucket", file: vi.fn() },
}));
vi.mock("@turnover/core/unit/services/unit.service", () => ({
  default: { getUnit: vi.fn(), getUnitByReportToken: vi.fn() },
}));
vi.mock("@turnover/core/appliance/services/appliance.service", () => ({
  default: {
    listAppliancesByReportToken: vi.fn(),
    listAppliancesByUnitId: vi.fn(),
    getAppliance: vi.fn(),
    retireAppliance: vi.fn(),
  },
}));
vi.mock("@turnover/core/handyman/services/handyman.service", () => ({
  default: { requireOrganizationHandyman: vi.fn(), hasMessages: vi.fn() },
}));
vi.mock("@turnover/core/organization/services/organization.service", () => ({
  default: { getOwnerLanguage: vi.fn(), requireMembership: vi.fn() },
}));
vi.mock("@turnover/core/issue/services/issue-diagnosis.service", () => ({
  default: { diagnose: vi.fn() },
}));
vi.mock("@turnover/core/issue/services/issue-summary.service", () => ({
  default: { summarize: vi.fn() },
}));
vi.mock("@turnover/core/issue/repositories/issue-summary.repository", () => ({
  default: { findByOrganizationIdAndLanguage: vi.fn(), upsert: vi.fn() },
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
    findDetailsById: vi.fn(),
    countByUnitIdSince: vi.fn(),
    countByUnitId: vi.fn(),
    listOpenByUnitId: vi.fn(),
    listResolvedByUnitId: vi.fn(),
    listResolvedByApplianceId: vi.fn(),
    listResolvedByOrganizationId: vi.fn(),
    listOpenForSummaryByOrganizationId: vi.fn(),
    listResolvedApplianceIssuesSinceByOrganizationId: vi.fn(),
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
  retiredAt: null,
  createdAt: new Date("2026-11-01T00:00:00Z"),
};

const buildIssue = (
  overrides: Partial<{
    unitId: string;
    applianceId: string | null;
    status: "NEW" | "DIAGNOSED" | "CONTACTED" | "SCHEDULED" | "RESOLVED";
    isEmergency: boolean;
    diagnosis: typeof diagnosis | null;
  }> = {},
) => ({
  id: issueId,
  unitId,
  applianceId: null as string | null,
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
  scheduledFor: null,
  scheduledTime: null,
  resolution: null,
  resolvedByHandymanId: null,
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

const buildIssueDetails = (
  overrides: Parameters<typeof buildIssue>[0] = {},
) => ({
  ...buildIssue(overrides),
  unit,
  appliance: null,
  photos: [
    {
      id: "photo-1",
      issueId,
      storagePath: `units/${unitId}/issues/${issueId}/photo-1`,
      contentType: "image/jpeg",
      createdAt: new Date("2026-11-22T10:00:00Z"),
    },
  ],
  followUps: [{ ...followUp, answer: "Nothing" }],
});

const diagnosis = {
  likelyCause: "The drain pump is blocked.",
  nextSteps: ["Call an appliance technician."],
  trade: "APPLIANCE_TECHNICIAN" as const,
  partCostRon: { minRon: 150, maxRon: 250 },
  labourCostRon: { minRon: 200, maxRon: 300 },
  newApplianceCostRon: { minRon: 1800, maxRon: 2400 },
};

const manager = { id: "user-1", name: "Ana", language: "RO" as const };

describe("IssueService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(unitService.getUnitByReportToken).mockResolvedValue(unit);
    vi.mocked(applianceService.listAppliancesByReportToken).mockResolvedValue([
      appliance,
    ]);
    vi.mocked(applianceService.listAppliancesByUnitId).mockResolvedValue([
      { ...appliance, warrantyUntil: new Date("2099-01-31") },
    ]);
    vi.mocked(issueRepository.findDetailsById).mockResolvedValue(
      buildIssueDetails(),
    );
    vi.mocked(organizationService.getOwnerLanguage).mockResolvedValue("RO");
    vi.mocked(issueDiagnosisService.diagnose).mockResolvedValue({
      applianceId: "appliance-1",
      category: "REPAIR",
      ...diagnosis,
    });
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
        resolution: "FIXED_BY_REPORTER",
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

  describe("diagnoseReportedIssue", () => {
    it("diagnoses in the owner's language and stores the result", async () => {
      await issueService.diagnoseReportedIssue(issueId);

      expect(issueDiagnosisService.diagnose).toHaveBeenCalledWith({
        description: "The washing machine does not start",
        reporterRole: "GUEST",
        emergencyType: null,
        followUps: [
          { question: "Does the display show anything?", answer: "Nothing" },
        ],
        appliances: [
          {
            id: "appliance-1",
            category: "WASHING_MACHINE",
            brand: "Bosch",
            model: "WAN28262BY",
            manufactureDate: null,
            purchaseDate: null,
            warrantyUntil: "2099-01-31",
            warrantyStatus: "UNDER_WARRANTY",
          },
        ],
        confirmedApplianceId: null,
        language: "RO",
        today: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        photos: [
          {
            fileUri: `gs://test-bucket/units/${unitId}/issues/${issueId}/photo-1`,
            contentType: "image/jpeg",
          },
        ],
      });
      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        applianceId: "appliance-1",
        category: "REPAIR",
        diagnosis,
        status: "DIAGNOSED",
      });
    });

    it("uses the reporter's language when the owner has not chosen one", async () => {
      vi.mocked(organizationService.getOwnerLanguage).mockResolvedValue(null);

      await issueService.diagnoseReportedIssue(issueId);

      expect(issueDiagnosisService.diagnose).toHaveBeenCalledWith(
        expect.objectContaining({ language: "EN" }),
      );
    });

    it("logs a failed diagnosis and leaves the issue unchanged", async () => {
      vi.mocked(issueDiagnosisService.diagnose).mockRejectedValue(
        new Error("Vertex unavailable"),
      );

      await issueService.diagnoseReportedIssue(issueId);

      expect(logger.error).toHaveBeenCalled();
      expect(issueRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("diagnoseIssue", () => {
    it("keeps the appliance already set and the later status", async () => {
      vi.mocked(issueRepository.findDetailsById).mockResolvedValue(
        buildIssueDetails({ applianceId: "appliance-1", status: "CONTACTED" }),
      );
      vi.mocked(issueDiagnosisService.diagnose).mockResolvedValue({
        applianceId: null,
        category: "REPLACE",
        ...diagnosis,
      });

      await issueService.diagnoseIssue(manager, issueId);

      expect(issueDiagnosisService.diagnose).toHaveBeenCalledWith(
        expect.objectContaining({
          confirmedApplianceId: "appliance-1",
          language: "RO",
        }),
      );
      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        applianceId: "appliance-1",
        category: "REPLACE",
        diagnosis,
        status: "CONTACTED",
      });
    });

    it("throws a NotFoundError for an unknown issue", async () => {
      vi.mocked(issueRepository.findDetailsById).mockResolvedValue(null);

      await expect(
        issueService.diagnoseIssue(manager, issueId),
      ).rejects.toThrow(NotFoundError);
      expect(issueDiagnosisService.diagnose).not.toHaveBeenCalled();
    });
  });

  describe("markIssueContacted", () => {
    it("moves a diagnosed issue to contacted", async () => {
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ status: "DIAGNOSED" }),
      );

      await issueService.markIssueContacted(issueId);

      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        status: "CONTACTED",
      });
    });

    it("leaves a scheduled issue scheduled", async () => {
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ status: "SCHEDULED" }),
      );

      await issueService.markIssueContacted(issueId);

      expect(issueRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("reportIssueAsManager", () => {
    const reportInput = {
      unitId,
      description: "The dishwasher does not drain",
      applianceId: "appliance-1",
      photos: [],
    };

    it("creates a manager issue in the manager's language and diagnoses it", async () => {
      await issueService.reportIssueAsManager(manager, reportInput);

      expect(issueRepository.create).toHaveBeenCalledWith({
        unitId,
        applianceId: "appliance-1",
        reporterRole: "MANAGER",
        reporterName: "Ana",
        reporterLanguage: "RO",
        description: "The dishwasher does not drain",
      });
      expect(issueDiagnosisService.diagnose).toHaveBeenCalledWith(
        expect.objectContaining({ language: "RO" }),
      );
    });

    it("throws a NotFoundError for an appliance of another unit", async () => {
      await expect(
        issueService.reportIssueAsManager(manager, {
          ...reportInput,
          applianceId: "appliance-elsewhere",
        }),
      ).rejects.toThrow(NotFoundError);
      expect(issueRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("scheduleVisit", () => {
    beforeEach(() => {
      vi.mocked(unitService.getUnit).mockResolvedValue(unit);
    });

    it("stores the visit day and time and marks the issue scheduled", async () => {
      await issueService.scheduleVisit(manager.id, {
        issueId,
        scheduledFor: "2026-11-25",
        scheduledTime: "14:30",
      });

      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        status: "SCHEDULED",
        scheduledFor: new Date("2026-11-25"),
        scheduledTime: "14:30",
      });
    });

    it("throws a ForbiddenError for a manager of another organization", async () => {
      vi.mocked(unitService.getUnit).mockRejectedValueOnce(
        new ForbiddenError("not a member"),
      );

      await expect(
        issueService.scheduleVisit(manager.id, {
          issueId,
          scheduledFor: "2026-11-25",
          scheduledTime: null,
        }),
      ).rejects.toThrow(ForbiddenError);
      expect(issueRepository.update).not.toHaveBeenCalled();
    });

    it("throws a ValidationError for a resolved issue", async () => {
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ status: "RESOLVED" }),
      );

      await expect(
        issueService.scheduleVisit(manager.id, {
          issueId,
          scheduledFor: "2026-11-25",
          scheduledTime: null,
        }),
      ).rejects.toThrow(ValidationError);
      expect(issueRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("closeIssue", () => {
    const handymanId = "5d0f1a2b-3c4d-4e5f-8a9b-0c1d2e3f4a5b";
    const closeInput = {
      issueId,
      resolution: "REPAIRED" as const,
      costRon: 350,
      costNote: "New drain pump",
      resolvedByHandymanId: handymanId,
      retireAppliance: false,
    };

    beforeEach(() => {
      vi.mocked(unitService.getUnit).mockResolvedValue(unit);
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ status: "CONTACTED", applianceId: "appliance-1" }),
      );
    });

    it("resolves the issue with how it ended, the cost and who fixed it", async () => {
      await issueService.closeIssue(manager.id, closeInput);

      expect(handymanService.requireOrganizationHandyman).toHaveBeenCalledWith(
        "org-1",
        handymanId,
      );
      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        status: "RESOLVED",
        resolution: "REPAIRED",
        costRon: 350,
        costNote: "New drain pump",
        resolvedByHandymanId: handymanId,
        resolvedAt: expect.any(Date),
      });
      expect(applianceService.retireAppliance).not.toHaveBeenCalled();
    });

    it("retires the issue's appliance when it was replaced", async () => {
      await issueService.closeIssue(manager.id, {
        ...closeInput,
        resolution: "REPLACED",
        retireAppliance: true,
      });

      expect(applianceService.retireAppliance).toHaveBeenCalledWith(
        manager.id,
        "appliance-1",
      );
    });

    it("keeps the appliance when the retire box is ticked for a repair", async () => {
      await issueService.closeIssue(manager.id, {
        ...closeInput,
        retireAppliance: true,
      });

      expect(applianceService.retireAppliance).not.toHaveBeenCalled();
    });

    it("throws a ForbiddenError for a manager of another organization", async () => {
      vi.mocked(unitService.getUnit).mockRejectedValueOnce(
        new ForbiddenError("not a member"),
      );

      await expect(
        issueService.closeIssue(manager.id, closeInput),
      ).rejects.toThrow(ForbiddenError);
      expect(issueRepository.update).not.toHaveBeenCalled();
    });

    it("throws a NotFoundError for a handyman of another organization", async () => {
      vi.mocked(
        handymanService.requireOrganizationHandyman,
      ).mockRejectedValueOnce(new NotFoundError("not found"));

      await expect(
        issueService.closeIssue(manager.id, {
          ...closeInput,
          resolution: "REPLACED",
          retireAppliance: true,
        }),
      ).rejects.toThrow(NotFoundError);
      expect(applianceService.retireAppliance).not.toHaveBeenCalled();
      expect(issueRepository.update).not.toHaveBeenCalled();
    });

    it("throws a ValidationError for an issue that is already resolved", async () => {
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ status: "RESOLVED" }),
      );

      await expect(
        issueService.closeIssue(manager.id, closeInput),
      ).rejects.toThrow(ValidationError);
      expect(issueRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("reopenIssue", () => {
    const clearedResolution = {
      resolution: null,
      costRon: null,
      costNote: null,
      resolvedByHandymanId: null,
      resolvedAt: null,
    };

    beforeEach(() => {
      vi.mocked(unitService.getUnit).mockResolvedValue(unit);
      vi.mocked(handymanService.hasMessages).mockResolvedValue(false);
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ status: "RESOLVED", diagnosis }),
      );
    });

    it("goes back to contacted when a handyman was messaged", async () => {
      vi.mocked(handymanService.hasMessages).mockResolvedValue(true);

      await issueService.reopenIssue(manager.id, issueId);

      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        status: "CONTACTED",
        ...clearedResolution,
      });
    });

    it("goes back to diagnosed when no handyman was messaged", async () => {
      await issueService.reopenIssue(manager.id, issueId);

      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        status: "DIAGNOSED",
        ...clearedResolution,
      });
    });

    it("goes back to new when the issue was never diagnosed", async () => {
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ status: "RESOLVED" }),
      );

      await issueService.reopenIssue(manager.id, issueId);

      expect(issueRepository.update).toHaveBeenCalledWith(issueId, {
        status: "NEW",
        ...clearedResolution,
      });
    });

    it("throws a ForbiddenError for a manager of another organization", async () => {
      vi.mocked(unitService.getUnit).mockRejectedValueOnce(
        new ForbiddenError("not a member"),
      );

      await expect(
        issueService.reopenIssue(manager.id, issueId),
      ).rejects.toThrow(ForbiddenError);
      expect(issueRepository.update).not.toHaveBeenCalled();
    });

    it("throws a ValidationError for an open issue", async () => {
      vi.mocked(issueRepository.findById).mockResolvedValue(
        buildIssue({ status: "SCHEDULED" }),
      );

      await expect(
        issueService.reopenIssue(manager.id, issueId),
      ).rejects.toThrow(ValidationError);
      expect(issueRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("getUnitRepairHistory", () => {
    const buildRepair = (resolvedAt: string, costRon: number | null) => ({
      ...buildIssue({ status: "RESOLVED" }),
      resolution: "REPAIRED" as const,
      resolvedAt: new Date(resolvedAt),
      costRon: costRon === null ? null : new Prisma.Decimal(costRon),
      unit: { name: unit.name },
      appliance: null,
      resolvedByHandyman: null,
    });

    beforeEach(() => {
      vi.useFakeTimers({ now: new Date("2026-11-22T12:00:00Z") });
      vi.mocked(unitService.getUnit).mockResolvedValue(unit);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("sums the costs of this Bucharest year and of all time", async () => {
      vi.mocked(issueRepository.listResolvedByUnitId).mockResolvedValue([
        buildRepair("2026-06-10T09:00:00Z", 350.5),
        buildRepair("2025-12-31T22:30:00Z", 200),
        buildRepair("2025-12-31T21:30:00Z", 100),
        buildRepair("2026-02-01T09:00:00Z", null),
      ]);

      const history = await issueService.getUnitRepairHistory(
        manager.id,
        unitId,
      );

      expect(history.totalCostRonThisYear).toBe(550.5);
      expect(history.totalCostRonAllTime).toBe(650.5);
      expect(history.repairs[0].costRon).toBe(350.5);
    });

    it("throws a ForbiddenError for a manager of another organization", async () => {
      vi.mocked(unitService.getUnit).mockRejectedValueOnce(
        new ForbiddenError("not a member"),
      );

      await expect(
        issueService.getUnitRepairHistory(manager.id, unitId),
      ).rejects.toThrow(ForbiddenError);
      expect(issueRepository.listResolvedByUnitId).not.toHaveBeenCalled();
    });
  });

  describe("getApplianceRepairHistory", () => {
    it("throws a ForbiddenError for a manager of another organization", async () => {
      vi.mocked(applianceService.getAppliance).mockRejectedValueOnce(
        new ForbiddenError("not a member"),
      );

      await expect(
        issueService.getApplianceRepairHistory(manager.id, "appliance-1"),
      ).rejects.toThrow(ForbiddenError);
      expect(issueRepository.listResolvedByApplianceId).not.toHaveBeenCalled();
    });
  });

  describe("listClosedIssuesForUser", () => {
    it("throws a ForbiddenError for a user without an organization", async () => {
      vi.mocked(organizationService.requireMembership).mockRejectedValueOnce(
        new ForbiddenError("no organization"),
      );

      await expect(
        issueService.listClosedIssuesForUser(manager.id),
      ).rejects.toThrow(ForbiddenError);
      expect(
        issueRepository.listResolvedByOrganizationId,
      ).not.toHaveBeenCalled();
    });
  });

  describe("getIssueSummary", () => {
    const summaryNow = new Date("2026-11-22T12:00:00Z");
    const openIssues = Array.from({ length: 10 }, (_, index) => ({
      id: `open-${index}`,
      unitId: `unit-${index}`,
      applianceId: null,
      description: "The tap drips",
      status: "NEW" as const,
      category: null,
      diagnosis: null,
      emergencyType: null,
      scheduledFor: null,
      scheduledTime: null,
      createdAt: new Date("2026-11-20T10:00:00Z"),
      unit: { name: `Unit ${index}` },
      appliance: null,
      handymanMessages: [],
    }));
    const content = {
      headline: "Zece probleme sunt deschise.",
      points: [{ text: "Robinetul curge în Unit 3.", issueIds: ["open-3"] }],
    };
    const savedSummary = {
      id: "summary-1",
      organizationId: "org-1",
      language: "RO" as const,
      factsFingerprint: getIssueSummaryFactsFingerprint(
        buildIssueSummaryFacts(openIssues, [], summaryNow),
      ),
      content,
      createdAt: summaryNow,
    };

    beforeEach(() => {
      vi.useFakeTimers({ now: summaryNow });
      vi.mocked(organizationService.requireMembership).mockResolvedValue({
        organizationId: "org-1",
        userId: manager.id,
        role: "MANAGER",
        createdAt: summaryNow,
        organization: unit.organization,
      });
      vi.mocked(
        issueRepository.listOpenForSummaryByOrganizationId,
      ).mockResolvedValue(openIssues);
      vi.mocked(
        issueRepository.listResolvedApplianceIssuesSinceByOrganizationId,
      ).mockResolvedValue([]);
      vi.mocked(
        issueSummaryRepository.findByOrganizationIdAndLanguage,
      ).mockResolvedValue(null);
      vi.mocked(issueSummaryService.summarize).mockResolvedValue(content);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("throws a ForbiddenError for a user without an organization", async () => {
      vi.mocked(organizationService.requireMembership).mockRejectedValueOnce(
        new ForbiddenError("no organization"),
      );

      await expect(issueService.getIssueSummary(manager)).rejects.toThrow(
        ForbiddenError,
      );
      expect(
        issueRepository.listOpenForSummaryByOrganizationId,
      ).not.toHaveBeenCalled();
      expect(issueSummaryService.summarize).not.toHaveBeenCalled();
    });

    it("reads only the issues of the manager's own organization", async () => {
      await issueService.getIssueSummary(manager);

      expect(organizationService.requireMembership).toHaveBeenCalledWith(
        manager.id,
      );
      expect(
        issueRepository.listOpenForSummaryByOrganizationId,
      ).toHaveBeenCalledWith("org-1");
      expect(
        issueRepository.listResolvedApplianceIssuesSinceByOrganizationId,
      ).toHaveBeenCalledWith("org-1", new Date("2026-08-24T12:00:00Z"));
    });

    it("returns nothing and calls no model below 10 open issues", async () => {
      vi.mocked(
        issueRepository.listOpenForSummaryByOrganizationId,
      ).mockResolvedValueOnce(openIssues.slice(1));

      await expect(issueService.getIssueSummary(manager)).resolves.toBeNull();
      expect(issueSummaryService.summarize).not.toHaveBeenCalled();
    });

    it("reuses the saved summary when the facts are unchanged", async () => {
      vi.mocked(
        issueSummaryRepository.findByOrganizationIdAndLanguage,
      ).mockResolvedValueOnce(savedSummary);

      await expect(issueService.getIssueSummary(manager)).resolves.toEqual({
        headline: content.headline,
        points: [
          {
            text: content.points[0].text,
            issues: [{ id: "open-3", unitId: "unit-3", unitName: "Unit 3" }],
          },
        ],
      });
      expect(
        issueSummaryRepository.findByOrganizationIdAndLanguage,
      ).toHaveBeenCalledWith("org-1", "RO");
      expect(issueSummaryService.summarize).not.toHaveBeenCalled();
      expect(issueSummaryRepository.upsert).not.toHaveBeenCalled();
    });

    it("generates and saves a new summary when the facts changed", async () => {
      vi.mocked(
        issueSummaryRepository.findByOrganizationIdAndLanguage,
      ).mockResolvedValueOnce({ ...savedSummary, factsFingerprint: "old" });

      await issueService.getIssueSummary(manager);

      expect(issueSummaryService.summarize).toHaveBeenCalledWith(
        expect.objectContaining({ language: "RO", repeatProblems: [] }),
      );
      expect(issueSummaryRepository.upsert).toHaveBeenCalledWith({
        organizationId: "org-1",
        language: "RO",
        factsFingerprint: savedSummary.factsFingerprint,
        content,
      });
    });

    it("returns nothing and saves nothing when the summary call fails", async () => {
      vi.mocked(issueSummaryService.summarize).mockRejectedValueOnce(
        new Error("Vertex unavailable"),
      );

      await expect(issueService.getIssueSummary(manager)).resolves.toBeNull();
      expect(logger.error).toHaveBeenCalled();
      expect(issueSummaryRepository.upsert).not.toHaveBeenCalled();
    });
  });
});
