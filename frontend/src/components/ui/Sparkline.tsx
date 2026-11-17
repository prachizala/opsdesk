"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
}

export function Sparkline({
  data = [],
  width = 80,
  height = 24,
  strokeColor = "currentColor",
  strokeWidth = 1.75,
  className,
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn("overflow-visible text-content-disabled", className)}
        aria-hidden="true"
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray="2 2"
        />
      </svg>
    );
  }

  if (data.length === 1) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn("overflow-visible text-brand-600", className)}
        aria-hidden="true"
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 2;
  const innerHeight = height - padding * 2;
  const innerWidth = width - padding * 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * innerWidth;
      const y = padding + innerHeight - ((val - min) / range) * innerHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible text-brand-600 shrink-0", className)}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
