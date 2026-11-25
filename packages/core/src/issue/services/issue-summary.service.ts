import "server-only";

import { generateText, Output } from "ai";

import env from "@turnover/core/config/env.config";
import { buildIssueSummaryPrompt } from "@turnover/core/issue/prompts/issue-summary.prompts";
import {
  buildIssueSummaryOutputSchema,
  type IssueSummaryInput,
} from "@turnover/core/issue/schemas/issue-summary.schema";
import vertex from "@turnover/core/lib/vertex";

class IssueSummaryService {
  async summarize(input: IssueSummaryInput) {
    const { output } = await generateText({
      model: vertex(env.vertex.modelId),
      output: Output.object({
        schema: buildIssueSummaryOutputSchema([
          ...input.openIssues.map((issue) => issue.id),
          ...input.repeatProblems.flatMap((problem) => problem.closedIssueIds),
        ]),
      }),
      prompt: buildIssueSummaryPrompt(input),
      providerOptions: {
        vertex: { thinkingConfig: { thinkingLevel: "low" } },
      },
      telemetry: { functionId: "issue-summary" },
    });
    return output;
  }
}

const issueSummaryService = new IssueSummaryService();
export default issueSummaryService;
