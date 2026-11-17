"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface CountUpProps {
  end: number;
  start?: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({
  end,
  start = 0,
  durationMs = 800,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: CountUpProps) {
  const [current, setCurrent] = useState<number>(start);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = start;
    const endVal = end;
    const diff = endVal - startVal;

    // Respect reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || durationMs <= 0) {
      setCurrent(endVal);
      return;
    }

    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const val = startVal + diff * easeOut;
      setCurrent(val);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCurrent(endVal);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [end, start, durationMs]);

  const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();

  return (
    <span className={cn("font-mono-numbers", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
