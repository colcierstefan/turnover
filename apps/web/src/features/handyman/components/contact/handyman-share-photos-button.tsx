"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Button from "@/components/button";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function HandymanSharePhotosButton({
  photoUrls,
  language,
}: Readonly<{ photoUrls: ReadonlyArray<string>; language: UserLanguage }>) {
  const text = MANAGER_TEXT[language].handymanContact;
  const canShare = useSyncExternalStore(
    subscribeToNothing,
    canShareFiles,
    () => false,
  );
  const files = useRef<Promise<File[]> | null>(null);

  // Loaded ahead so the share call keeps the tap's user activation, which Safari requires.
  useEffect(() => {
    if (canShare && photoUrls.length > 0) files.current = loadFiles(photoUrls);
  }, [canShare, photoUrls]);

  if (!canShare || photoUrls.length === 0) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={async () => {
        if (!files.current) return;
        try {
          await navigator.share({ files: await files.current });
        } catch (error) {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            throw error;
          }
        }
      }}
    >
      {text.sharePhotos}
    </Button>
  );
}

const subscribeToNothing = () => () => {};

const canShareFiles = () =>
  typeof navigator.canShare === "function" &&
  navigator.canShare({
    files: [new File([""], "photo.jpg", { type: "image/jpeg" })],
  });

const loadFiles = (photoUrls: ReadonlyArray<string>) =>
  Promise.all(
    photoUrls.map(async (url, index) => {
      const blob = await (await fetch(url)).blob();
      return new File([blob], `photo-${index + 1}.${blob.type.split("/")[1]}`, {
        type: blob.type,
      });
    }),
  );
