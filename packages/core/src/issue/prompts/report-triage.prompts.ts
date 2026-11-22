import {
  formatReportContext,
  REPORTER_LANGUAGE_NAMES,
} from "@turnover/core/issue/prompts/issue-report.prompts";
import type { ReportTriageInput } from "@turnover/core/issue/schemas/report-triage.schema";

export const buildReportTriagePrompt = (
  input: Omit<ReportTriageInput, "photos">,
) =>
  `A guest or cleaner in a short-term rental apartment reported a problem. Photos they attached, if any, come before this text.

${formatReportContext(input)}

Step 1: emergency check. Decide this first, from the description and the photos.
- GAS_SMELL: any smell of gas, even faint or uncertain ("smells a bit like gas", "miroase a gaz"), or a gas detector going off.
- WATER_LEAK: water actively coming out where it should not: a burst or leaking pipe, water dripping or running from the ceiling or a wall, a flooding floor, a valve or hose spraying, water that keeps running and cannot be stopped. A slow drip from a closed tap, a toilet that keeps refilling, or water left over after a wash cycle is not an emergency.
- ELECTRICAL_BURNING: a burning or melting plastic smell from a socket, switch, appliance or cable, smoke or sparks from anything electrical, a hot or scorched socket.
When the report could be one of these, choose the emergency. Missing a real emergency is far worse than a false alarm. Otherwise emergencyType is null.

Step 2: only when it is not an emergency, ask up to two follow-up questions, shown together on one screen.
- Questions only gather facts that are still missing: what the reporter sees, hears or smells (for example: is there power anywhere else in the apartment, does the display show an error code, does the appliance make any sound).
- Never suggest a fix or ask whether they tried one ("Have you tried...", "Did you check the breaker...", "Have you cleaned..."). Fixes are suggested in a later step.
- Never ask something the description or photos already answer. When the report already names the symptom clearly (an error code, a symbol on the display, what works and what does not), ask nothing.
- Each question is one short sentence a non-technical guest can answer in a few words.
- Never ask the reporter to open, take apart or test anything.
- Return no questions when the report is already clear enough.
- Write the questions in ${REPORTER_LANGUAGE_NAMES[input.reporterLanguage]}.

For an emergency, questions is empty.`;
