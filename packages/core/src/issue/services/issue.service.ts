import "server-only";

import { randomUUID } from "node:crypto";

import applianceService from "@turnover/core/appliance/services/appliance.service";
import { MAX_REPORTS_PER_UNIT_PER_HOUR } from "@turnover/core/issue/constants/issue.constants";
import issueFollowUpRepository from "@turnover/core/issue/repositories/issue-follow-up.repository";
import issuePhotoRepository from "@turnover/core/issue/repositories/issue-photo.repository";
import issueRepository from "@turnover/core/issue/repositories/issue.repository";
import {
  issueDiagnosisInputSchema,
  storedIssueDiagnosisSchema,
} from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import type {
  AnswerIssueFollowUpsInput,
  ChangeIssueApplianceInput,
  ReportedIssueInput,
  ReportIssueAsManagerInput,
  SubmitIssueReportInput,
} from "@turnover/core/issue/schemas/issue.schema";
import {
  reportTriageInputSchema,
  type UnitAppliance,
} from "@turnover/core/issue/schemas/report-triage.schema";
import {
  selfHelpTipsInputSchema,
  selfHelpTipsOutputSchema,
} from "@turnover/core/issue/schemas/self-help-tips.schema";
import issueDiagnosisService from "@turnover/core/issue/services/issue-diagnosis.service";
import reportTriageService from "@turnover/core/issue/services/report-triage.service";
import selfHelpTipsService from "@turnover/core/issue/services/self-help-tips.service";
import type { IssueReportStep } from "@turnover/core/issue/types/issue-report.types";
import { getWarrantyStatus } from "@turnover/core/issue/utils/appliance-warranty.utils";
import {
  NotFoundError,
  TooManyRequestsError,
  ValidationError,
} from "@turnover/core/lib/errors";
import logger from "@turnover/core/lib/logger";
import { bucket } from "@turnover/core/lib/storage";
import organizationService from "@turnover/core/organization/services/organization.service";
import unitService from "@turnover/core/unit/services/unit.service";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";
import { toIsoDate } from "@turnover/core/utils/date.utils";
import { getUnitStoragePrefix } from "@turnover/core/utils/storage.utils";

type Issue = NonNullable<Awaited<ReturnType<typeof issueRepository.findById>>>;
type IssueDetails = NonNullable<
  Awaited<ReturnType<typeof issueRepository.findDetailsById>>
>;
type Manager = Readonly<{
  id: string;
  name: string | null;
  language: UserLanguage;
}>;

const HOUR_MS = 60 * 60 * 1000;

class IssueService {
  async submitReport(input: SubmitIssueReportInput): Promise<IssueReportStep> {
    const unit = await getReportedUnit(input.reportToken);
    const recentCount = await issueRepository.countByUnitIdSince(
      unit.id,
      new Date(Date.now() - HOUR_MS),
    );
    if (recentCount >= MAX_REPORTS_PER_UNIT_PER_HOUR) {
      throw new TooManyRequestsError(
        `Unit ${unit.id} reached ${MAX_REPORTS_PER_UNIT_PER_HOUR} reports this hour`,
      );
    }

    const issue = await issueRepository.create({
      unitId: unit.id,
      reporterRole: input.reporterRole,
      reporterName: input.reporterName,
      reporterLanguage: input.reporterLanguage,
      description: input.description,
    });
    const photos = await saveIssuePhotos(issue, input.photos);

    const appliances = await applianceService.listAppliancesByReportToken(
      input.reportToken,
    );
    let triage;
    try {
      triage = await reportTriageService.triage(
        reportTriageInputSchema.parse({
          ...toReport(issue, appliances),
          photos,
        }),
      );
    } catch (error) {
      logger.error({ err: error, issueId: issue.id }, "Report triage failed");
      return { step: "SENT", issueId: issue.id };
    }

    if (triage.emergencyType) {
      await issueRepository.update(issue.id, {
        isEmergency: true,
        emergencyType: triage.emergencyType,
      });
      return {
        step: "EMERGENCY",
        issueId: issue.id,
        emergencyType: triage.emergencyType,
      };
    }

    if (triage.questions.length > 0) {
      const followUps = await issueFollowUpRepository.createMany(
        triage.questions.map((question) => ({ issueId: issue.id, question })),
      );
      return {
        step: "FOLLOW_UPS",
        issueId: issue.id,
        followUps: followUps.map(({ id, question }) => ({ id, question })),
      };
    }

    return suggestTips(issue, appliances);
  }

  async answerFollowUps(
    input: AnswerIssueFollowUpsInput,
  ): Promise<IssueReportStep> {
    const issue = await getOpenReportedIssue(input);
    const followUps = await issueFollowUpRepository.listByIssueId(issue.id);
    for (const { followUpId, answer } of input.answers) {
      if (!followUps.some((followUp) => followUp.id === followUpId)) {
        throw new NotFoundError(
          `Follow-up ${followUpId} is not on issue ${issue.id}`,
        );
      }
      await issueFollowUpRepository.update(followUpId, {
        answer: answer || null,
      });
    }

    const appliances = await applianceService.listAppliancesByReportToken(
      input.reportToken,
    );
    return suggestTips(issue, appliances);
  }

  async markFixedByReporter(input: ReportedIssueInput) {
    const issue = await getOpenReportedIssue(input);
    await issueRepository.update(issue.id, {
      status: "RESOLVED",
      resolvedByReporter: true,
      resolvedAt: new Date(),
    });
  }

  async confirmStillBrokenByReporter(input: ReportedIssueInput) {
    await getOpenReportedIssue(input);
  }

  async diagnoseReportedIssue(issueId: string) {
    const issue = await getIssueDetails(issueId);
    const ownerLanguage = await organizationService.getOwnerLanguage(
      issue.unit.organizationId,
    );
    try {
      await diagnose(issue, ownerLanguage ?? issue.reporterLanguage);
    } catch (error) {
      logger.error({ err: error, issueId }, "Issue diagnosis failed");
    }
  }

  async diagnoseIssue(manager: Manager, issueId: string) {
    const issue = await getIssueDetails(issueId);
    await unitService.getUnit(manager.id, issue.unitId);
    await diagnose(issue, manager.language);
  }

  async reportIssueAsManager(
    manager: Manager,
    input: ReportIssueAsManagerInput,
  ) {
    await unitService.getUnit(manager.id, input.unitId);
    if (input.applianceId) {
      await requireUnitAppliance(input.unitId, input.applianceId);
    }
    const issue = await issueRepository.create({
      unitId: input.unitId,
      applianceId: input.applianceId,
      reporterRole: "MANAGER",
      reporterName: manager.name,
      reporterLanguage: manager.language,
      description: input.description,
    });
    await saveIssuePhotos(issue, input.photos);
    try {
      await diagnose(await getIssueDetails(issue.id), manager.language);
    } catch (error) {
      logger.error({ err: error, issueId: issue.id }, "Issue diagnosis failed");
    }
    return issue;
  }

  async getIssue(userId: string, issueId: string) {
    const issue = await getIssueDetails(issueId);
    await unitService.getUnit(userId, issue.unitId);
    return {
      ...issue,
      costRon: issue.costRon?.toNumber() ?? null,
      selfHelpTips: selfHelpTipsOutputSchema.shape.tips
        .nullable()
        .parse(issue.selfHelpTips),
      diagnosis: storedIssueDiagnosisSchema.nullable().parse(issue.diagnosis),
      appliance: issue.appliance && {
        id: issue.appliance.id,
        category: issue.appliance.category,
        brand: issue.appliance.brand,
        model: issue.appliance.model,
        warrantyUntil: issue.appliance.warrantyUntil,
        warrantyStatus: getWarrantyStatus(
          issue.appliance.warrantyUntil,
          new Date(),
        ),
      },
    };
  }

  async listOpenIssuesForUser(userId: string) {
    const membership = await organizationService.requireMembership(userId);
    return issueRepository.listOpenByOrganizationId(membership.organizationId);
  }

  async changeIssueAppliance(userId: string, input: ChangeIssueApplianceInput) {
    const issue = await issueRepository.findById(input.issueId);
    if (!issue) throw new NotFoundError(`Issue ${input.issueId} not found`);
    await unitService.getUnit(userId, issue.unitId);
    if (input.applianceId) {
      await requireUnitAppliance(issue.unitId, input.applianceId);
    }
    await issueRepository.update(issue.id, { applianceId: input.applianceId });
  }

  async markIssueContacted(issueId: string) {
    const issue = await issueRepository.findById(issueId);
    if (!issue) throw new NotFoundError(`Issue ${issueId} not found`);
    if (issue.status === "NEW" || issue.status === "DIAGNOSED") {
      await issueRepository.update(issueId, { status: "CONTACTED" });
    }
  }

  async getIssuePhotoFile(userId: string, photoId: string) {
    const photo = await issuePhotoRepository.findById(photoId);
    if (!photo) throw new NotFoundError(`Issue photo ${photoId} not found`);
    const issue = await issueRepository.findById(photo.issueId);
    if (!issue) throw new NotFoundError(`Issue ${photo.issueId} not found`);
    await unitService.getUnit(userId, issue.unitId);
    return {
      contentType: photo.contentType,
      stream: bucket.file(photo.storagePath).createReadStream(),
    };
  }

  async listOpenIssues(userId: string, unitId: string) {
    await unitService.getUnit(userId, unitId);
    return issueRepository.listOpenByUnitId(unitId);
  }

  async countIssues(userId: string, unitId: string) {
    await unitService.getUnit(userId, unitId);
    return issueRepository.countByUnitId(unitId);
  }
}

const getReportedUnit = async (reportToken: string) => {
  const unit = await unitService.getUnitByReportToken(reportToken);
  if (!unit) throw new NotFoundError("This report link is no longer valid");
  return unit;
};

const getOpenReportedIssue = async (input: ReportedIssueInput) => {
  const unit = await getReportedUnit(input.reportToken);
  const issue = await issueRepository.findById(input.issueId);
  if (!issue || issue.unitId !== unit.id) {
    throw new NotFoundError(`Issue ${input.issueId} not found`);
  }
  if (issue.status !== "NEW" || issue.isEmergency) {
    throw new ValidationError(
      `Issue ${issue.id} is no longer open to the reporter`,
    );
  }
  return issue;
};

const saveIssuePhotos = (
  issue: Readonly<{ id: string; unitId: string }>,
  files: ReadonlyArray<File>,
) =>
  Promise.all(
    files.map(async (file) => {
      const id = randomUUID();
      const storagePath = `${getUnitStoragePrefix(issue.unitId)}issues/${issue.id}/${id}`;
      await bucket
        .file(storagePath)
        .save(Buffer.from(await file.arrayBuffer()), {
          contentType: file.type,
          resumable: false,
        });
      await issuePhotoRepository.create({
        id,
        issueId: issue.id,
        storagePath,
        contentType: file.type,
      });
      return {
        fileUri: `gs://${bucket.name}/${storagePath}`,
        contentType: file.type,
      };
    }),
  );

const getIssueDetails = async (issueId: string) => {
  const issue = await issueRepository.findDetailsById(issueId);
  if (!issue) throw new NotFoundError(`Issue ${issueId} not found`);
  return issue;
};

const requireUnitAppliance = async (unitId: string, applianceId: string) => {
  const appliances = await applianceService.listAppliancesByUnitId(unitId);
  if (!appliances.some((appliance) => appliance.id === applianceId)) {
    throw new NotFoundError(
      `Appliance ${applianceId} is not in unit ${unitId}`,
    );
  }
};

const diagnose = async (issue: IssueDetails, language: UserLanguage) => {
  const today = new Date();
  const appliances = await applianceService.listAppliancesByUnitId(
    issue.unitId,
  );
  const { applianceId, category, ...diagnosis } =
    await issueDiagnosisService.diagnose(
      issueDiagnosisInputSchema.parse({
        description: issue.description,
        reporterRole: issue.reporterRole,
        emergencyType: issue.emergencyType,
        followUps: issue.followUps.map(({ question, answer }) => ({
          question,
          answer,
        })),
        appliances: appliances.map((appliance) => ({
          id: appliance.id,
          category: appliance.category,
          brand: appliance.brand,
          model: appliance.model,
          manufactureDate: appliance.manufactureDate,
          purchaseDate:
            appliance.purchaseDate && toIsoDate(appliance.purchaseDate),
          warrantyUntil:
            appliance.warrantyUntil && toIsoDate(appliance.warrantyUntil),
          warrantyStatus: getWarrantyStatus(appliance.warrantyUntil, today),
        })),
        confirmedApplianceId: issue.applianceId,
        language,
        today: toIsoDate(today),
        photos: issue.photos.map((photo) => ({
          fileUri: `gs://${bucket.name}/${photo.storagePath}`,
          contentType: photo.contentType,
        })),
      }),
    );
  await issueRepository.update(issue.id, {
    applianceId: issue.applianceId ?? applianceId,
    category,
    diagnosis,
    status: issue.status === "NEW" ? "DIAGNOSED" : issue.status,
  });
};

const toReport = (issue: Issue, appliances: ReadonlyArray<UnitAppliance>) => ({
  description: issue.description,
  reporterRole: issue.reporterRole,
  reporterLanguage: issue.reporterLanguage,
  appliances: appliances.map(({ category, brand, model }) => ({
    category,
    brand,
    model,
  })),
});

const suggestTips = async (
  issue: Issue,
  appliances: ReadonlyArray<UnitAppliance>,
): Promise<IssueReportStep> => {
  const followUps = await issueFollowUpRepository.listByIssueId(issue.id);
  let tips;
  try {
    ({ tips } = await selfHelpTipsService.suggest(
      selfHelpTipsInputSchema.parse({
        ...toReport(issue, appliances),
        followUps: followUps.map(({ question, answer }) => ({
          question,
          answer,
        })),
      }),
    ));
  } catch (error) {
    logger.error({ err: error, issueId: issue.id }, "Self-help tips failed");
    return { step: "SENT", issueId: issue.id };
  }

  await issueRepository.update(issue.id, { selfHelpTips: tips });
  return tips.length > 0
    ? { step: "TIPS", issueId: issue.id, tips }
    : { step: "SENT", issueId: issue.id };
};

const issueService = new IssueService();
export default issueService;
