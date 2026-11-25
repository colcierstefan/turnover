import { generateText, Output } from "ai";
import { z } from "zod";

import env from "@turnover/core/config/env.config";
import type { SummaryEvalCase } from "@turnover/core/issue/evals/issue-summary.dataset";
import { buildIssueSummaryPrompt } from "@turnover/core/issue/prompts/issue-summary.prompts";
import type { IssueSummaryContent } from "@turnover/core/issue/schemas/issue-summary.schema";
import vertex from "@turnover/core/lib/vertex";

export const ISSUE_SUMMARY_JUDGE_NAME = "issue-summary-judge";

const summaryJudgeSchema = z.object({
  numbersMatchFacts: z
    .boolean()
    .describe(
      "True when every number in the headline and points (counts, days, RON amounts, times) appears in the facts or the instructions with the same meaning. A number the facts do not contain, one attached to the wrong issue, a number given for several issues that is not true for each of them, numbers of different issues combined into a range, or an estimate range cut down to one end makes it false. Saying one given number is higher or lower than another is fine. Leaving numbers out is fine. Judge only the numbers the summary contains.",
    ),
  linksMatchPoints: z
    .boolean()
    .describe(
      "True when each point's linked issue ids are the issues its text talks about, and none of them is unrelated to the text.",
    ),
  problems: z
    .array(z.string())
    .describe(
      "Each mistake that made one of the two checks above fail, one short sentence each. Nothing about priority, style or completeness. Empty when both checks pass.",
    ),
});

export const scoreSummary = async (
  evalCase: SummaryEvalCase,
  summary: IssueSummaryContent,
) => {
  const { openIssues, repeatProblems } = evalCase.facts;
  const linkedIds = new Set(summary.points.flatMap((point) => point.issueIds));
  const emergencyIds = openIssues
    .filter((issue) => issue.emergencyType)
    .map((issue) => issue.id);
  const judgement = await judgeSummary(evalCase, summary);
  return {
    score: {
      mentionsEveryEmergency: emergencyIds.every((id) => linkedIds.has(id)),
      ...(emergencyIds.length > 0 && {
        startsWithEmergency: summary.points[0].issueIds.some((id) =>
          emergencyIds.includes(id),
        ),
      }),
      ...(repeatProblems.length > 0 && {
        flagsRepeatProblems: repeatProblems.every((problem) =>
          [...problem.closedIssueIds, ...problem.openIssueIds].some((id) =>
            linkedIds.has(id),
          ),
        ),
      }),
      numbersMatchFacts: judgement.numbersMatchFacts,
      linksMatchPoints: judgement.linksMatchPoints,
    },
    problems: judgement.problems,
  };
};

const judgeSummary = async (
  evalCase: SummaryEvalCase,
  summary: IssueSummaryContent,
) => {
  const { output } = await generateText({
    model: vertex(env.vertex.modelId),
    output: Output.object({ schema: summaryJudgeSchema }),
    prompt: `You check a summary another model wrote for a rental apartment manager from the facts below. The facts are correct. Read every number in the summary and look it up in the facts. The summary may be in Romanian: translated wording around a number (for example "între 350 și 550 RON" or "350 la 550 RON" for "350 to 550 RON") is fine; only the numbers and what they belong to matter.

Facts and instructions the summary was written from:
"""${buildIssueSummaryPrompt({ ...evalCase.facts, language: evalCase.language })}"""

Summary:
${JSON.stringify(summary, null, 2)}`,
    providerOptions: {
      vertex: { thinkingConfig: { thinkingLevel: "medium" } },
    },
    telemetry: { functionId: ISSUE_SUMMARY_JUDGE_NAME },
  });
  return output;
};
