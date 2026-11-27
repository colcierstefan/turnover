import { z } from "zod";

const MAX_MESSAGE_LENGTH = 2000;

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().max(MAX_MESSAGE_LENGTH),
});

export const issueChatMessagesSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      role: z.enum(["user", "assistant"]),
      parts: z.array(z.looseObject({ type: z.string() })),
    }),
  )
  .min(1)
  .transform((messages) =>
    messages.map((message) => ({
      ...message,
      parts: message.parts.flatMap((part) => {
        const textPart = textPartSchema.safeParse(part);
        return textPart.success ? [textPart.data] : [];
      }),
    })),
  )
  .refine((messages) => messages.at(-1)?.role === "user");
export type IssueChatMessages = z.infer<typeof issueChatMessagesSchema>;
