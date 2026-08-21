import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, has_password")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <SettingsView
      username={profile?.username ?? null}
      email={user.email ?? ""}
      hasPassword={profile?.has_password ?? false}
    />
  );
}
