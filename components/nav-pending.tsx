"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/button";

// Must render inside a <Link> — useLinkStatus reads that Link's pending state.
export function NavPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none transition-opacity duration-150",
        pending ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <Spinner className="size-4" />
    </span>
  );
}
