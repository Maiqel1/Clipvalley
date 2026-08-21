"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { snappy } from "@/lib/motion";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";

type CopyButtonProps = {
  onCopy: () => Promise<void>;
  label?: string;
  successMessage?: string;
  variant?: "solid" | "icon";
  className?: string;
};

export function CopyButton({
  onCopy,
  label = "Copy",
  successMessage = "Copied to clipboard",
  variant = "solid",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleClick() {
    try {
      await onCopy();
      setCopied(true);
      toast(successMessage);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1400);
    } catch (error) {
      toast(
        error instanceof Error && error.message === "UNSUPPORTED"
          ? "This browser can't copy images. Use Download instead."
          : "Could not copy that.",
        "error",
      );
    }
  }

  const isIcon = variant === "icon";

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={isIcon ? label : undefined}
      title={isIcon ? label : undefined}
      whileTap={{ scale: isIcon ? 0.92 : 0.98 }}
      transition={snappy}
      animate={copied ? { backgroundColor: "rgba(99, 14, 212, 0.14)" } : {}}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 font-semibold",
        "transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        isIcon
          ? "size-10 shrink-0 rounded-full bg-surface-container-low text-primary hover:bg-primary/12"
          : "h-11 rounded-lg bg-primary-container px-4 text-label-md text-on-primary-container hover:bg-primary hover:text-on-primary",
        className,
      )}
    >
      <span className="relative grid size-[18px] place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={snappy}
            className="absolute inset-0 grid place-items-center"
          >
            <Icon name={copied ? "check" : "content_copy"} size={18} />
          </motion.span>
        </AnimatePresence>
      </span>
      {!isIcon && <span>{copied ? "Copied" : label}</span>}
    </motion.button>
  );
}
