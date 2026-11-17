"use client";

import React, { useState, useRef, MouseEvent } from "react";
import { cn } from "@/lib/utils";

export interface SpotlightGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  glowRadius?: number;
  glowOpacity?: number;
  children: React.ReactNode;
  className?: string;
}

export function SpotlightGlow({
  glowColor = "rgba(14, 154, 167, 0.09)", // brand teal subtle
  glowRadius = 320,
  children,
  className,
  ...props
}: SpotlightGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setPosition(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden group/spotlight", className)}
      {...props}
    >
      {/* Dynamic radial glow overlay */}
      {position && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(${glowRadius}px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}
