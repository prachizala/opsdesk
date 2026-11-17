"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id?: string;
  variant?: ToastVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function Toast({
  variant = "info",
  title,
  message,
  onDismiss,
  className,
}: ToastProps) {
  const variantStyles: Record<
    ToastVariant,
    { container: string; icon: React.ReactNode }
  > = {
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
    error: {
      container: "bg-rose-50 border-rose-200 text-rose-900",
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    },
    info: {
      container: "bg-surface border-border text-content-primary",
      icon: <Info className="w-4 h-4 text-brand-600 shrink-0" />,
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-card border shadow-md transition-subtle select-none max-w-sm w-full",
        current.container,
        className
      )}
    >
      <div className="pt-0.5">{current.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="text-caption font-semibold leading-tight">{title}</p>}
        <p className="text-caption mt-0.5 leading-snug">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss toast"
          className="text-content-tertiary hover:text-content-primary p-0.5 rounded transition-subtle shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
