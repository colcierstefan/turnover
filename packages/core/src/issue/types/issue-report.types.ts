import type { EmergencyType } from "@turnover/db/enums";

export type IssueReportStep =
  | { step: "SENT"; issueId: string }
  | { step: "EMERGENCY"; issueId: string; emergencyType: EmergencyType }
  | {
      step: "FOLLOW_UPS";
      issueId: string;
      followUps: ReadonlyArray<{ id: string; question: string }>;
    }
  | { step: "TIPS"; issueId: string; tips: ReadonlyArray<string> };
