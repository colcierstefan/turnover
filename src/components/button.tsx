import type { ComponentProps } from "react";

const VARIANT_CLASSES = {
  primary: "bg-foreground text-background",
  secondary: "border border-foreground/20",
  danger: "border border-red-600 text-red-600",
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: Readonly<
  ComponentProps<"button"> & { variant?: keyof typeof VARIANT_CLASSES }
>) {
  return (
    <button
      className={`rounded px-4 py-2 text-center font-medium disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
