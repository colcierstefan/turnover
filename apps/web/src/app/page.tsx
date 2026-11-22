import { Suspense } from "react";
import { redirect } from "next/navigation";

import organizationService from "@turnover/core/organization/services/organization.service";
import userService from "@turnover/core/user/services/user.service";

import Card from "@/components/card";
import OrganizationCreateForm from "@/features/organization/components/organization/organization-create-form";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Turnover</h1>
      <Suspense fallback={<p>…</p>}>
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

  if (!user.language) redirect("/language");
  if (await organizationService.getMembershipForUser(user.id)) {
    redirect("/units");
  }

  const text = MANAGER_TEXT[user.language].home;

  return (
    <div className="flex flex-col gap-4">
      <p>{text.signedInAs(user.name ?? user.email)}</p>
      <Card title={text.createOrganizationTitle}>
        <p className="text-sm opacity-70">{text.createOrganizationIntro}</p>
        <OrganizationCreateForm language={user.language} />
      </Card>
      <a href="/auth/logout" className="rounded border px-4 py-2 text-center">
        {text.logOut}
      </a>
    </div>
  );
}
