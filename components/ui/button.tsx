"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";
import { snappy } from "@/lib/motion";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "destructive";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary shadow-level-1 hover:brightness-110 disabled:hover:brightness-100",
  secondary:
    "bg-secondary-container text-on-surface hover:bg-primary-container/15",
  outline:
    "border-2 border-primary bg-transparent text-primary hover:bg-primary/8",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-primary/8 hover:text-primary",
  danger:
    "bg-transparent text-error hover:bg-error-container/50",
  destructive:
    "bg-error text-on-error shadow-level-1 hover:brightness-110 disabled:hover:brightness-100",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-label-sm gap-1.5",
  md: "h-11 px-4 text-label-md gap-2",
  lg: "h-14 px-6 text-[1rem] font-semibold gap-2.5",
};

export type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", loading = false, className, children, disabled, ...props },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        transition={snappy}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center rounded-lg font-semibold",
          "transition-[background-color,filter,color,box-shadow] duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:cursor-not-allowed disabled:opacity-60",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      >
        <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>
          {children}
        </span>
        {loading && (
          <span className="absolute inset-0 grid place-items-center">
            <Spinner />
          </span>
        )}
      </motion.button>
    );
  },
);

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

export type IconButtonProps = HTMLMotionProps<"button"> & {
  label: string;
  tone?: "default" | "primary" | "danger";
};

const TONES: Record<NonNullable<IconButtonProps["tone"]>, string> = {
  default: "text-on-surface-variant hover:bg-primary/8 hover:text-primary",
  primary: "text-primary hover:bg-primary/12",
  danger: "text-error hover:bg-error-container/50",
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, tone = "default", className, children, ...props }, ref) {
    return (
      <motion.button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        whileTap={{ scale: 0.92 }}
        transition={snappy}
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          "transition-colors duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          TONES[tone],
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
