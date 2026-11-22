import { EMPTY_FIELD_CLASSES } from "@turnover/core/appliance/constants/appliance.constants";
import type { ApplianceFields as ApplianceFieldValues } from "@turnover/core/appliance/schemas/appliance.schema";
import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Input from "@/components/input";
import ApplianceCategorySelect from "@/features/appliance/components/appliance/appliance-category-select";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

type ApplianceFieldName = keyof ApplianceFieldValues;

const TEXT_FIELDS: ReadonlyArray<{
  name: Exclude<ApplianceFieldName, "category">;
  type?: string;
  step?: string;
}> = [
  { name: "brand" },
  { name: "model" },
  { name: "serialNumber" },
  { name: "manufactureDate" },
  { name: "purchaseDate", type: "date" },
  { name: "purchasePriceRon", type: "number", step: "0.01" },
  { name: "warrantyUntil", type: "date" },
  { name: "notes" },
];

export default function ApplianceFields({
  namePrefix = "",
  values,
  highlightedFields = [],
  language,
}: Readonly<{
  namePrefix?: string;
  values: Record<ApplianceFieldName, string>;
  highlightedFields?: ReadonlyArray<ApplianceFieldName>;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language].appliance;
  const isHighlighted = (field: ApplianceFieldName) =>
    highlightedFields.includes(field) && values[field] === "";

  return (
    <>
      <ApplianceCategorySelect
        name={`${namePrefix}category`}
        defaultValue={values.category}
        isHighlighted={isHighlighted("category")}
        language={language}
      />
      {TEXT_FIELDS.map((field) => (
        <Input
          key={field.name}
          label={text.fieldLabels[field.name]}
          name={`${namePrefix}${field.name}`}
          type={field.type}
          step={field.step}
          min={field.type === "number" ? "0" : undefined}
          placeholder={text.fieldPlaceholders[field.name]}
          defaultValue={values[field.name]}
          className={isHighlighted(field.name) ? EMPTY_FIELD_CLASSES : ""}
        />
      ))}
    </>
  );
}
