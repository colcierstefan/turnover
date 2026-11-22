"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { chooseUserLanguageInputSchema } from "@turnover/core/user/schemas/user.schema";
import userService from "@turnover/core/user/services/user.service";

export async function chooseUserLanguage(input: unknown) {
  const { language, returnTo } = chooseUserLanguageInputSchema.parse(input);
  const user = await userService.requireCurrentUser();
  await userService.updateLanguage(user.id, language);
  if (returnTo) redirect(returnTo);
  refresh();
}
