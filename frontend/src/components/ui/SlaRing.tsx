"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SlaRingProps {
  status?: "NORMAL" | "AT_RISK" | "BREACHED" | "ESCALATED" | "STOPPED" | "CLOSED" | string;
  progress?: number; // 0 to 1
  hoursRemaining?: number | null;
  totalHours?: number; // default 24
  size?: number; // 16 to 20px, default 18
  className?: string;
}

export function SlaRing({
  status = "NORMAL",
  progress,
  hoursRemaining,
  totalHours = 24,
  size = 18,
  className,
}: SlaRingProps) {
  // Normalize status
  const normalizedStatus = status.toUpperCase();

  // Determine progress ratio (0 to 1, fills as deadline approaches)
  let ratio = 0;
  if (typeof progress === "number") {
    ratio = Math.max(0, Math.min(1, progress));
  } else if (hoursRemaining !== null && hoursRemaining !== undefined) {
    if (hoursRemaining <= 0 || normalizedStatus === "BREACHED") {
      ratio = 1;
    } else {
      // Closer to 0 remaining hours means higher progress (approaching deadline)
      ratio = Math.max(0, Math.min(1, 1 - hoursRemaining / totalHours));
    }
  } else if (normalizedStatus === "BREACHED") {
    ratio = 1;
  } else if (normalizedStatus === "AT_RISK") {
    ratio = 0.75;
  } else if (normalizedStatus === "NORMAL") {
    ratio = 0.25;
  }

  // Geometry
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ratio * circumference;

  // Colors
  const colors: Record<string, { track: string; stroke: string }> = {
    NORMAL: { track: "#DCFCE7", stroke: "#15803D" },
    AT_RISK: { track: "#FEF3C7", stroke: "#B45309" },
    BREACHED: { track: "#FEE2E2", stroke: "#B91C1C" },
    ESCALATED: { track: "#EDE9FE", stroke: "#6D28D9" },
    STOPPED: { track: "#E2E8F0", stroke: "#64748B" },
    CLOSED: { track: "#E2E8F0", stroke: "#64748B" },
  };

  const scheme = colors[normalizedStatus] || colors.NORMAL;
  const isBreached = normalizedStatus === "BREACHED";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        isBreached && "animate-sla-breach",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] overflow-visible"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scheme.track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scheme.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-300 ease-out"
        />
      </svg>
    </div>
  );
}
