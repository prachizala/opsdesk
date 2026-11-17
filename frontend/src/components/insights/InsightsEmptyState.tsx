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
    <div className="py-16 px-6 text-center max-w-lg mx-auto space-y-4">
      {/* SVG Graphic: Paper plane / Radar mission control graphic */}
      <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
        {/* Subtle brand teal wash circle */}
        <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-md" />

        <svg
          className="w-20 h-20 text-brand-600 relative z-10"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Radar concentric range circles */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.2"
            strokeDasharray="4 4"
          />
          <circle
            cx="50"
            cy="50"
            r="28"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.3"
          />
          <circle
            cx="50"
            cy="50"
            r="14"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />

          {/* Crosshair axes */}
          <line
            x1="50"
            y1="8"
            x2="50"
            y2="92"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.25"
          />
          <line
            x1="8"
            y1="50"
            x2="92"
            y2="50"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.25"
          />

          {/* Paper airplane flight path */}
          <path
            d="M20 70C28 42 62 26 80 32"
            stroke="#0B7F8B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Paper airplane */}
          <path
            d="M80 32L68 35L72 41L80 32Z"
            fill="#0B7F8B"
          />
          <path
            d="M72 41L74 46L76 42"
            stroke="#0A6772"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-section font-semibold text-content-primary tracking-tight">
          No recurring themes detected
        </h3>
        <p className="text-body text-content-secondary mt-1">
          Operational patterns will appear here as tickets accumulate in the {days}-day reporting window.
        </p>
      </div>

      {days < 30 && onExpandWindow && (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={onExpandWindow}>
            Expand Window to 30 Days
          </Button>
        </div>
      )}
    </div>
  );
}
