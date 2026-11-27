import { z } from "zod";

import { UserLanguage } from "@turnover/db/enums";

export const issueChatRequestContextSchema = z.object({
  userId: z.string().min(1),
  language: z.enum(UserLanguage),
  today: z.iso.date(),
});
export type IssueChatRequestContext = z.infer<
  typeof issueChatRequestContextSchema
>;
