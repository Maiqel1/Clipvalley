"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { gentle, duration } from "@/lib/motion";
import { Icon, type IconName } from "./icon";

type Toast = {
  id: number;
  message: string;
  tone: "success" | "error";
  icon: IconName;
};

type ToastContextValue = {
  toast: (message: string, tone?: Toast["tone"]) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const nextId = React.useRef(0);

  const toast = React.useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = nextId.current++;
    setToasts((prev) => [
      ...prev,
      { id, message, tone, icon: tone === "success" ? "check" : "close" },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: gentle }}
              exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: duration.fast } }}
              className={cn(
                "pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5",
                "text-label-md shadow-level-2",
                t.tone === "success"
                  ? "bg-tertiary-container text-on-tertiary"
                  : "bg-error text-on-error",
              )}
              role="status"
            >
              <Icon name={t.icon} size={18} />
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
