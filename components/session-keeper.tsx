"use client";

import * as React from "react";
import { onIdTokenChanged } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

// Firebase session cookies expire after 14 days and only a fresh ID token can
// mint a new one. onIdTokenChanged fires on load and on each hourly token
// refresh, so posting it here keeps the server cookie alive indefinitely.
export function SessionKeeper() {
  React.useEffect(() => {
    if (!isFirebaseConfigured) return;

    let lastSent: string | null = null;

    const unsubscribe = onIdTokenChanged(clientAuth(), async (user) => {
      if (!user) return;

      try {
        const idToken = await user.getIdToken();
        if (idToken === lastSent) return;
        lastSent = idToken;

        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      } catch {
        // Offline or blocked; the existing cookie stays valid until it expires.
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
