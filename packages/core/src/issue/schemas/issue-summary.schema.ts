import { z } from "zod";

import { ISSUE_SUMMARY_MAX_POINTS } from "@turnover/core/issue/constants/issue.constants";
import {
  EmergencyType,
  HandymanTrade,
  IssueCategory,
  IssueStatus,
  UserLanguage,
} from "@turnover/db/enums";

const ronRangeSchema = z.object({
  minRon: z.number().int().nonnegative(),
  maxRon: z.number().int().nonnegative(),
});

export const issueSummaryOpenIssueSchema = z.object({
  id: z.string(),
  unitName: z.string(),
  appliance: z.string().nullable(),
  description: z.string(),
  status: z.enum(IssueStatus),
  daysOpen: z.number().int().nonnegative(),
  emergencyType: z.enum(EmergencyType).nullable(),
  visit: z
    .object({ inDays: z.number().int(), time: z.string().nullable() })
    .nullable(),
  category: z.enum(IssueCategory).nullable(),
  trade: z.enum(HandymanTrade).nullable(),
  repairEstimateRon: ronRangeSchema.nullable(),
  newApplianceEstimateRon: ronRangeSchema.nullable(),
  handymanMessagedDaysAgo: z.number().int().nonnegative().nullable(),
});
export type IssueSummaryOpenIssue = z.infer<typeof issueSummaryOpenIssueSchema>;

export const issueSummaryRepeatProblemSchema = z.object({
  appliance: z.string(),
  unitName: z.string(),
  closedIssueCount: z.number().int().min(2),
  repairCostRon: z.number().nonnegative(),
  purchasePriceRon: z.number().nonnegative().nullable(),
  closedIssueIds: z.array(z.string()).min(2),
  openIssueIds: z.array(z.string()),
});
export type IssueSummaryRepeatProblem = z.infer<
  typeof issueSummaryRepeatProblemSchema
>;

export const issueSummaryFactsSchema = z.object({
  openIssues: z.array(issueSummaryOpenIssueSchema),
  repeatProblems: z.array(issueSummaryRepeatProblemSchema),
});
export type IssueSummaryFacts = z.infer<typeof issueSummaryFactsSchema>;

export const issueSummaryInputSchema = issueSummaryFactsSchema.extend({
  language: z.enum(UserLanguage),
});
export type IssueSummaryInput = z.infer<typeof issueSummaryInputSchema>;

export const issueSummaryContentSchema = z.object({
  headline: z.string(),
  points: z
    .array(z.object({ text: z.string(), issueIds: z.array(z.string()) }))
    .max(ISSUE_SUMMARY_MAX_POINTS),
});
export type IssueSummaryContent = z.infer<typeof issueSummaryContentSchema>;

export const buildIssueSummaryOutputSchema = (
  issueIds: ReadonlyArray<string>,
) =>
  z.object({
    headline: z
      .string()
      .describe(
        "One sentence on the overall state of the open issues and what needs attention first, in the requested language.",
      ),
    points: z
      .array(
        z.object({
          text: z
            .string()
            .describe(
              "One or two short sentences in the requested language. Names units and appliances, never issue ids.",
            ),
          issueIds: z
            .array(z.enum(issueIds as [string, ...string[]]))
            .min(1)
            .describe("The ids of the issues this point is about."),
        }),
      )
      .min(1)
      .max(ISSUE_SUMMARY_MAX_POINTS)
      .describe("The points, most urgent first."),
  });
