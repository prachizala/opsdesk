"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftIcon, rightIcon, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-caption font-medium text-content-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 pointer-events-none text-content-tertiary flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-9 rounded-input bg-surface text-body text-content-primary border border-border placeholder:text-content-disabled px-3 transition-subtle disabled:opacity-50 disabled:bg-surface-subtle disabled:cursor-not-allowed",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error
                ? "border-red-400 focus-visible:outline-red-500"
                : "hover:border-border-strong",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 pointer-events-none text-content-tertiary flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-caption text-red-600 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-caption text-content-tertiary">{helperText}</span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
