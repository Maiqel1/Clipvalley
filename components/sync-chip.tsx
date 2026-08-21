"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { snappy } from "@/lib/motion";

export type SyncState = "idle" | "pending" | "error";

const COPY: Record<SyncState, string> = {
  idle: "Synced",
  pending: "Syncing",
  error: "Not saved",
};

export function SyncChip({ state }: { state: SyncState }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-label-sm",
        state === "error"
          ? "border-error/30 bg-error-container/60 text-on-error-container"
          : "border-outline-variant/20 bg-surface-container-low text-on-surface-variant",
      )}
    >
      <motion.span
        key={state}
        initial={state === "idle" ? { scale: 0.4 } : false}
        animate={{ scale: 1 }}
        transition={snappy}
        className={cn(
          "size-2 rounded-full",
          state === "error" ? "bg-error" : "bg-primary",
          state === "pending" && "animate-[pulse-sync_1.4s_ease-in-out_infinite]",
        )}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {COPY[state]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
