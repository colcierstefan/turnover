import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import CopyButton from "@/components/copy-button";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function OrganizationPendingInvitationList({
  invitations,
  language,
}: Readonly<{
  invitations: ReadonlyArray<{
    id: string;
    email: string;
    expiresAt: Date;
    invitationUrl: string;
  }>;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language];
  const dateFormat = new Intl.DateTimeFormat(text.locale);

  if (invitations.length === 0) {
    return <p className="text-sm opacity-70">{text.team.noPending}</p>;
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
              {text.team.expires(dateFormat.format(invitation.expiresAt))}
            </p>
          </div>
          <CopyButton
            text={invitation.invitationUrl}
            copyLabel={text.copyLink}
            copiedLabel={text.copied}
          />
        </li>
      ))}
    </ul>
  );
}
