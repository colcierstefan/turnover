import { z } from "zod";

import { MAX_SELF_HELP_TIPS } from "@turnover/core/issue/constants/issue.constants";
import { reportTriageInputSchema } from "@turnover/core/issue/schemas/report-triage.schema";

export const selfHelpTipsInputSchema = reportTriageInputSchema
  .omit({ photos: true })
  .extend({
    followUps: z.array(
      z.object({ question: z.string(), answer: z.string().nullable() }),
    ),
  });
export type SelfHelpTipsInput = z.infer<typeof selfHelpTipsInputSchema>;

export const selfHelpTipsOutputSchema = z.object({
  tips: z
    .array(z.string())
    .max(MAX_SELF_HELP_TIPS)
    .describe(
      "Safe steps the reporter can try, each one short instruction in the reporter's language. Empty when no safe step applies.",
    ),
});
export type SelfHelpTipsOutput = z.infer<typeof selfHelpTipsOutputSchema>;
