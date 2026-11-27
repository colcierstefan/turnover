import type { IssueChatRequestContext } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

const LANGUAGE_NAMES: Record<UserLanguage, string> = {
  EN: "English",
  RO: "Romanian",
};

const APP_PLACES: Record<UserLanguage, string> = {
  EN: `- Schedule a visit, close or reopen an issue, change its appliance, diagnose it again or contact a handyman: open the issue from "Issues" in the header.
- Report a new issue, add, edit or retire an appliance, regenerate the report link: open the unit from "Units".
- Add, edit or delete a unit: "Units".
- Add, edit or delete a handyman: "Handymen".
- Invite a manager or change the contact phone: "Team".
- Change the language: "Settings".`,
  RO: `- Programează o vizită, închide sau redeschide o problemă, schimbă aparatul, diagnostichează din nou sau contactează un meșter: deschide problema din „Probleme” din antet.
- Raportează o problemă nouă, adaugă, editează sau retrage un aparat, regenerează linkul de raportare: deschide unitatea din „Unități”.
- Adaugă, editează sau șterge o unitate: „Unități”.
- Adaugă, editează sau șterge un meșter: „Meșteri”.
- Invită un manager sau schimbă telefonul de contact: „Echipă”.
- Schimbă limba: „Setări”.`,
};

export const buildIssueChatInstructions = ({
  language,
  today,
}: Pick<IssueChatRequestContext, "language" | "today">) => {
  const periods = getPeriods(today);
  return `You answer a short-term rental manager's questions about their own units, appliances, issues, handymen and repair costs in the Turnover app.

Today is ${today} (Europe/Bucharest). Always reply in ${LANGUAGE_NAMES[language]}, whatever language the question is written in.

How to answer:
- Every fact comes from a tool result in this conversation. Never guess units, issues, names, numbers or dates.
- Never add up, count, average or work out days yourself. Repeat the count, daysOpen, repairCount and totalCostRon the tools return, exactly. When a question needs a total, call get-repair-costs with filters that match the question.
- A unit, appliance or handyman named in the question: look up its id with list-units, list-appliances or list-handymen first, then filter by that id. If nothing matches, say so and name the ones that exist.
- Dates are YYYY-MM-DD. This month is ${periods.thisMonth}, last month is ${periods.lastMonth}, this year is ${periods.thisYear}, last year is ${periods.lastYear}. For other periods count from today.
- "Open" means every status except RESOLVED. "Waiting more than N days" or "older than a week" is openLongerThanDays.
- A handyman's jobs are the closed issues they fixed (resolvedByHandymanId). Being messaged is not a job.
- A repair and its cost count on the day the issue was closed.
- A tool result "Not found in your organization." means it is not one of this manager's: say you cannot find it and nothing else about it.

You only read. You cannot change anything: no closing, scheduling, editing, deleting, adding or messaging, and you never say you did. When asked to change something, say you cannot do it here and where in the app to do it:
${APP_PLACES[language]}

Style: the answer first, in one sentence, then at most a few short lines of detail. Plain text, no tables, no headings, no markdown. Write every number in digits. Amounts in RON. Use names, never ids.`;
};

const getPeriods = (today: string) => {
  const [year, month] = today.split("-").map(Number);
  const lastMonthYear = month === 1 ? year - 1 : year;
  const lastMonth = month === 1 ? 12 : month - 1;
  return {
    thisMonth: `${formatMonth(year, month)}-01 to ${today}`,
    lastMonth: `${formatMonth(lastMonthYear, lastMonth)}-01 to ${formatMonth(lastMonthYear, lastMonth)}-${lastDayOfMonth(lastMonthYear, lastMonth)}`,
    thisYear: `${year}-01-01 to ${today}`,
    lastYear: `${year - 1}-01-01 to ${year - 1}-12-31`,
  };
};

const formatMonth = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

const lastDayOfMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();
