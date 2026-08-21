"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { gentle, duration } from "@/lib/motion";
import { useIsTouch } from "@/lib/use-capabilities";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/button";

const DISMISS_KEY = "clipsense:bookmark-dismissed";
const VISITS_KEY = "clipsense:visits";

export function BookmarkPrompt() {
  const [visible, setVisible] = React.useState(false);
  const isTouch = useIsTouch();

  React.useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const visits = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1;
    localStorage.setItem(VISITS_KEY, String(visits));
    if (visits < 2) return;

    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  const shortcut =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: gentle }}
          exit={{ opacity: 0, y: 12, transition: { duration: duration.fast } }}
          role="complementary"
          className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-tertiary-container px-4 py-3 text-on-tertiary shadow-level-2 md:right-6 md:bottom-6 md:left-auto md:mx-0"
        >
          <Icon name="bookmark" size={20} filled />
          <p className="flex-1 text-body-sm">
            {isTouch ? (
              <>Add Clipsense to your Home Screen for one-tap access.</>
            ) : (
              <>
                Press{" "}
                <kbd className="rounded-sm bg-white/20 px-1.5 py-0.5 text-label-sm">{shortcut}</kbd>{" "}
                + <kbd className="rounded-sm bg-white/20 px-1.5 py-0.5 text-label-sm">D</kbd> to
                bookmark Clipsense.
              </>
            )}
          </p>
          <IconButton
            label="Dismiss"
            onClick={dismiss}
            className="size-8 text-on-tertiary hover:bg-white/15 hover:text-on-tertiary"
          >
            <Icon name="close" size={18} />
          </IconButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
