import { Suspense } from "react";
import { redirect } from "next/navigation";

import userService from "@turnover/core/user/services/user.service";

import UserLanguageForm from "@/features/user/components/language/user-language-form";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function LanguagePage({ searchParams }: PageProps<"/language">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Turnover</h1>
      <Suspense fallback={<p>…</p>}>
        <Language searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Language({
  searchParams,
}: Readonly<{ searchParams: PageProps<"/language">["searchParams"] }>) {
  const { returnTo } = await searchParams;
  const returnPath = typeof returnTo === "string" ? returnTo : "/";
  const user = await userService.getCurrentUser();
  if (!user) {
    redirect(
      `/auth/login?returnTo=${encodeURIComponent(`/language?returnTo=${encodeURIComponent(returnPath)}`)}`,
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p>
        {MANAGER_TEXT.EN.chooseLanguage}
        <br />
        {MANAGER_TEXT.RO.chooseLanguage}
      </p>
      <UserLanguageForm language={user.language} returnTo={returnPath} />
    </div>
  );
}
