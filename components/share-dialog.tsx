"use client";

import { copyText } from "@/lib/clipboard";
import { Dialog } from "@/components/ui/dialog";
import { Button, Spinner } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CopyButton } from "@/components/copy-button";

type ShareDialogProps = {
  open: boolean;
  onClose: () => void;
  shareUrl: string | null;
  pending: boolean;
  onCreateLink: () => void;
  onStopSharing: () => void;
};

export function ShareDialog({
  open,
  onClose,
  shareUrl,
  pending,
  onCreateLink,
  onStopSharing,
}: ShareDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Share clip"
      description={
        shareUrl
          ? "Anyone with this link can view this clip. They can read and copy it, but not change it."
          : "Create a public read-only link to this clip."
      }
    >
      {pending && !shareUrl ? (
        <div className="flex items-center gap-3 py-3 text-body-sm text-on-surface-variant">
          <Spinner className="text-primary" />
          Creating link…
        </div>
      ) : shareUrl ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              data-autofocus
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Share link"
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 text-body-sm text-on-surface-variant outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:shadow-glow"
            />
            <CopyButton
              variant="icon"
              label="Copy share link"
              successMessage="Share link copied"
              onCopy={() => copyText(shareUrl)}
              className="size-12"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(shareUrl, "_blank", "noopener,noreferrer")}
            >
              <Icon name="open_in_new" size={18} />
              Open
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={pending}
              onClick={onStopSharing}
              className="ml-auto"
            >
              Stop sharing
            </Button>
          </div>
        </div>
      ) : (
        <Button size="md" loading={pending} onClick={onCreateLink} data-autofocus>
          <Icon name="link" size={18} />
          Create link
        </Button>
      )}
    </Dialog>
  );
}
