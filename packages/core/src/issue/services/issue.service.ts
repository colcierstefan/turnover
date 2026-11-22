import "server-only";

import { randomUUID } from "node:crypto";

import applianceService from "@turnover/core/appliance/services/appliance.service";
import { MAX_REPORTS_PER_UNIT_PER_HOUR } from "@turnover/core/issue/constants/issue.constants";
import issueFollowUpRepository from "@turnover/core/issue/repositories/issue-follow-up.repository";
import issuePhotoRepository from "@turnover/core/issue/repositories/issue-photo.repository";
import issueRepository from "@turnover/core/issue/repositories/issue.repository";
import type {
  AnswerIssueFollowUpsInput,
  ReportedIssueInput,
  SubmitIssueReportInput,
} from "@turnover/core/issue/schemas/issue.schema";
import {
  reportTriageInputSchema,
  type UnitAppliance,
} from "@turnover/core/issue/schemas/report-triage.schema";
import { selfHelpTipsInputSchema } from "@turnover/core/issue/schemas/self-help-tips.schema";
import reportTriageService from "@turnover/core/issue/services/report-triage.service";
import selfHelpTipsService from "@turnover/core/issue/services/self-help-tips.service";
import type { IssueReportStep } from "@turnover/core/issue/types/issue-report.types";
import {
  NotFoundError,
  TooManyRequestsError,
  ValidationError,
} from "@turnover/core/lib/errors";
import logger from "@turnover/core/lib/logger";
import { bucket } from "@turnover/core/lib/storage";
import unitService from "@turnover/core/unit/services/unit.service";
import { getUnitStoragePrefix } from "@turnover/core/utils/storage.utils";

type Issue = NonNullable<Awaited<ReturnType<typeof issueRepository.findById>>>;

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
    const photos = await Promise.all(
      input.photos.map(async (file) => {
        const id = randomUUID();
        const storagePath = `${getUnitStoragePrefix(unit.id)}issues/${issue.id}/${id}`;
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
