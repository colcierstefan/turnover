import {
  APPLIANCE_CATEGORY_LABELS,
  EMPTY_FIELD_CLASSES,
} from "@/features/appliance/constants/appliance.constants";

export default function ApplianceCategorySelect({
  name,
  defaultValue,
  isHighlighted,
}: Readonly<{ name: string; defaultValue: string; isHighlighted: boolean }>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">Category</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required
        className={`rounded border border-foreground/20 bg-background px-3 py-2 text-base ${isHighlighted ? EMPTY_FIELD_CLASSES : ""}`}
      >
        <option value="" disabled>
          Choose a category
        </option>
        {Object.entries(APPLIANCE_CATEGORY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
