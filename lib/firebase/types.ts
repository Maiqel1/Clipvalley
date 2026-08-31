export type ClipType = "text" | "image" | "file";

// The app-facing shape is kept stable so components did not need rewriting when
// the backend changed; toClip maps Firestore's camelCase docs onto it.
export type ClipboardItem = {
  id: string;
  user_id: string;
  type: ClipType;
  content: string;
  title: string | null;
  // Populated for type === "file"; null for text and image clips.
  file_name: string | null;
  mime_type: string | null;
  size: number | null;
  is_public: boolean;
  share_slug: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  username: string | null;
  has_password: boolean;
  created_at: string;
};

export type ClipDoc = {
  userId: string;
  type: ClipType;
  content: string;
  title: string | null;
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  isPublic: boolean;
  shareSlug: string | null;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
};

export type ProfileDoc = {
  username: string | null;
  hasPassword: boolean;
  createdAt: FirebaseFirestore.Timestamp;
};

function iso(value: FirebaseFirestore.Timestamp | undefined) {
  return (value?.toDate() ?? new Date()).toISOString();
}

export function toClip(id: string, doc: ClipDoc): ClipboardItem {
  return {
    id,
    user_id: doc.userId,
    type: doc.type,
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

export function toProfile(id: string, doc: ProfileDoc): Profile {
  return {
    id,
    username: doc.username ?? null,
    has_password: doc.hasPassword ?? false,
    created_at: iso(doc.createdAt),
  };
}
