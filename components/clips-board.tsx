"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import {
  createImageClip,
  createTextClip,
  deleteClip,
  refreshImageUrl,
  setClipShared,
  updateTextClip,
} from "@/lib/actions/clips";
import { MAX_IMAGE_BYTES } from "@/lib/actions/types";
import type { ClipboardItem } from "@/lib/supabase/types";
import { duration, easeOutQuart, fadeUp } from "@/lib/motion";
import { AppShell } from "@/components/app-shell";
import { ClipCard, ClipGrid, type ClipStatus } from "@/components/clip-card";
import { ComposerSheet } from "@/components/composer-sheet";
import { BookmarkPrompt } from "@/components/bookmark-prompt";
import { useToast } from "@/components/ui/toast";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { SyncState } from "@/components/sync-chip";

type Entry = { clip: ClipboardItem; status: ClipStatus };

type ClipsBoardProps = {
  userId: string;
  username: string | null;
  initialClips: ClipboardItem[];
  initialImageUrls: Record<string, string>;
};

function tempClip(partial: Partial<ClipboardItem> & Pick<ClipboardItem, "type" | "content">) {
  return {
    id: `temp-${crypto.randomUUID()}`,
    user_id: "",
    is_public: false,
    share_slug: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...partial,
  } as ClipboardItem;
}

export function ClipsBoard({
  userId,
  username,
  initialClips,
  initialImageUrls,
}: ClipsBoardProps) {
  const [entries, setEntries] = React.useState<Entry[]>(() =>
    initialClips.map((clip) => ({ clip, status: "saved" as ClipStatus })),
  );
  const [imageUrls, setImageUrls] = React.useState(initialImageUrls);
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [dropActive, setDropActive] = React.useState(false);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);
  const { toast } = useToast();

  const syncState: SyncState = hasError ? "error" : pendingCount > 0 ? "pending" : "idle";

  const track = React.useCallback(async <T,>(work: () => Promise<T>) => {
    setPendingCount((n) => n + 1);
    try {
      return await work();
    } finally {
      setPendingCount((n) => Math.max(0, n - 1));
    }
  }, []);

  const addText = React.useCallback(
    async (raw: string) => {
      const value = raw.trim();
      if (!value) return;

      const optimistic = tempClip({ type: "text", content: value, user_id: userId });
      setEntries((prev) => [{ clip: optimistic, status: "pending" }, ...prev]);

      const result = await track(() => createTextClip(value));

      setEntries((prev) =>
        prev.map((entry) =>
          entry.clip.id !== optimistic.id
            ? entry
            : result.ok
              ? { clip: result.clip, status: "saved" }
              : { ...entry, status: "failed" },
        ),
      );

      if (!result.ok) {
        setHasError(true);
        toast(result.error, "error");
      } else {
        setHasError(false);
      }
    },
    [track, toast, userId],
  );

  const addImage = React.useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast("That file isn't an image.", "error");
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast("Images need to be under 5 MB.", "error");
        return;
      }

      const extension = (file.type.split("/")[1] ?? "png").replace("jpeg", "jpg");
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;
      const previewUrl = URL.createObjectURL(file);

      const optimistic = tempClip({ type: "image", content: path, user_id: userId });
      setImageUrls((prev) => ({ ...prev, [path]: previewUrl }));
      setEntries((prev) => [{ clip: optimistic, status: "pending" }, ...prev]);

      const result = await track(async () => {
        const supabase = createClient();
        const upload = await supabase.storage
          .from("clipboard-images")
          .upload(path, file, { contentType: file.type, upsert: false });

        if (upload.error) return { ok: false as const, error: "Upload failed." };
        return createImageClip(path);
      });

      setEntries((prev) =>
        prev.map((entry) =>
          entry.clip.id !== optimistic.id
            ? entry
            : result.ok
              ? { clip: result.clip, status: "saved" }
              : { ...entry, status: "failed" },
        ),
      );

      if (!result.ok) {
        setHasError(true);
        toast(result.error, "error");
      } else {
        setHasError(false);
      }
    },
    [track, toast, userId],
  );

  React.useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        composerOpen ||
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const items = Array.from(event.clipboardData?.items ?? []);
      const imageItem = items.find((item) => item.type.startsWith("image/"));

      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) {
          event.preventDefault();
          void addImage(file);
          return;
        }
      }

      const text = event.clipboardData?.getData("text/plain");
      if (text?.trim()) {
        event.preventDefault();
        void addText(text);
      }
    }

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addImage, addText, composerOpen]);

  React.useEffect(() => {
    let depth = 0;

    function onDragEnter(event: DragEvent) {
      if (!event.dataTransfer?.types.includes("Files")) return;
      depth += 1;
      setDropActive(true);
    }
    function onDragOver(event: DragEvent) {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    }
    function onDragLeave() {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDropActive(false);
    }
    function onDrop(event: DragEvent) {
      const file = event.dataTransfer?.files?.[0];
      depth = 0;
      setDropActive(false);
      if (file) {
        event.preventDefault();
        void addImage(file);
      }
    }

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [addImage]);

  async function handleDelete(id: string) {
    const target = entries.find((entry) => entry.clip.id === id);
    setEntries((prev) => prev.filter((entry) => entry.clip.id !== id));

    if (!target || id.startsWith("temp-")) return;

    const result = await track(() => deleteClip(id));
    if (!result.ok) {
      setEntries((prev) => [target, ...prev]);
      toast(result.error, "error");
    }
  }

  async function handleEdit(id: string, content: string) {
    const result = await track(() => updateTextClip(id, content));
    if (result.ok) {
      setEntries((prev) =>
        prev.map((entry) => (entry.clip.id === id ? { clip: result.clip, status: "saved" } : entry)),
      );
      toast("Clip updated");
    } else {
      toast(result.error, "error");
    }
  }

  const handleRefreshImage = React.useCallback(async (path: string) => {
    const fresh = await refreshImageUrl(path);
    if (fresh) setImageUrls((prev) => ({ ...prev, [path]: fresh }));
    return fresh;
  }, []);

  async function handleShareChange(id: string, shared: boolean) {
    const result = await track(() => setClipShared(id, shared));
    if (!result.ok) {
      toast(result.error, "error");
      return null;
    }
    setEntries((prev) =>
      prev.map((entry) => (entry.clip.id === id ? { clip: result.clip, status: "saved" } : entry)),
    );
    return result.clip.share_slug;
  }

  return (
    <>
      <AppShell username={username} syncState={syncState} onNewClip={() => setComposerOpen(true)}>
        <motion.header initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <h1 className="text-headline-lg-mobile text-on-background md:text-headline-lg">
            Recent Clips
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Your synced history across devices.
          </p>
        </motion.header>

        {entries.length === 0 ? (
          <EmptyState onNewClip={() => setComposerOpen(true)} />
        ) : (
          <ClipGrid>
            {entries.map((entry, index) => (
              <ClipCard
                key={entry.clip.id}
                clip={entry.clip}
                index={index}
                status={entry.status}
                imageUrl={imageUrls[entry.clip.content]}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onShareChange={handleShareChange}
                onRefreshImage={handleRefreshImage}
              />
            ))}
          </ClipGrid>
        )}
      </AppShell>

      <ComposerSheet
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmitText={(value) => void addText(value)}
        onSubmitImage={(file) => void addImage(file)}
      />

      <BookmarkPrompt />

      <AnimatePresence>
        {dropActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: duration.fast, ease: easeOutQuart }}
            className="pointer-events-none fixed inset-4 z-50 grid place-items-center rounded-xl border-2 border-dashed border-primary bg-primary/8 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3 text-primary">
              <Icon name="image" size={40} />
              <p className="text-headline-md">Drop to add</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EmptyState({ onNewClip }: { onNewClip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease: easeOutQuart }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-low/50 px-6 py-20 text-center"
    >
      <motion.span
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="mb-5 grid size-16 place-items-center rounded-xl bg-primary/10 text-primary"
      >
        <Icon name="content_copy" size={32} />
      </motion.span>
      <h2 className="text-headline-md text-on-surface">Nothing here yet</h2>
      <p className="mt-2 max-w-sm text-body-md text-on-surface-variant">
        Press <kbd className="rounded-sm bg-surface-container px-1.5 py-0.5 text-label-sm">Ctrl</kbd>{" "}
        + <kbd className="rounded-sm bg-surface-container px-1.5 py-0.5 text-label-sm">V</kbd>{" "}
        anywhere on this page, or drop an image, and it appears here instantly.
      </p>
      <Button className="mt-6" onClick={onNewClip}>
        <Icon name="add" size={18} />
        New Clip
      </Button>
    </motion.div>
  );
}
