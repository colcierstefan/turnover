import {
  formatReportContext,
  REPORTER_LANGUAGE_NAMES,
} from "@turnover/core/issue/prompts/issue-report.prompts";
import type { SelfHelpTipsInput } from "@turnover/core/issue/schemas/self-help-tips.schema";

export const buildSelfHelpTipsPrompt = (input: SelfHelpTipsInput) =>
  `A guest or cleaner in a short-term rental apartment reported a problem. The manager has been told. Before a handyman comes, suggest safe things the reporter can try themselves, if any apply.

${formatReportContext(input)}
${formatFollowUps(input.followUps)}

Allowed tips are things any guest can do without tools and without risk:
- switching a tripped switch in the apartment's breaker panel back up, or resetting a tripped socket (RCD) button
- turning off the child lock or key lock on an appliance, using its buttons as the manual describes
- closing a door or lid properly, choosing a program again, pressing the appliance's own reset or start button
- unplugging an appliance, waiting a minute and plugging it back in
- opening or closing a water valve under a sink or by the appliance
- cleaning a filter the user is meant to clean (dishwasher filter, extractor hood grease filter, AC air filter that slides out from the front)
- checking that the remote has batteries, that the TV input is right, that the water or gas supply valve is open

Never suggest:
- opening, unscrewing or taking apart an appliance, or removing or lifting any lid, cover, panel or casing, including a toilet cistern lid or the front panel of an air conditioner
- reaching behind or under an appliance or sink to check hoses, pipes or connections (turning a valve handle within reach is fine)
- anything with wiring, sockets, fuses beyond flipping the breaker switch, or the electrical installation
- anything with gas pipes, gas connections or a gas boiler beyond reading its display
- climbing, lifting or moving heavy appliances, or using tools or chemicals

Rules:
- Every tip must be one of the allowed kinds above. When a useful step is not on that list, leave it out.
- Only give tips that fit this report and the answers. A broken part, damaged item or anything only a handyman can fix gets no tips.
- At most 4 tips, each one short instruction, most likely first.
- Return no tips when nothing safe applies. An empty list is a good answer.
- Write the tips in ${REPORTER_LANGUAGE_NAMES[input.reporterLanguage]}.`;

const formatFollowUps = (followUps: SelfHelpTipsInput["followUps"]) =>
  followUps.length === 0
    ? ""
    : `\nFollow-up questions and the reporter's answers:\n${followUps
        .map(
          ({ question, answer }) =>
            `- Q: ${question}\n  A: ${answer || "(no answer)"}`,
        )
        .join("\n")}\n`;
