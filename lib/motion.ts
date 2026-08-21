import type { Transition, Variants } from "motion/react";

export const snappy: Transition = { type: "spring", stiffness: 500, damping: 30 };
export const gentle: Transition = { type: "spring", stiffness: 260, damping: 26 };
export const layoutSpring: Transition = { type: "spring", stiffness: 350, damping: 32 };

export const duration = {
  micro: 0.12,
  fast: 0.2,
  base: 0.3,
  slow: 0.45,
} as const;

export const easeOutQuart = [0.25, 1, 0.5, 1] as const;

export const STAGGER_STEP = 0.04;
export const STAGGER_CAP = 8;

export function staggerDelay(index: number) {
  return Math.min(index, STAGGER_CAP) * STAGGER_STEP;
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.base, ease: easeOutQuart, delay: staggerDelay(index) },
  }),
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: duration.fast, ease: easeOutQuart },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easeOutQuart, delay: index * 0.06 },
  }),
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

export const sheetVariants: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: gentle },
  exit: { y: "100%", transition: { duration: duration.fast, ease: easeOutQuart } },
};

export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: gentle },
  exit: { opacity: 0, scale: 0.96, transition: { duration: duration.fast } },
};

export const shakeReject = {
  x: [0, -6, 6, -4, 4, 0],
  transition: { duration: 0.4 },
};

export const pressScale = { scale: 0.98 };
export const pressScaleIcon = { scale: 0.92 };
