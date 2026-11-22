"use client";

import { useState } from "react";

import Button from "@/components/button";

export default function CopyButton({
  text,
  copyLabel,
  copiedLabel,
}: Readonly<{ text: string; copyLabel: string; copiedLabel: string }>) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
  };

  return (
    <Button type="button" variant="secondary" onClick={copy}>
      {isCopied ? copiedLabel : copyLabel}
    </Button>
  );
}
