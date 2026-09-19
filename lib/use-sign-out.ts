"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOutOfDevice } from "@/lib/auth-client";

export function useSignOut() {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  const signOut = React.useCallback(async () => {
    setSigningOut(true);
    await signOutOfDevice();
    router.replace("/login");
    router.refresh();
  }, [router]);

  return { signOut, signingOut };
}
