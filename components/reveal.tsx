"use client";

import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";

type RevealProps = {
  index?: number;
  whileInView?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ index = 0, whileInView = false, className, children }: RevealProps) {
  const animation = whileInView
    ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
    : { animate: "visible" };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      variants={fadeUp}
      className={className}
      {...animation}
    >
      {children}
    </motion.div>
  );
}
