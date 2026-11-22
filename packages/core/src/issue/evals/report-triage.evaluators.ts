import { generateText, Output } from "ai";
import { z } from "zod";

import env from "@turnover/core/config/env.config";
import type { IssueReportEvalCase } from "@turnover/core/issue/evals/issue-report.dataset";
import { REPORTER_LANGUAGE_NAMES } from "@turnover/core/issue/prompts/issue-report.prompts";
import type { ReportTriageOutput } from "@turnover/core/issue/schemas/report-triage.schema";
import vertex from "@turnover/core/lib/vertex";
import { matchesExpected } from "@turnover/core/utils/eval.utils";

export const REPORT_TRIAGE_JUDGE_NAME = "report-triage-judge";

const languageJudgeSchema = z.object({
  isInLanguage: z
    .boolean()
    .describe("True when every question is written in the expected language."),
});

export const scoreReportTriage = async (
  evalCase: IssueReportEvalCase,
  actual: ReportTriageOutput,
) => ({
  emergencyType: matchesExpected(
    evalCase.expected.emergencyType,
    actual.emergencyType,
    (left, right) => left === right,
  ),
  questionsInLanguage:
    actual.questions.length === 0 ||
    (await judgeLanguage(actual.questions, evalCase.language)),
});

const judgeLanguage = async (
  questions: ReadonlyArray<string>,
  language: IssueReportEvalCase["language"],
) => {
  const { output } = await generateText({
    model: vertex(env.vertex.modelId),
    output: Output.object({ schema: languageJudgeSchema }),
    prompt: `Are all of these questions written in ${REPORTER_LANGUAGE_NAMES[language]}?\n\n${questions.map((question) => `- ${question}`).join("\n")}`,
    providerOptions: {
      vertex: { thinkingConfig: { thinkingLevel: "minimal" } },
    },
    telemetry: { functionId: REPORT_TRIAGE_JUDGE_NAME },
  });
  return output.isInLanguage;
};
