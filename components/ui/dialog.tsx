"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { duration, overlayVariants, popVariants, sheetVariants } from "@/lib/motion";
import { useIsClient, useIsDesktop } from "@/lib/use-capabilities";
import { Icon } from "./icon";
import { IconButton } from "./button";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

const FOCUSABLE =
  "[data-autofocus], button:not([disabled]), [href], input:not([readonly]), textarea, select";

// Portalled to body on purpose: ClipCard is a transformed motion element, and a
// transformed ancestor traps position:fixed children inside its clipped box.
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const mounted = useIsClient();
  const isDesktop = useIsDesktop();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const restoreFocusTo = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    const frame = requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? panelRef.current)?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      restoreFocusTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const heading = (
    <>
      <h2 id={titleId} className="text-headline-md text-on-surface">
        {title}
      </h2>
      {description && (
        <p id={descriptionId} className="mt-1 text-body-sm text-on-surface-variant">
          {description}
        </p>
      )}
    </>
  );

  const shared = {
    ref: panelRef,
    role: "dialog" as const,
    "aria-modal": true,
    "aria-labelledby": titleId,
    "aria-describedby": description ? descriptionId : undefined,
    tabIndex: -1,
    initial: "hidden" as const,
    animate: "visible" as const,
    exit: "exit" as const,
  };

  const body = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-90 bg-on-surface/25 backdrop-blur-[12px]"
          />

          {isDesktop ? (
            <motion.div
              {...shared}
              variants={popVariants}
              transition={{ duration: duration.fast }}
              className={cn(
                "fixed top-1/2 left-1/2 z-100 w-[min(32rem,calc(100vw-3rem))]",
                "max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl",
                "border border-outline-variant/30 bg-surface-container-lowest p-6",
                "shadow-level-2 outline-none",
                className,
              )}
            >
              <div className="mb-1 flex items-start justify-between gap-4">
                <div>{heading}</div>
                <IconButton label="Close" onClick={onClose} className="-mt-1 -mr-2 shrink-0">
                  <Icon name="close" size={20} />
                </IconButton>
              </div>
              <div className="mt-4">{children}</div>
              {footer && <div className="mt-6 flex flex-wrap items-center gap-2">{footer}</div>}
            </motion.div>
          ) : (
            <motion.div
              {...shared}
              variants={sheetVariants}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120) onClose();
              }}
              className={cn(
                "fixed inset-x-0 bottom-0 z-100 max-h-[85vh] overflow-y-auto rounded-t-xl",
                "border-t border-outline-variant/30 bg-surface-container-lowest p-5",
                "pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-level-2 outline-none",
                className,
              )}
            >
              <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-outline-variant" />
              {heading}
              <div className="mt-4">{children}</div>
              {footer && <div className="mt-5 flex flex-wrap items-center gap-2">{footer}</div>}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(body, document.body);
}
