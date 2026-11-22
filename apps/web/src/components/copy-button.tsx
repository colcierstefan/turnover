"use client";

import { useState } from "react";

import Button from "@/components/button";

export default function CopyButton({ text }: Readonly<{ text: string }>) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
  };

  return (
    <Button type="button" variant="secondary" onClick={copy}>
      {isCopied ? "Copied" : "Copy link"}
    </Button>
  );
}
