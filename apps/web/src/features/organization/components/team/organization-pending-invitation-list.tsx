import CopyButton from "@/components/copy-button";

export default function OrganizationPendingInvitationList({
  invitations,
}: Readonly<{
  invitations: ReadonlyArray<{
    id: string;
    email: string;
    expiresAt: Date;
    invitationUrl: string;
  }>;
}>) {
  if (invitations.length === 0) {
    return <p className="text-sm opacity-70">No pending invites.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {invitations.map((invitation) => (
        <li
          key={invitation.id}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{invitation.email}</p>
            <p className="text-sm opacity-70">
              Expires {invitation.expiresAt.toLocaleDateString("en-GB")}
            </p>
          </div>
          <CopyButton text={invitation.invitationUrl} />
        </li>
      ))}
    </ul>
  );
}
