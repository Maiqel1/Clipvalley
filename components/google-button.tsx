"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createNonce } from "@/lib/nonce";
import { Spinner } from "@/components/ui/button";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function loadGis() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("blocked")));
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("blocked"));
    document.head.appendChild(script);
  });
}

export function GoogleButton({ next }: { next?: string }) {
  const router = useRouter();
  const target = React.useRef<HTMLDivElement>(null);
  const [status, setStatus] = React.useState<
    "loading" | "ready" | "signing-in" | "blocked" | "unconfigured"
  >(CLIENT_ID ? "loading" : "unconfigured");
  const [error, setError] = React.useState<string | null>(null);

  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  React.useEffect(() => {
    if (!CLIENT_ID) return;

    let cancelled = false;

    async function start() {
      try {
        await loadGis();
        if (cancelled) return;

        const { raw, hashed } = await createNonce();
        if (cancelled || !target.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID!,
          nonce: hashed,
          cancel_on_tap_outside: true,
          callback: async ({ credential }) => {
            setStatus("signing-in");
            setError(null);

            const supabase = createClient();
            const { error: signInError } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: credential,
              nonce: raw,
            });

            if (signInError) {
              setError("Google sign-in didn't complete. Please try again.");
              setStatus("ready");
              return;
            }

            router.push(destination);
            router.refresh();
          },
        });

        window.google.accounts.id.renderButton(target.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: 360,
        });

        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("blocked");
      }
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, [destination, router]);

  if (status === "unconfigured") {
    if (process.env.NODE_ENV === "development") {
      return (
        <p className="rounded-lg bg-error-container px-4 py-3 text-body-sm text-on-error-container">
          <strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.</strong> Add it to{" "}
          <code>.env.local</code> and restart the dev server. Google sign-in is disabled until you
          do.
        </p>
      );
    }
    return null;
  }

  if (status === "blocked") {
    return (
      <p className="text-center text-body-sm text-on-surface-variant">
        Google sign-in couldn&apos;t load — an extension or privacy setting is blocking it. Use your
        email and password above.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative min-h-11">
        <div
          ref={target}
          className={`flex justify-center [color-scheme:light] ${
            status === "ready" ? "opacity-100" : "pointer-events-none opacity-0"
          } transition-opacity duration-200`}
        />

        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center gap-3 text-body-sm text-on-surface-variant">
            <Spinner className="text-primary" />
            {status === "signing-in" ? "Signing you in…" : "Loading Google…"}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-center text-label-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
