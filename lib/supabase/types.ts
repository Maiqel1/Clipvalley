export type ClipType = "text" | "image";

export type ClipboardItem = {
  id: string;
  user_id: string;
  type: ClipType;
  content: string;
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

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Omit<Profile, "id">> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      clipboard_items: {
        Row: ClipboardItem;
        Insert: Pick<ClipboardItem, "user_id" | "type" | "content"> & {
          id?: string;
          is_public?: boolean;
          share_slug?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ClipboardItem>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      username_available: {
        Args: { candidate: string };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
