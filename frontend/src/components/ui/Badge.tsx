"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "outline";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function Chip({
  className,
  variant = "default",
  size = "sm",
  icon,
  children,
  ...props
}: ChipProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-caption",
    md: "px-2.5 py-1 text-body",
  };

  const variantStyles = {
    default: "bg-surface-subtle text-content-secondary border border-border",
    brand: "bg-brand-50 text-brand-700 border border-brand-100 font-medium",
    outline: "bg-transparent text-content-primary border border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-input font-medium tracking-tight shrink-0 select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="w-3.5 h-3.5 shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export interface PriorityChipProps {
  priority: "Urgent" | "High" | "Medium" | "Low" | string;
  className?: string;
}

export function PriorityChip({ priority, className }: PriorityChipProps) {
  const styles: Record<string, string> = {
    Urgent: "bg-priority-urgent-bg text-priority-urgent-text border-red-200 font-semibold",
    High: "bg-priority-high-bg text-priority-high-text border-amber-200 font-medium",
    Medium: "bg-priority-medium-bg text-priority-medium-text border-blue-200 font-medium",
    Low: "bg-priority-low-bg text-priority-low-text border-border font-normal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-input text-caption border shrink-0",
        styles[priority] || styles.Low,
        className
      )}
    >
      {priority}
    </span>
  );
}

export interface StatusChipProps {
  status: "New" | "Open" | "Pending" | "Escalated" | "Resolved" | "Closed" | string;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const styles: Record<string, string> = {
    New: "bg-status-new-bg text-status-new-text border-blue-200",
    Open: "bg-status-open-bg text-status-open-text border-teal-200 font-medium",
    Pending: "bg-status-pending-bg text-status-pending-text border-amber-200",
    Escalated: "bg-status-escalated-bg text-status-escalated-text border-purple-200 font-semibold",
    Resolved: "bg-status-resolved-bg text-status-resolved-text border-emerald-200",
    Closed: "bg-status-closed-bg text-status-closed-text border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-input text-caption font-medium border shrink-0",
        styles[status] || styles.Closed,
        className
      )}
    >
      {status}
    </span>
  );
}
