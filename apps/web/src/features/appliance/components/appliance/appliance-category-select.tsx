import { EMPTY_FIELD_CLASSES } from "@turnover/core/appliance/constants/appliance.constants";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function ApplianceCategorySelect({
  name,
  defaultValue,
  isHighlighted,
  language,
}: Readonly<{
  name: string;
  defaultValue: string;
  isHighlighted: boolean;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language].appliance;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{text.categoryLabel}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required
        className={`rounded border border-foreground/20 bg-background px-3 py-2 text-base ${isHighlighted ? EMPTY_FIELD_CLASSES : ""}`}
      >
        <option value="" disabled>
          {text.chooseCategory}
        </option>
        {Object.entries(text.categories).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
