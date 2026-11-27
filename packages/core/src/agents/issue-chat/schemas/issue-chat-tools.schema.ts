import { z } from "zod";

import {
  issueListFiltersSchema,
  repairCostFiltersSchema,
} from "@turnover/core/issue/schemas/issue.schema";

const filters = issueListFiltersSchema.shape;

const resolvedRangeFields = {
  resolvedFrom: filters.resolvedFrom.describe(
    "First day the issue was closed, YYYY-MM-DD, inclusive.",
  ),
  resolvedTo: filters.resolvedTo.describe(
    "Last day the issue was closed, YYYY-MM-DD, inclusive.",
  ),
};

export const listIssuesInputSchema = z.object({
  unitId: filters.unitId.describe(
    "Only issues in this unit (id from list-units).",
  ),
  applianceId: filters.applianceId.describe(
    "Only issues about this appliance (id from list-appliances).",
  ),
  resolvedByHandymanId: filters.resolvedByHandymanId.describe(
    "Only closed issues this handyman fixed (id from list-handymen).",
  ),
  statuses: filters.statuses.describe(
    "Only these statuses: NEW (reported), DIAGNOSED, CONTACTED (a handyman was messaged), SCHEDULED (visit agreed), RESOLVED (closed).",
  ),
  isOpen: filters.isOpen.describe(
    "true for open issues (every status except RESOLVED), false for closed ones.",
  ),
  createdFrom: filters.createdFrom.describe(
    "First day the issue was reported, YYYY-MM-DD, inclusive.",
  ),
  createdTo: filters.createdTo.describe(
    "Last day the issue was reported, YYYY-MM-DD, inclusive.",
  ),
  ...resolvedRangeFields,
  openLongerThanDays: filters.openLongerThanDays.describe(
    'Only open issues reported more than this many days ago. "More than a week" is 7.',
  ),
});

export const getRepairCostsInputSchema = z.object({
  groupBy: repairCostFiltersSchema.shape.groupBy.describe(
    "Split the total by UNIT, APPLIANCE, HANDYMAN (who fixed it) or MONTH (when it was closed). Omit for one total.",
  ),
  unitId: filters.unitId.describe(
    "Only repairs in this unit (id from list-units).",
  ),
  applianceId: filters.applianceId.describe(
    "Only repairs of this appliance (id from list-appliances).",
  ),
  resolvedByHandymanId: filters.resolvedByHandymanId.describe(
    "Only repairs this handyman did (id from list-handymen).",
  ),
  ...resolvedRangeFields,
});
