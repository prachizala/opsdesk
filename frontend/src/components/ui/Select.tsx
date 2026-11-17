"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, options, children, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-caption font-medium text-content-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-9 rounded-input bg-surface text-body text-content-primary border border-border px-3 pr-8 transition-subtle appearance-none cursor-pointer disabled:opacity-50 disabled:bg-surface-subtle disabled:cursor-not-allowed",
              error
                ? "border-red-400 focus-visible:outline-red-500"
                : "hover:border-border-strong",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 pointer-events-none text-content-tertiary flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
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
Select.displayName = "Select";
