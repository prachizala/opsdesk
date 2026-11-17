"use client";

import React from "react";
import { ChevronsUp, ChevronUp, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PriorityMarkProps {
  priority: "Urgent" | "High" | "Medium" | "Low" | string;
  className?: string;
  showLabel?: boolean;
}

/**
 * PriorityMark: Renders ticket priority with an icon + label in muted slate tones.
 * HARD RULE: NO red or orange priority chips. Red is reserved exclusively for SLA Breached.
 * Icons:
 * - Urgent: double-chevron up (ChevronsUp)
 * - High: chevron up (ChevronUp)
 * - Medium: dash (Minus)
 * - Low: chevron down (ChevronDown)
 */
export function PriorityMark({ priority, className, showLabel = true }: PriorityMarkProps) {
  const normalized = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();

  const getPriorityConfig = () => {
    switch (normalized) {
      case "Urgent":
        return {
          icon: <ChevronsUp className="w-3.5 h-3.5 shrink-0" />,
          styles: "bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-100 font-semibold",
        };
      case "High":
        return {
          icon: <ChevronUp className="w-3.5 h-3.5 shrink-0" />,
          styles: "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 font-medium",
        };
      case "Medium":
        return {
          icon: <Minus className="w-3.5 h-3.5 shrink-0" />,
          styles: "bg-slate-100/70 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 font-medium",
        };
      case "Low":
      default:
        return {
          icon: <ChevronDown className="w-3.5 h-3.5 shrink-0" />,
          styles: "bg-slate-100/50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-500 font-normal",
        };
    }
  };

  const { icon, styles } = getPriorityConfig();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-[22px] px-2 rounded-full text-[12px] leading-none shrink-0 select-none",
        styles,
        className
      )}
      title={`Priority: ${normalized}`}
      aria-label={`Priority: ${normalized}`}
    >
      {icon}
      {showLabel && <span>{normalized}</span>}
    </span>
  );
}

// Backward compatibility alias: PriorityChip points to PriorityMark
export const PriorityChip = PriorityMark;
export const PriorityBadge = PriorityMark;
