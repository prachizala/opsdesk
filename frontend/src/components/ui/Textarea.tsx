"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  autoGrow?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, autoGrow = false, id, disabled, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoGrow && internalRef.current) {
        internalRef.current.style.height = "auto";
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
      if (onChange) onChange(e);
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-caption font-medium text-content-secondary">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          }}
          disabled={disabled}
          onChange={handleInput}
          className={cn(
            "w-full rounded-input bg-surface text-body text-content-primary border border-border placeholder:text-content-disabled p-3 transition-subtle disabled:opacity-50 disabled:bg-surface-subtle disabled:cursor-not-allowed resize-y min-h-[80px]",
            error
              ? "border-red-400 focus-visible:outline-red-500"
              : "hover:border-border-strong",
            className
          )}
          {...props}
        />
        {error ? (
          <span className="text-caption text-red-600 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-caption text-content-tertiary">{helperText}</span>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
