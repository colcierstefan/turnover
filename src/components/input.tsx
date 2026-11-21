import type { ComponentProps } from "react";

export default function Input({
  label,
  ...props
}: Readonly<ComponentProps<"input"> & { label: string }>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        className="rounded border border-foreground/20 bg-background px-3 py-2 text-base"
        {...props}
      />
    </label>
  );
}
