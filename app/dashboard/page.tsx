import { redirect } from "next/navigation";
import { currentUser } from "@/lib/firebase/session";
import { listClips } from "@/lib/data/clips";
import { profileFor } from "@/lib/firebase/identity";
import { ClipsBoard } from "@/components/clips-board";
import { ToastProvider } from "@/components/ui/toast";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await currentUser();
  // Reaching here means a cookie exists but failed verification, so it has
  // to be cleared or the proxy will bounce us straight back.
  if (!user) redirect("/session-ended");

  const [{ items, imageUrls }, profile] = await Promise.all([
    listClips(user.uid),
    profileFor(user.uid),
  ]);

  return (
    <ToastProvider>
      <ClipsBoard
        userId={user.uid}
        username={(profile?.username as string | null) ?? null}
        initialClips={items}
        initialImageUrls={imageUrls}
      />
    </ToastProvider>
  );
}
