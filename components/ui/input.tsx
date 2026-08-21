"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: IconName;
  hint?: React.ReactNode;
  error?: string | null;
  trailing?: React.ReactNode;
};

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, icon, hint, error, trailing, className, id, ...props },
  ref,
) {
  const generated = React.useId();
  const inputId = id ?? generated;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-label-sm text-on-surface">
          {label}
        </label>
        {hint && !error && (
          <span id={`${inputId}-hint`} className="text-label-sm text-on-surface-variant">
            {hint}
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex items-center gap-3 rounded-lg bg-surface-container-lowest px-4",
          "border transition-[border-color,box-shadow] duration-200",
          "focus-within:border-primary focus-within:shadow-glow",
          error
            ? "border-error focus-within:border-error focus-within:shadow-[0_0_0_4px_rgb(186_26_26/0.12)]"
            : "border-outline-variant",
        )}
      >
        {icon && <Icon name={icon} size={20} className="text-on-surface-variant" />}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full bg-transparent text-body-md text-on-surface outline-none",
            "placeholder:text-outline-variant",
            className,
          )}
          {...props}
        />
        {trailing}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-label-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest",
        "px-4 py-3 text-body-md text-on-surface outline-none",
        "placeholder:text-outline-variant",
        "transition-[border-color,box-shadow] duration-200",
        "focus:border-primary focus:shadow-glow",
        className,
      )}
      {...props}
    />
  );
});
