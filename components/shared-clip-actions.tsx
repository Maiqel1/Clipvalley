"use client";

import { copyImage, copyText, downloadImage } from "@/lib/clipboard";
import { useCanCopyImages } from "@/lib/use-capabilities";
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

  if (type === "image" && !canCopy) {
    return (
      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!imageUrl}
        onClick={() => imageUrl && downloadImage(imageUrl, `clipsense-${clipId.slice(0, 8)}.png`)}
      >
        <Icon name="download" size={20} />
        Download image
      </Button>
    );
  }

  return (
    <CopyButton
      className="mt-6 h-14 w-full bg-primary text-on-primary hover:bg-primary hover:brightness-110"
      label={type === "image" ? "Copy image" : "Copy to Clipboard"}
      onCopy={async () => {
        if (type === "image") {
          if (!imageUrl) throw new Error("Image not ready");
          await copyImage(imageUrl);
        } else {
          await copyText(content);
        }
      }}
    />
  );
}
