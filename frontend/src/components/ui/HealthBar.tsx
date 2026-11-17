"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface SlaCounts {
  onTrack: number;
  atRisk: number;
  breached: number;
  escalated: number;
}

export interface HealthBarProps {
  counts: SlaCounts;
  total?: number;
  onFilterClick?: (status: "NORMAL" | "AT_RISK" | "BREACHED" | "ESCALATED" | "ALL") => void;
  selectedStatus?: string;
  className?: string;
}

export function HealthBar({
  counts,
  total,
  onFilterClick,
  selectedStatus,
  className,
}: HealthBarProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const sum = total || (counts.onTrack + counts.atRisk + counts.breached + counts.escalated);
  const safeSum = sum === 0 ? 1 : sum;

  const segments = [
    {
      key: "NORMAL" as const,
      label: "On track",
      count: counts.onTrack,
      pct: (counts.onTrack / safeSum) * 100,
      color: "bg-[#15803D]",
      textColor: "text-[#15803D]",
      bgLight: "bg-[#DCFCE7]",
    },
    {
      key: "AT_RISK" as const,
      label: "At risk",
      count: counts.atRisk,
      pct: (counts.atRisk / safeSum) * 100,
      color: "bg-[#B45309]",
      textColor: "text-[#B45309]",
      bgLight: "bg-[#FEF3C7]",
    },
    {
      key: "BREACHED" as const,
      label: "Breached",
      count: counts.breached,
      pct: (counts.breached / safeSum) * 100,
      color: "bg-[#B91C1C]",
      textColor: "text-[#B91C1C]",
      bgLight: "bg-[#FEE2E2]",
    },
    {
      key: "ESCALATED" as const,
      label: "Escalated",
      count: counts.escalated,
      pct: (counts.escalated / safeSum) * 100,
      color: "bg-[#6D28D9]",
      textColor: "text-[#6D28D9]",
      bgLight: "bg-[#EDE9FE]",
    },
  ];

  return (
    <div className={cn("w-full flex flex-col gap-2 select-none", className)}>
      {/* Stacked SLA Split Bar */}
      <div
        className="w-full h-3 rounded-full bg-surface-subtle overflow-hidden flex items-center p-0.5 border border-border"
        onMouseLeave={() => setHoveredKey(null)}
      >
        {segments.map((seg) => {
          if (seg.pct <= 0) return null;
          const isHovered = hoveredKey === seg.key;
          const isDimmed = hoveredKey !== null && !isHovered;
          const isSelected = selectedStatus === seg.key;

          return (
            <button
              key={seg.key}
              type="button"
              onClick={() => onFilterClick?.(isSelected ? "ALL" : seg.key)}
              onMouseEnter={() => setHoveredKey(seg.key)}
              onFocus={() => setHoveredKey(seg.key)}
              onBlur={() => setHoveredKey(null)}
              style={{ width: `${seg.pct}%` }}
              aria-label={`Filter by ${seg.label}: ${seg.count} tickets (${Math.round(seg.pct)}%)`}
              className={cn(
                "h-full rounded-full transition-all duration-120 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500",
                seg.color,
                isHovered && "scale-y-125 z-10 brightness-110",
                isDimmed && "opacity-40",
                isSelected && "ring-2 ring-content-primary"
              )}
            />
          );
        })}
      </div>

      {/* Legend Counts with Filter Trigger */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-[12px] pt-1">
        {segments.map((seg) => {
          const isHovered = hoveredKey === seg.key;
          const isSelected = selectedStatus === seg.key;

          return (
            <button
              key={seg.key}
              type="button"
              onClick={() => onFilterClick?.(isSelected ? "ALL" : seg.key)}
              onMouseEnter={() => setHoveredKey(seg.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-chip transition-subtle cursor-pointer border border-transparent font-medium",
                isSelected ? "border-border-strong bg-surface shadow-xs" : "hover:bg-surface-subtle",
                isHovered && "bg-surface shadow-xs"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", seg.color)} />
              <span className="text-content-secondary">{seg.label}:</span>
              <span className={cn("font-mono-numbers font-semibold", seg.textColor)}>
                {seg.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
