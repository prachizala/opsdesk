"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SpotlightGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  glowRadius?: number;
  glowOpacity?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * SpotlightGlow wrapper: Clean static / subtle card wrapper.
 * Strictly adheres to Hard Constraint 3: NO POINTER-POSITION EFFECTS.
 * Hover triggers on enter/leave with pure CSS transition; never tracks mouse coordinates.
 */
export function SpotlightGlow({
  children,
  className,
  ...props
}: SpotlightGlowProps) {
  return (
    <div
      className={cn(
        "relative rounded-card transition-subtle group/spotlight hover:shadow-md",
        className
      )}
      {...props}
    >
      {/* Subtle static ambient glow overlay on hover (no mouse coordinate tracking) */}
      <div
        className="pointer-events-none absolute -inset-px rounded-card opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-200 z-10 border border-brand-orange/20 dark:border-brand-orange/30 shadow-[0_0_12px_rgba(234,88,12,0.06)]"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
