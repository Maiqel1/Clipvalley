import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentUser } from "@/lib/firebase/session";
import { profileFor } from "@/lib/firebase/identity";
import { SettingsView } from "@/components/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await currentUser();
  // Reaching here means a cookie exists but failed verification, so it has
  // to be cleared or the proxy will bounce us straight back.
  if (!user) redirect("/session-ended");

  const profile = await profileFor(user.uid);

  return (
    <SettingsView
      username={(profile?.username as string | null) ?? null}
      email={user.email ?? ""}
      hasPassword={Boolean(profile?.hasPassword)}
    />
  );
}
