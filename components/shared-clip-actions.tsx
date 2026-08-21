"use client";

import { copyImage, copyText, saveImage } from "@/lib/clipboard";
import { useCanCopyImages, useCanShareFiles } from "@/lib/use-capabilities";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type SharedClipActionsProps = {
  type: "text" | "image";
  content: string;
  imageUrl: string | null;
  clipId: string;
};

export function SharedClipActions({ type, content, imageUrl, clipId }: SharedClipActionsProps) {
  const canCopy = useCanCopyImages();
  const canShare = useCanShareFiles();

  if (type === "text") {
    return (
      <CopyButton
        className="mt-6 h-14 w-full bg-primary text-on-primary hover:bg-primary hover:brightness-110"
        label="Copy to Clipboard"
        onCopy={() => copyText(content)}
      />
    );
  }

  const filename = `clipvalley-${clipId.slice(0, 8)}.png`;

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      {canCopy && (
        <CopyButton
          className="h-14 flex-1 bg-primary text-on-primary hover:bg-primary hover:brightness-110"
          label="Copy image"
          errorMessage="Could not copy the image. Use Save instead."
          onCopy={async () => {
            if (!imageUrl) throw new Error("Image not ready");
            await copyImage(imageUrl);
          }}
        />
      )}
      <Button
        size="lg"
        variant={canCopy ? "secondary" : "primary"}
        className={canCopy ? "h-14 flex-1" : "h-14 w-full"}
        disabled={!imageUrl}
        onClick={() => imageUrl && saveImage(imageUrl, filename)}
      >
        <Icon name="download" size={20} />
        {canShare ? "Save image" : "Download image"}
      </Button>
    </div>
  );
}
