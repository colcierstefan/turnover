import { Suspense } from "react";

import userService from "@/features/user/services/user.service";

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

  return (
    <div className="flex flex-col gap-4">
      <p>Signed in as {user.name ?? user.email}</p>
      <a href="/auth/logout" className="rounded border px-4 py-2 text-center">
        Log out
      </a>
    </div>
  );
}
