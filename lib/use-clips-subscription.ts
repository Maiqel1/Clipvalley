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

// Snapshot rows are authoritative for anything saved. Optimistic rows the
// server has not acknowledged yet are kept and pinned to the top, otherwise a
// freshly pasted clip would flicker out and back as the snapshot lands.
export function mergeSnapshot<T extends { clip: ClipboardItem; status: string }>(
  previous: T[],
  snapshot: ClipboardItem[],
  makeEntry: (clip: ClipboardItem) => T,
): T[] {
  const known = new Set(snapshot.map((clip) => clip.id));
  const unacknowledged = previous.filter(
    (entry) => entry.status !== "saved" && !known.has(entry.clip.id),
  );

  return [...unacknowledged, ...snapshot.map(makeEntry)];
}
