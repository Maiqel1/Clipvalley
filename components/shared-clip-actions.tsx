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

  if (type === "text") {
    return (
      <CopyButton
        className="mt-6 h-14 w-full rounded-lg bg-primary px-6 text-[1rem] font-semibold text-on-primary hover:bg-primary hover:brightness-110"
        label="Copy to Clipboard"
        onCopy={() => copyText(content)}
      />
    );
  }

  const filename = `clipvalley-${clipId.slice(0, 8)}.png`;

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
        onClick={() => imageUrl && downloadImage(imageUrl, filename)}
      >
        <Icon name="download" size={20} />
        Download image
      </Button>
    </div>
  );
}
