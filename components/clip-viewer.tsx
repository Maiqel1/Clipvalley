"use client";

import { copyImage, copyText, downloadFile, formatBytes } from "@/lib/clipboard";
import { detectLink } from "@/lib/detect-link";
import { useCanCopyImages } from "@/lib/use-capabilities";
import type { ClipboardItem } from "@/lib/firebase/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CopyButton } from "@/components/copy-button";

type ClipViewerProps = {
  open: boolean;
  onClose: () => void;
  clip: ClipboardItem;
  imageUrl?: string;
};

export function ClipViewer({ open, onClose, clip, imageUrl }: ClipViewerProps) {
  const canCopy = useCanCopyImages();
  const link = clip.type === "text" ? detectLink(clip.content) : null;
  const filename = clip.file_name?.trim() || `clipvalley-${clip.id.slice(0, 8)}.png`;

  const heading =
    clip.title?.trim() ||
    (clip.type === "image"
      ? "Image"
      : clip.type === "file"
        ? (clip.file_name ?? "File")
        : link
          ? "Link"
          : "Text clip");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={heading}
      className="md:w-[min(48rem,calc(100vw-3rem))]"
      footer={
        clip.type !== "text" ? (
          <>
            {clip.type === "image" && canCopy && (
              <CopyButton
                label="Copy image"
                errorMessage="Could not copy the image. Use Download instead."
                className="h-11"
                onCopy={async () => {
                  if (!imageUrl) throw new Error("Image not ready");
                  await copyImage(imageUrl);
                }}
              />
            )}
            <Button
              variant={clip.type === "image" && canCopy ? "outline" : "primary"}
              disabled={!imageUrl}
              onClick={() => imageUrl && downloadFile(imageUrl, filename)}
            >
              <Icon name="download" size={18} />
              Download
            </Button>
          </>
        ) : (
          <>
            <CopyButton
              label={link ? "Copy URL" : "Copy text"}
              className="h-11"
              onCopy={() => copyText(clip.content)}
            />
            {link && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg border-2 border-primary px-4 text-label-md font-semibold text-primary transition-colors duration-200 hover:bg-primary/8"
              >
                <Icon name="open_in_new" size={18} />
                Open link
              </a>
            )}
          </>
        )
      }
    >
      {clip.type === "file" ? (
        <div className="flex items-center gap-4 rounded-lg border border-outline-variant/20 bg-surface-container-low p-6">
          <span className="grid size-14 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon name="description" size={28} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-body-md font-semibold text-on-surface">
              {clip.file_name ?? "File"}
            </p>
            <p className="text-body-sm text-on-surface-variant">
              {[formatBytes(clip.size), clip.mime_type].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
      ) : clip.type === "image" ? (
        imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="max-h-[55vh] w-full rounded-lg border border-outline-variant/20 object-contain"
          />
        ) : (
          <p className="rounded-lg bg-surface-container-low p-6 text-body-md text-on-surface-variant">
            This image is still loading.
          </p>
        )
      ) : (
        <pre className="max-h-[55vh] overflow-auto rounded-lg bg-surface-container-low p-4 font-sans text-body-md break-words whitespace-pre-wrap text-on-surface">
          {clip.content}
        </pre>
      )}
    </Dialog>
  );
}
