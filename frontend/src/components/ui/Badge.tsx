"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PriorityMark, PriorityChip, PriorityBadge } from "./PriorityMark";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "outline" | "subtle";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

/**
 * Chip: Pill language (fully rounded, 20-22px height, 12px text, soft tint, no border).
 */
export function Chip({
  className,
  variant = "default",
  size = "sm",
  icon,
  children,
  ...props
}: ChipProps) {
  const sizeStyles = {
    sm: "h-[22px] px-2.5 text-[12px]",
    md: "h-6 px-3 text-body",
  };

  const variantStyles = {
    default: "bg-surface-subtle text-content-secondary",
    brand: "bg-brand-50 text-brand-orange-text dark:text-brand-orange font-medium",
    subtle: "bg-surface-subtle text-content-tertiary",
    outline: "bg-transparent text-content-primary border border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight shrink-0 select-none leading-none",
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

export interface StatusChipProps {
  status: "New" | "Open" | "Pending" | "Escalated" | "Resolved" | "Closed" | string;
  className?: string;
}

/**
 * StatusChip: Soft tint, no border, pill shape.
 */
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
        "inline-flex items-center h-[22px] px-2.5 rounded-full text-[12px] font-medium leading-none shrink-0 select-none",
        styles[status] || styles.Closed,
        className
      )}
    >
      {status}
    </span>
  );
}

export interface RegionTagProps {
  region: "MEA" | "APAC" | "EU" | "AMER" | string;
  className?: string;
}

/**
 * RegionTag: Muted four hues (MEA, APAC, EU, AMER), pill shape.
 */
export function RegionTag({ region, className }: RegionTagProps) {
  const normalized = region.toUpperCase();
  const styles: Record<string, string> = {
    MEA: "bg-region-mea-bg text-region-mea-text",
    APAC: "bg-region-apac-bg text-region-apac-text",
    EU: "bg-region-eu-bg text-region-eu-text",
    AMER: "bg-region-amer-bg text-region-amer-text",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center h-[22px] px-2.5 rounded-full text-[12px] font-semibold font-mono-numbers leading-none shrink-0 select-none tracking-wide",
        styles[normalized] || "bg-surface-subtle text-content-secondary",
        className
      )}
    >
      {normalized}
    </span>
  );
}

// Re-exports
export { PriorityMark, PriorityChip, PriorityBadge };
export const Badge = Chip;
export const StatusBadge = StatusChip;
