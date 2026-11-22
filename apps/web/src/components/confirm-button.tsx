"use client";

import { useTransition, type ComponentProps } from "react";

import Button from "@/components/button";

export default function ConfirmButton({
  confirmMessage,
  onConfirm,
  ...props
}: Readonly<
  Omit<ComponentProps<typeof Button>, "type" | "onClick"> & {
    confirmMessage: string;
    onConfirm: () => Promise<void>;
  }
>) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      {...props}
      type="button"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(confirmMessage)) startTransition(onConfirm);
      }}
    />
  );
}
