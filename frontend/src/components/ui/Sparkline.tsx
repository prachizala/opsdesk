"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  showHoverGuide?: boolean;
  className?: string;
}

export function Sparkline({
  data = [],
  width = 80,
  height = 24,
  strokeColor = "#0B7F8B",
  strokeWidth = 1.75,
  showHoverGuide = true,
  className,
}: SparklineProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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
  const padding = 3;
  const innerHeight = height - padding * 2;
  const innerWidth = width - padding * 2;

  const pointsArray = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((val - min) / range) * innerHeight;
    return { x, y, val };
  });

  const pointsString = pointsArray.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!showHoverGuide) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (relX - padding) / innerWidth));
    const closestIdx = Math.round(ratio * (data.length - 1));
    setHoverIndex(closestIdx);
  };

  const hoveredPoint = hoverIndex !== null ? pointsArray[hoverIndex] : null;

  return (
    <div className="relative inline-block select-none group/spark">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        className={cn("overflow-visible shrink-0 cursor-crosshair", className)}
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsString}
        />

        {/* Hover vertical guide line + dot indicator */}
        {showHoverGuide && hoveredPoint && (
          <g>
            <line
              x1={hoveredPoint.x}
              y1={padding}
              x2={hoveredPoint.x}
              y2={height - padding}
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="2 2"
              className="opacity-70"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="2.5"
              fill={strokeColor}
              stroke="#FFFFFF"
              strokeWidth="1"
            />
          </g>
        )}
      </svg>

      {/* Floating tooltip with value */}
      {showHoverGuide && hoveredPoint && (
        <div
          className="absolute bottom-full mb-1 -translate-x-1/2 pointer-events-none z-20 px-1.5 py-0.5 rounded text-[10px] font-mono-numbers font-semibold bg-chrome-navy-900 text-white shadow-xs border border-[#16384C]"
          style={{ left: hoveredPoint.x }}
        >
          {hoveredPoint.val}
        </div>
      )}
    </div>
  );
}
