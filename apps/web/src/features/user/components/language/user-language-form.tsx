"use client";

import { useTransition } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import { chooseUserLanguage } from "@/features/user/actions/user.actions";

const LANGUAGE_OPTIONS: ReadonlyArray<{ value: UserLanguage; name: string }> = [
  { value: "EN", name: "English" },
  { value: "RO", name: "Română" },
];

export default function UserLanguageForm({
  language,
  returnTo,
}: Readonly<{ language: UserLanguage | null; returnTo?: string }>) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {LANGUAGE_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={option.value === language ? "primary" : "secondary"}
          aria-pressed={option.value === language}
          disabled={isPending}
          className="flex-1"
          onClick={() =>
            startTransition(() =>
              chooseUserLanguage({ language: option.value, returnTo }),
            )
          }
        >
          {option.name}
        </Button>
      ))}
    </div>
  );
}
