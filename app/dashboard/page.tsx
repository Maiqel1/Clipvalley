import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClipsBoard } from "@/components/clips-board";
import { ToastProvider } from "@/components/ui/toast";
import { SIGNED_URL_TTL } from "@/lib/actions/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: clips }, { data: profile }] = await Promise.all([
    supabase
      .from("clipboard_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
  ]);

  const items = clips ?? [];
  const imagePaths = items.filter((c) => c.type === "image").map((c) => c.content);

  const imageUrls: Record<string, string> = {};
  if (imagePaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("clipboard-images")
      .createSignedUrls(imagePaths, SIGNED_URL_TTL);

    for (const entry of signed ?? []) {
      if (entry.path && entry.signedUrl) imageUrls[entry.path] = entry.signedUrl;
    }
  }

  return (
    <ToastProvider>
      <ClipsBoard
        userId={user.id}
        username={profile?.username ?? null}
        initialClips={items}
        initialImageUrls={imageUrls}
      />
    </ToastProvider>
  );
}
