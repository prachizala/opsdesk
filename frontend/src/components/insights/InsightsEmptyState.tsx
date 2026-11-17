"use client";

import React from "react";
import { Button } from "@/components/ui";

export interface InsightsEmptyStateProps {
  days: number;
  onExpandWindow?: () => void;
}

export function InsightsEmptyState({
  days,
  onExpandWindow,
}: InsightsEmptyStateProps) {
  return (
    <div className="py-16 px-6 text-center max-w-lg mx-auto space-y-5 group select-none">
      {/* Paper-plane-over-dotted-route illustration (plane floats slightly on hover) */}
      <div className="w-32 h-32 mx-auto relative flex items-center justify-center">
        {/* Subtle ambient radar wash */}
        <div className="absolute inset-0 bg-brand-orange/10 rounded-full blur-xl" />

        <svg
          className="w-28 h-28 text-brand-orange dark:text-brand-orange-text relative z-10 overflow-visible"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Radar range rings */}
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.18"
            strokeDasharray="4 4"
          />
          <circle
            cx="60"
            cy="60"
            r="38"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.25"
          />
          <circle
            cx="60"
            cy="60"
            r="20"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.32"
          />

          {/* Radar crosshairs */}
          <line
            x1="60"
            y1="6"
            x2="60"
            y2="114"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
          <line
            x1="6"
            y1="60"
            x2="114"
            y2="60"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.2"
          />

          {/* Dotted flight trajectory / waypoint route */}
          <path
            d="M 18 92 C 32 68, 54 48, 86 34"
            stroke="var(--brand-orange)"
            strokeWidth="2"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />

          {/* Departure waypoint marker */}
          <circle cx="18" cy="92" r="3.5" fill="var(--brand-orange)" />
          <circle cx="18" cy="92" r="7" stroke="var(--brand-orange)" strokeWidth="1" strokeOpacity="0.3" />

          {/* Paper plane that floats slightly on hover */}
          <g className="transition-transform duration-300 ease-out transform group-hover:-translate-y-2 group-hover:translate-x-1.5 motion-reduce:transform-none">
            {/* Plane body */}
            <path
              d="M 88 30 L 66 38 L 74 48 Z"
              fill="var(--brand-orange)"
              className="drop-shadow-xs"
            />
            {/* Plane wing fold */}
            <path
              d="M 88 30 L 74 48 L 78 54 Z"
              fill="var(--brand-700)"
            />
            {/* Plane underside fold */}
            <path
              d="M 74 48 L 78 54 L 79 49 Z"
              fill="var(--brand-orange-navy)"
            />
            {/* Trailing motion plume */}
            <line
              x1="62"
              y1="40"
              x2="52"
              y2="44"
              stroke="var(--brand-orange)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />
          </g>
        </svg>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-section font-semibold text-content-primary tracking-tight">
          No themes this week yet
        </h3>
        <p className="text-body text-content-secondary leading-relaxed">
          Operational incident patterns and recurring root causes will appear here as cases are triaged in the {days}-day reporting window.
        </p>
      </div>

      {days < 30 && onExpandWindow && (
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExpandWindow}
            className="min-h-[44px] sm:min-h-[36px] focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Expand to 30-day window
          </Button>
        </div>
      )}
    </div>
  );
}
