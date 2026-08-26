"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { duration, easeOutQuart, layoutSpring, shakeReject } from "@/lib/motion";
import { detectLink } from "@/lib/detect-link";
import { copyImage, copyText, downloadImage } from "@/lib/clipboard";
import { useCanCopyImages } from "@/lib/use-capabilities";
import type { ClipboardItem } from "@/lib/firebase/types";
import { Icon } from "@/components/ui/icon";
import { Chip } from "@/components/ui/chip";
import { Button, IconButton } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { RelativeTime } from "@/components/relative-time";
import { ShareDialog } from "@/components/share-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ClipViewer } from "@/components/clip-viewer";

export type ClipStatus = "saved" | "pending" | "failed";

export type ClipCardProps = {
  clip: ClipboardItem;
  index: number;
  imageUrl?: string;
  status?: ClipStatus;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string, title?: string) => Promise<void>;
  onRename: (id: string, title: string) => Promise<void>;
  onShareChange: (id: string, shared: boolean) => Promise<string | null>;
  onRefreshImage: (path: string) => Promise<string | null>;
  onRetry?: (id: string) => void;
};

export function ClipCard({
  clip,
  index,
  imageUrl,
  status = "saved",
  onDelete,
  onEdit,
  onRename,
  onShareChange,
  onRefreshImage,
  onRetry,
}: ClipCardProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(clip.content);
  const [titleDraft, setTitleDraft] = React.useState(clip.title ?? "");
  const [saving, setSaving] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [sharePending, setSharePending] = React.useState(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [viewing, setViewing] = React.useState(false);
  const canCopyImages = useCanCopyImages();

  const link = clip.type === "text" ? detectLink(clip.content) : null;
  const pending = status === "pending";
  const failed = status === "failed";

  const shareUrl =
    clip.is_public && clip.share_slug && typeof window !== "undefined"
      ? `${window.location.origin}/s/${clip.share_slug}`
      : null;

  async function commitEdit() {
    const titleChanged = (titleDraft.trim() || null) !== (clip.title ?? null);
    const contentChanged = clip.type !== "image" && draft.trim() !== clip.content.trim();

    if (!contentChanged && !titleChanged) {
      setEditing(false);
      return;
    }
    setSaving(true);
    if (clip.type === "image") await onRename(clip.id, titleDraft);
    else await onEdit(clip.id, draft, titleDraft);
    setSaving(false);
    setEditing(false);
  }

  async function setShared(next: boolean) {
    setSharePending(true);
    await onShareChange(clip.id, next);
    setSharePending(false);
  }

  async function openShare() {
    setShareOpen(true);
    if (!clip.is_public) await setShared(true);
  }

  async function resolveImageUrl() {
    if (!imageUrl) throw new Error("Image not ready");
    try {
      await copyImage(imageUrl);
    } catch (error) {
      if (error instanceof Error && error.message === "UNSUPPORTED") throw error;
      const fresh = await onRefreshImage(clip.content);
      if (!fresh) throw error;
      await copyImage(fresh);
    }
  }

  return (
    <motion.article
      layout
      layoutId={clip.id}
      transition={layoutSpring}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={
        failed
          ? { opacity: 1, y: 0, scale: 1, ...shakeReject }
          : {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: duration.base,
                ease: easeOutQuart,
                delay: Math.min(index, 8) * 0.04,
              },
            }
      }
      exit={{ opacity: 0, scale: 0.96, transition: { duration: duration.fast, ease: easeOutQuart } }}
      whileHover={pending ? undefined : { y: -4 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-surface-container-lowest p-6",
        "shadow-level-1 transition-shadow duration-300 hover:shadow-level-2",
        failed ? "border-error/40" : "border-outline-variant/20",
        pending && "pointer-events-none",
      )}
    >
      {pending && (
        <span
          aria-hidden="true"
          className="shimmer-sweep pointer-events-none absolute inset-0 rounded-xl"
        />
      )}

      {clip.title && !editing && (
        <h3 className="mb-2 truncate text-label-md font-semibold text-on-surface" title={clip.title}>
          {clip.title}
        </h3>
      )}

      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {clip.type === "image" ? (
            <Chip icon="image" tone="tertiary">
              Image
            </Chip>
          ) : link ? (
            <Chip icon="link" tone="primary">
              Link
            </Chip>
          ) : (
            <Chip icon="subject">Text</Chip>
          )}
          {clip.is_public && (
            <Chip icon="link" tone="primary">
              Shared
            </Chip>
          )}
        </div>

        {failed ? (
          <span className="text-label-sm text-error">Not saved</span>
        ) : (
          <RelativeTime iso={clip.created_at} className="text-label-sm text-outline" />
        )}
      </header>

      <div className="min-h-32 flex-1">
        {editing ? (
          <>
            <div className="mb-3">
              <Field
                label="Title"
                hint="Optional"
                icon="subject"
                value={titleDraft}
                maxLength={80}
                placeholder="Name this clip"
                onChange={(e) => setTitleDraft(e.target.value)}
              />
            </div>
            {clip.type === "image" ? (
              <ImageBody
                url={imageUrl}
                path={clip.content}
                onRefresh={onRefreshImage}
                onOpen={() => setViewing(true)}
              />
            ) : (
              <Textarea
                value={draft}
                autoFocus
                rows={5}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setDraft(clip.content);
                    setTitleDraft(clip.title ?? "");
                    setEditing(false);
                  }
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void commitEdit();
                }}
              />
            )}
          </>
        ) : clip.type === "image" ? (
          <ImageBody
            url={imageUrl}
            path={clip.content}
            onRefresh={onRefreshImage}
            onOpen={() => setViewing(true)}
          />
        ) : link ? (
          <LinkBody host={link.host} title={link.title} url={link.url} />
        ) : (
          <pre className="clip-text font-sans text-body-sm break-words whitespace-pre-wrap text-on-surface">
            {clip.content}
          </pre>
        )}
      </div>

      <footer className="mt-4 flex items-center justify-between gap-2 border-t border-outline-variant/20 pt-4">
        {editing ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(clip.content);
                setTitleDraft(clip.title ?? "");
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={commitEdit}>
              Save
            </Button>
          </>
        ) : failed ? (
          <>
            <span className="text-label-sm text-on-surface-variant">Saving failed.</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onDelete(clip.id)}>
                Discard
              </Button>
              {onRetry && (
                <Button size="sm" onClick={() => onRetry(clip.id)}>
                  Retry
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {link ? (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open link"
                title="Open link"
                className="grid size-10 place-items-center rounded-full text-on-surface-variant transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="open_in_new" size={18} />
              </a>
            ) : clip.type === "image" ? (
              <ImageSecondaryAction
                url={imageUrl}
                clipId={clip.id}
                path={clip.content}
                onRefresh={onRefreshImage}
              />
            ) : (
              <span />
            )}

            <div
              className={cn(
                "flex items-center gap-1 transition-opacity duration-200",
                "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
              )}
            >
              <IconButton
                label={clip.type === "image" ? "Rename clip" : "Edit clip"}
                onClick={() => setEditing(true)}
              >
                <Icon name="edit" size={18} />
              </IconButton>
              <IconButton label="Open clip" onClick={() => setViewing(true)}>
                <Icon name="visibility" size={18} />
              </IconButton>
              <IconButton
                label={clip.is_public ? "Sharing on" : "Share clip"}
                tone={clip.is_public ? "primary" : "default"}
                onClick={openShare}
                className={cn(clip.is_public && "bg-primary/10")}
              >
                <Icon name="link" size={18} filled={clip.is_public} />
              </IconButton>
              <IconButton
                label="Delete clip"
                tone="danger"
                onClick={() => setConfirmingDelete(true)}
              >
                <Icon name="delete" size={18} />
              </IconButton>
              {(clip.type !== "image" || canCopyImages) && (
                <CopyButton
                  variant="icon"
                  className="bg-primary text-on-primary hover:bg-primary hover:brightness-110"
                  label={clip.type === "image" ? "Copy image" : link ? "Copy URL" : "Copy text"}
                  errorMessage={
                    clip.type === "image"
                      ? "Could not copy the image. Use Download instead."
                      : "Could not copy that."
                  }
                  onCopy={async () => {
                    if (clip.type === "image") await resolveImageUrl();
                    else await copyText(clip.content);
                  }}
                />
              )}
            </div>
          </>
        )}
      </footer>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={shareUrl}
        pending={sharePending}
        onCreateLink={() => void setShared(true)}
        onStopSharing={() => {
          void setShared(false);
          setShareOpen(false);
        }}
      />

      <ClipViewer
        open={viewing}
        onClose={() => setViewing(false)}
        clip={clip}
        imageUrl={imageUrl}
      />

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={() => onDelete(clip.id)}
        title="Delete this clip?"
        description="This cannot be undone. The clip is removed from every device you're signed in on."
        preview={<DeletePreview clip={clip} imageUrl={imageUrl} link={link} />}
      />
    </motion.article>
  );
}

function DeletePreview({
  clip,
  imageUrl,
  link,
}: {
  clip: ClipboardItem;
  imageUrl?: string;
  link: ReturnType<typeof detectLink>;
}) {
  if (clip.type === "image") {
    return imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className="h-28 w-full rounded-md object-cover" />
    ) : (
      <p className="text-body-sm text-on-surface-variant">An image clip.</p>
    );
  }

  if (link) {
    return (
      <p className="truncate text-body-sm text-on-surface" title={link.url}>
        {link.url}
      </p>
    );
  }

  return (
    <pre className="clip-text font-sans text-body-sm break-words whitespace-pre-wrap text-on-surface">
      {clip.content}
    </pre>
  );
}

function ImageBody({
  url,
  path,
  onRefresh,
  onOpen,
}: {
  url?: string;
  path: string;
  onRefresh: (path: string) => Promise<string | null>;
  onOpen: () => void;
}) {
  const [refreshed, setRefreshed] = React.useState<{ path: string; url: string } | null>(null);
  const src = refreshed?.path === path ? refreshed.url : url;

  async function handleError() {
    if (refreshed?.path === path) return;
    const fresh = await onRefresh(path);
    if (fresh) setRefreshed({ path, url: fresh });
  }

  return (
    <div className="relative h-32 overflow-hidden rounded-md border border-outline-variant/20 bg-surface-container-low">
      {src ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open image"
          className="block size-full cursor-zoom-in"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            onError={handleError}
            className="size-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          />
        </button>
      ) : (
        <div className="grid size-full place-items-center text-on-surface-variant">
          <Icon name="image" size={28} />
        </div>
      )}
    </div>
  );
}

function LinkBody({ host, title, url }: { host: string; title: string; url: string }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-md border border-outline-variant/20 bg-surface-container-low p-4">
      <div className="mb-2 flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-white text-primary shadow-sm">
          <Icon name="link" size={20} />
        </span>
        <h3 className="truncate text-label-md text-on-surface capitalize">{title}</h3>
      </div>
      <p className="truncate text-body-sm text-secondary" title={url}>
        {host}
      </p>
    </div>
  );
}

function ImageSecondaryAction({
  url,
  clipId,
  onRefresh,
  path,
}: {
  url?: string;
  clipId: string;
  path: string;
  onRefresh: (path: string) => Promise<string | null>;
}) {
  async function save() {
    const filename = `clipvalley-${clipId.slice(0, 8)}.png`;
    if (!url) return;
    try {
      await downloadImage(url, filename);
    } catch {
      const fresh = await onRefresh(path);
      if (fresh) await downloadImage(fresh, filename);
    }
  }

  return (
    <Button variant="ghost" size="sm" disabled={!url} onClick={save}>
      <Icon name="download" size={18} />
      Download
    </Button>
  );
}

export function ClipGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {children}
      </AnimatePresence>
    </div>
  );
}
