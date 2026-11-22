import { Suspense } from "react";
import { redirect } from "next/navigation";

import organizationService from "@turnover/core/organization/services/organization.service";
import userService from "@turnover/core/user/services/user.service";

import Card from "@/components/card";
import OrganizationCreateForm from "@/features/organization/components/organization/organization-create-form";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Turnover</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Account />
      </Suspense>
    </main>
  );
}

async function Account() {
  const user = await userService.getCurrentUser();

  if (!user) {
    return (
      <a
        href="/auth/login"
        className="rounded bg-foreground px-4 py-2 text-center text-background"
      >
        Log in
      </a>
    );
  }

  if (await organizationService.getMembershipForUser(user.id)) {
    redirect("/units");
  }

  return (
    <div className="flex flex-col gap-4">
      <p>Signed in as {user.name ?? user.email}</p>
      <Card title="Create your organization">
        <p className="text-sm opacity-70">
          Your units and team live in one organization. To join an existing one,
          open the invite link you received.
        </p>
        <OrganizationCreateForm />
      </Card>
      <a href="/auth/logout" className="rounded border px-4 py-2 text-center">
        Log out
      </a>
    </div>
  );
}
