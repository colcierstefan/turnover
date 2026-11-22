import type organizationService from "@turnover/core/organization/services/organization.service";

import Button from "@/components/button";
import { removeManager } from "@/features/organization/actions/organization.actions";

type Members = Awaited<
  ReturnType<typeof organizationService.getTeam>
>["members"];

export default function OrganizationMemberList({
  members,
  canRemoveManagers,
}: Readonly<{ members: Members; canRemoveManagers: boolean }>) {
  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {members.map((member) => (
        <li
          key={member.userId}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">
              {member.user.name ?? member.user.email}
            </p>
            <p className="truncate text-sm opacity-70">
              {member.user.email} ·{" "}
              {member.role === "OWNER" ? "Owner" : "Manager"}
            </p>
          </div>
          {canRemoveManagers && member.role === "MANAGER" && (
            <form action={removeManager}>
              <input type="hidden" name="userId" value={member.userId} />
              <Button type="submit" variant="danger">
                Remove
              </Button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
