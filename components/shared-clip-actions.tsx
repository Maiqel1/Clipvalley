"use client";

import { copyImage, copyText, downloadFile } from "@/lib/clipboard";
import { useCanCopyImages } from "@/lib/use-capabilities";
import type { ClipType } from "@/lib/firebase/types";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type SharedClipActionsProps = {
  type: ClipType;
  content: string;
  imageUrl: string | null;
  clipId: string;
  fileName?: string | null;
};

export function SharedClipActions({
  type,
  content,
  imageUrl,
  clipId,
  fileName,
}: SharedClipActionsProps) {
  const canCopy = useCanCopyImages();

  if (type === "text") {
    return (
      <CopyButton
        className="mt-6 h-14 w-full rounded-lg bg-primary px-6 text-[1rem] font-semibold text-on-primary hover:bg-primary hover:brightness-110"
        label="Copy to Clipboard"
        onCopy={() => copyText(content)}
      />
    );
  }

  // Arbitrary bytes cannot go on the clipboard, so files only download.
  if (type === "file") {
    const name = fileName?.trim() || `clipvalley-${clipId.slice(0, 8)}`;
    return (
      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!imageUrl}
        onClick={() => imageUrl && downloadFile(imageUrl, name)}
      >
        <Icon name="download" size={20} />
        Download file
      </Button>
    );
  }

  const imageName = fileName?.trim() || `clipvalley-${clipId.slice(0, 8)}.png`;

  return (
    <div className="mt-6 flex flex-col gap-3">
      {canCopy && (
        <CopyButton
          className="h-14 w-full rounded-lg bg-primary px-6 text-[1rem] font-semibold text-on-primary hover:bg-primary hover:brightness-110"
          label="Copy image"
          errorMessage="Could not copy the image. Use Download instead."
          onCopy={async () => {
            if (!imageUrl) throw new Error("Image not ready");
            await copyImage(imageUrl);
          }}
        />
      )}
      <Button
        size="lg"
        variant={canCopy ? "outline" : "primary"}
        className="w-full"
        disabled={!imageUrl}
        onClick={() => imageUrl && downloadFile(imageUrl, imageName)}
      >
        <Icon name="download" size={20} />
        Download image
      </Button>
    </div>
  );
}
