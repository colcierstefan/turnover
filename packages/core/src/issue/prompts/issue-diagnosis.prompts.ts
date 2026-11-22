import { REPORTER_LANGUAGE_NAMES } from "@turnover/core/issue/prompts/issue-report.prompts";
import type {
  DiagnosisAppliance,
  IssueDiagnosisInput,
} from "@turnover/core/issue/schemas/issue-diagnosis.schema";

export const buildIssueDiagnosisPrompt = (
  input: Omit<IssueDiagnosisInput, "photos">,
) =>
  `You help the manager of a short-term rental apartment in Romania decide what to do about a reported problem. Photos the reporter attached, if any, come before this text.

Reported by: ${input.reporterRole.toLowerCase()}
Description: """${input.description}"""${
    input.emergencyType
      ? `\nThe reporter was shown emergency instructions for: ${input.emergencyType}`
      : ""
  }${formatFollowUps(input.followUps)}

Appliances in this apartment:
${
  input.appliances.length === 0
    ? "none listed"
    : input.appliances.map(formatAppliance).join("\n")
}${
    input.confirmedApplianceId
      ? `\nThe manager confirmed the issue is about appliance ${input.confirmedApplianceId}.`
      : ""
  }

Today is ${input.today}.

Diagnose the problem:
- applianceId: the appliance above the issue is about, or null when it is about none of them (plumbing, electrics, doors, furniture, or an appliance that is not listed).
- category, likelyCause and trade as the schema describes. Choose the most likely cause; do not list every possibility.
- nextSteps: what the manager does next. When the appliance is under warranty, the first step is to ask the seller or the brand's authorised service for a warranty repair instead of paying a handyman. When the warranty ended or is unknown, do not mention it. For an emergency, the first step is making the apartment safe.

Estimate the costs as a Romanian customer would pay them today, in RON including VAT:
- partCostRon: the part alone from a Romanian shop or spare-parts site, original or a good compatible part.
- labourCostRon: what a Romanian handyman or service charges for this job, including the call-out. Null when the manager can fit the part without tools or skill.
- newApplianceCostRon: a comparable new appliance of the same kind, class and size, without installation, except an air conditioner, which includes a standard installation. Give it whenever the issue is about an appliance, even when a repair is the better choice, so the manager can compare.
- Every range is realistic and narrow: the maximum is at most about one and a half times the minimum.
- Estimate the costs as if paid even when the appliance is under warranty.

Write likelyCause and nextSteps in ${REPORTER_LANGUAGE_NAMES[input.language]}. Do not name shops or give links.`;

const formatFollowUps = (followUps: IssueDiagnosisInput["followUps"]) =>
  followUps.length === 0
    ? ""
    : `\nFollow-up questions and the reporter's answers:\n${followUps
        .map(
          ({ question, answer }) =>
            `- Q: ${question}\n  A: ${answer || "(no answer)"}`,
        )
        .join("\n")}`;

const formatAppliance = (appliance: DiagnosisAppliance) =>
  `- id ${appliance.id}: ${[
    [appliance.category, appliance.brand, appliance.model]
      .filter(Boolean)
      .join(" "),
    appliance.manufactureDate && `manufactured ${appliance.manufactureDate}`,
    appliance.purchaseDate && `bought ${appliance.purchaseDate}`,
    formatWarranty(appliance),
  ]
    .filter(Boolean)
    .join(", ")}`;

const formatWarranty = (appliance: DiagnosisAppliance) => {
  switch (appliance.warrantyStatus) {
    case "UNDER_WARRANTY":
      return `under warranty until ${appliance.warrantyUntil}`;
    case "EXPIRED":
      return `warranty ended ${appliance.warrantyUntil}`;
    case "UNKNOWN":
      return "warranty unknown";
  }
};
