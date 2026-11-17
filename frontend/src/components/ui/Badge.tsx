"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "outline" | "subtle";
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
    sm: "h-[22px] px-2 text-[12px]",
    md: "h-6 px-2.5 text-body",
  };

  const variantStyles = {
    default: "bg-surface-subtle text-content-secondary",
    brand: "bg-brand-50 text-brand-700 font-medium",
    subtle: "bg-surface-subtle text-content-tertiary",
    outline: "bg-transparent text-content-primary border border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip font-medium tracking-tight shrink-0 select-none leading-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">{icon}</span>}
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
    Urgent: "bg-priority-urgent-bg text-priority-urgent-text font-semibold",
    High: "bg-priority-high-bg text-priority-high-text font-medium",
    Medium: "bg-priority-medium-bg text-priority-medium-text font-medium",
    Low: "bg-priority-low-bg text-priority-low-text font-normal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center h-[22px] px-2 rounded-chip text-[12px] font-medium leading-none shrink-0 select-none",
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
    New: "bg-status-new-bg text-status-new-text font-medium",
    Open: "bg-status-open-bg text-status-open-text font-medium",
    Pending: "bg-status-pending-bg text-status-pending-text font-medium",
    Escalated: "bg-status-escalated-bg text-status-escalated-text font-semibold",
    Resolved: "bg-status-resolved-bg text-status-resolved-text font-medium",
    Closed: "bg-status-closed-bg text-status-closed-text font-normal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center h-[22px] px-2 rounded-chip text-[12px] font-medium leading-none shrink-0 select-none",
        styles[status] || styles.Closed,
        className
      )}
    >
      {status}
    </span>
  );
}

// Aliases for backward compatibility
export const Badge = Chip;
export const PriorityBadge = PriorityChip;
export const StatusBadge = StatusChip;
