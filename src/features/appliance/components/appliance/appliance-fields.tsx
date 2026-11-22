import Input from "@/components/input";
import ApplianceCategorySelect from "@/features/appliance/components/appliance/appliance-category-select";
import { EMPTY_FIELD_CLASSES } from "@/features/appliance/constants/appliance.constants";
import type { ApplianceFields as ApplianceFieldValues } from "@/features/appliance/schemas/appliance.schema";

type ApplianceFieldName = keyof ApplianceFieldValues;

const TEXT_FIELDS: ReadonlyArray<{
  name: Exclude<ApplianceFieldName, "category">;
  label: string;
  type?: string;
  placeholder?: string;
  step?: string;
}> = [
  { name: "brand", label: "Brand", placeholder: "e.g. Bosch" },
  { name: "model", label: "Model", placeholder: "e.g. WAN28262BY" },
  { name: "serialNumber", label: "Serial number" },
  {
    name: "manufactureDate",
    label: "Manufacture date",
    placeholder: "YYYY, YYYY-MM or YYYY-MM-DD",
  },
  { name: "purchaseDate", label: "Purchase date", type: "date" },
  {
    name: "purchasePriceRon",
    label: "Purchase price (RON)",
    type: "number",
    step: "0.01",
  },
  { name: "warrantyUntil", label: "Warranty until", type: "date" },
  { name: "notes", label: "Notes" },
];

export default function ApplianceFields({
  namePrefix = "",
  values,
  highlightedFields = [],
}: Readonly<{
  namePrefix?: string;
  values: Record<ApplianceFieldName, string>;
  highlightedFields?: ReadonlyArray<ApplianceFieldName>;
}>) {
  const isHighlighted = (field: ApplianceFieldName) =>
    highlightedFields.includes(field) && values[field] === "";

  return (
    <>
      <ApplianceCategorySelect
        name={`${namePrefix}category`}
        defaultValue={values.category}
        isHighlighted={isHighlighted("category")}
      />
      {TEXT_FIELDS.map((field) => (
        <Input
          key={field.name}
          label={field.label}
          name={`${namePrefix}${field.name}`}
          type={field.type}
          step={field.step}
          min={field.type === "number" ? "0" : undefined}
          placeholder={field.placeholder}
          defaultValue={values[field.name]}
          className={isHighlighted(field.name) ? EMPTY_FIELD_CLASSES : ""}
        />
      ))}
    </>
  );
}
