import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { issueChatRequestContextSchema } from "@turnover/core/agents/issue-chat/schemas/issue-chat-request-context.schema";
import { readInOrganization } from "@turnover/core/agents/issue-chat/utils/issue-chat-tool.utils";
import applianceService from "@turnover/core/appliance/services/appliance.service";
import { getWarrantyStatus } from "@turnover/core/issue/utils/appliance-warranty.utils";
import { toIsoDate } from "@turnover/core/utils/date.utils";

export const listAppliancesTool = createTool({
  id: "list-appliances",
  description:
    "List the appliances in the manager's units with id, unit, category, brand, model, purchase date and price in RON, warranty end and warrantyStatus (UNDER_WARRANTY, EXPIRED or UNKNOWN as of today). Use it to find an appliance's id from the question.",
  requestContextSchema: issueChatRequestContextSchema,
  inputSchema: z.object({
    unitId: z
      .string()
      .min(1)
      .optional()
      .describe("Only this unit's appliances. Omit for every unit."),
    isRetiredIncluded: z
      .boolean()
      .default(false)
      .describe(
        "Also list retired appliances (replaced ones that keep their history). Only when the question is about replaced or old appliances.",
      ),
  }),
  execute: async ({ unitId, isRetiredIncluded }, { requestContext }) =>
    readInOrganization(async () => {
      const today = new Date(requestContext.get("today"));
      const appliances = await applianceService.listOrganizationAppliances(
        requestContext.get("userId"),
        { unitId, isRetiredIncluded },
      );
      return {
        appliances: appliances.map((appliance) => ({
          id: appliance.id,
          unitId: appliance.unitId,
          unitName: appliance.unit.name,
          category: appliance.category,
          brand: appliance.brand,
          model: appliance.model,
          purchaseDate:
            appliance.purchaseDate && toIsoDate(appliance.purchaseDate),
          purchasePriceRon: appliance.purchasePriceRon,
          warrantyUntil:
            appliance.warrantyUntil && toIsoDate(appliance.warrantyUntil),
          warrantyStatus: getWarrantyStatus(appliance.warrantyUntil, today),
          isRetired: appliance.retiredAt !== null,
        })),
      };
    }),
});
