import type { ReportTriageInput } from "@turnover/core/issue/schemas/report-triage.schema";
import type { ReporterLanguage } from "@turnover/db/enums";

export const REPORTER_LANGUAGE_NAMES: Record<ReporterLanguage, string> = {
  EN: "English",
  RO: "Romanian",
};

export const formatReportContext = (
  input: Pick<ReportTriageInput, "description" | "reporterRole" | "appliances">,
) => `Reporter: ${input.reporterRole.toLowerCase()}
Description: """${input.description}"""
Appliances in this apartment: ${
  input.appliances.length === 0
    ? "not listed"
    : input.appliances
        .map((appliance) =>
          [appliance.category, appliance.brand, appliance.model]
            .filter(Boolean)
            .join(" "),
        )
        .join("; ")
}`;
