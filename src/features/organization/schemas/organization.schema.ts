import { z } from "zod";

export const createOrganizationInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(100),
});
export type CreateOrganizationInput = z.infer<
  typeof createOrganizationInputSchema
>;

export const inviteManagerInputSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
});
export type InviteManagerInput = z.infer<typeof inviteManagerInputSchema>;

export const removeManagerInputSchema = z.object({
  userId: z.uuid(),
});
export type RemoveManagerInput = z.infer<typeof removeManagerInputSchema>;

export const acceptInvitationInputSchema = z.object({
  token: z.string().min(1),
});
export type AcceptInvitationInput = z.infer<typeof acceptInvitationInputSchema>;
