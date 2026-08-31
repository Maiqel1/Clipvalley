"use client";

import * as React from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { clientDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { CLIPS } from "@/lib/firebase/paths";
import type { ClipboardItem, ClipType } from "@/lib/firebase/types";

function iso(value: unknown) {
  const stamp = value as Timestamp | undefined;
  return (stamp?.toDate?.() ?? new Date()).toISOString();
}

// The client SDK hands back its own Timestamp class, so this cannot reuse the
// Admin-side toClip in lib/firebase/types.ts.
function toClip(id: string, doc: DocumentData): ClipboardItem {
  return {
    id,
    user_id: doc.userId,
    type: doc.type as ClipType,
    content: doc.content,
    title: doc.title ?? null,
    file_name: doc.fileName ?? null,
    mime_type: doc.mimeType ?? null,
    size: doc.size ?? null,
    is_public: doc.isPublic ?? false,
    share_slug: doc.shareSlug ?? null,
    created_at: iso(doc.createdAt),
    updated_at: iso(doc.updatedAt),
  };
}

/**
 * Live clip updates via Firestore onSnapshot.
 *
 * Strictly additive: the dashboard is server-rendered and works without this.
 * If the browser cannot reach firestore.googleapis.com — a blocking extension,
 * a filtered network — the listener unsubscribes and the app simply behaves as
 * it did before, refreshing on load. No error surface.
 */
export function useClipsSubscription(
  userId: string,
  onClips: (clips: ClipboardItem[]) => void,
) {
  const [live, setLive] = React.useState(false);
  const handler = React.useRef(onClips);

  // Kept in a ref so a new callback identity each render does not tear down and
  // rebuild the listener.
  React.useEffect(() => {
    handler.current = onClips;
  });

  React.useEffect(() => {
    if (!isFirebaseConfigured || !userId) return;

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onSnapshot(
        query(
          collection(clientDb(), CLIPS),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
        ),
        (snapshot) => {
          // Writes we just made locally come back through the cache first;
          // ignoring those avoids fighting the optimistic entry.
          if (snapshot.metadata.hasPendingWrites) return;
          setLive(true);
          handler.current(snapshot.docs.map((d) => toClip(d.id, d.data())));
        },
        () => {
          setLive(false);
          unsubscribe?.();
        },
      );
    } catch {
      // Already false; nothing to reset. The dashboard stays server-rendered.
    }

    return () => unsubscribe?.();
  }, [userId]);

  return live;
}

// Guards against two entries sharing a key. Duplicate keys inside
// AnimatePresence leave a phantom layout box that only a remount clears.
export function dedupeById<T extends { clip: ClipboardItem }>(entries: T[]): T[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.clip.id)) return false;
    seen.add(entry.clip.id);
    return true;
  });
}

// Snapshot rows are authoritative for anything saved. Optimistic rows the
// server has not acknowledged yet are kept and pinned to the top, otherwise a
// freshly pasted clip would flicker out and back as the snapshot lands.
export function mergeSnapshot<T extends { clip: ClipboardItem; status: string }>(
  previous: T[],
  snapshot: ClipboardItem[],
  makeEntry: (clip: ClipboardItem) => T,
): T[] {
  const knownIds = new Set(snapshot.map((clip) => clip.id));

  // On a slow connection the listener can beat the server action's response, so
  // the optimistic row may already be in the snapshot under its real id while
  // still carrying its temporary one here. Content is the reliable link: a
  // storage path for uploads, or the exact text just sent.
  const knownContent = new Set(snapshot.map((clip) => clip.content));

  const unacknowledged = previous.filter(
    (entry) =>
      entry.status !== "saved" &&
      !knownIds.has(entry.clip.id) &&
      !knownContent.has(entry.clip.content),
  );

  return dedupeById([...unacknowledged, ...snapshot.map(makeEntry)]);
}
