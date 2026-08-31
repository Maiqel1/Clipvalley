import "server-only";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { CLIPS } from "@/lib/firebase/paths";
import { toClip, type ClipDoc } from "@/lib/firebase/types";
import { SIGNED_URL_TTL } from "@/lib/actions/types";

// Deliberately NOT a server action: it takes a uid, so exposing it as one would
// let a client read any user's clips by passing someone else's id.
export async function listClips(uid: string) {
  const snapshot = await adminDb()
    .collection(CLIPS)
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .get();

  const items = snapshot.docs.map((d) => toClip(d.id, d.data() as ClipDoc));

  const imageUrls: Record<string, string> = {};
  await Promise.all(
    items
      .filter((c) => c.type !== "text")
      .map(async (c) => {
        try {
          const [url] = await adminBucket()
            .file(c.content)
            .getSignedUrl({ action: "read", expires: Date.now() + SIGNED_URL_TTL * 1000 });
          imageUrls[c.content] = url;
        } catch {
          // Object missing; the card falls back to its error state.
        }
      }),
  );

  return { items, imageUrls };
}

// Share pages read here, by slug, through the Admin SDK. There is no client
// read path to another user's clip, so slugs cannot be enumerated.
export async function findSharedClip(slug: string) {
  const snapshot = await adminDb()
    .collection(CLIPS)
    .where("shareSlug", "==", slug)
    .where("isPublic", "==", true)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const clip = toClip(doc.id, doc.data() as ClipDoc);

  let imageUrl: string | null = null;
  if (clip.type !== "text") {
    try {
      const [url] = await adminBucket()
        .file(clip.content)
        .getSignedUrl({ action: "read", expires: Date.now() + SIGNED_URL_TTL * 1000 });
      imageUrl = url;
    } catch {
      imageUrl = null;
    }
  }

  return { clip, imageUrl };
}
