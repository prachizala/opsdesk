"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SplitFlapProps {
  char?: string | number;
  size?: "sm" | "md" | "lg";
  amber?: boolean;
  className?: string;
}

export function SplitFlap({
  char = " ",
  size = "md",
  amber = true,
  className,
}: SplitFlapProps) {
  const [displayChar, setDisplayChar] = useState<string>(String(char));
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  useEffect(() => {
    const nextChar = String(char);
    if (nextChar !== displayChar) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayChar(nextChar);
        setIsFlipping(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [char, displayChar]);

  const sizeClasses = {
    sm: "w-4 h-6 text-[11px]",
    md: "w-6 h-8 text-[14px]",
    lg: "w-8 h-11 text-[20px]",
  };

  return (
    <div
      className={cn(
        "relative select-none inline-flex flex-col items-center justify-center font-mono-numbers font-bold rounded-xs bg-[#07151D] border border-[#16384C] overflow-hidden shadow-xs split-flap-container",
        amber ? "text-departure-amber" : "text-white",
        sizeClasses[size],
        className
      )}
      aria-label={String(displayChar)}
    >
      {/* Top half */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-[#0B1F2A] overflow-hidden border-b border-[#050D13]/90 flex items-end justify-center">
        <span className="translate-y-1/2">{displayChar}</span>
      </div>

      {/* Bottom half */}
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-[#081822] overflow-hidden flex items-start justify-center">
        <span className="-translate-y-1/2">{displayChar}</span>
      </div>

      {/* Flipping card flap */}
      {isFlipping && (
        <div className="absolute inset-0 bg-[#0E2736] animate-flap flex items-center justify-center pointer-events-none opacity-80" />
      )}
    </div>
  );
}

export interface DepartureBoardRow {
  code: string;
  destination?: string;
  status: string;
  time?: string;
  gate?: string;
}

export interface DepartureBoardProps {
  title?: string;
  rows?: DepartureBoardRow[];
  children?: React.ReactNode;
  className?: string;
}

export function DepartureBoard({
  title = "DISPATCH DEPARTURE BOARD",
  rows,
  children,
  className,
}: DepartureBoardProps) {
  return (
    <div
      className={cn(
        "bg-chrome-navy-900 border border-[#16384C] rounded-card p-4 text-chrome-text shadow-md flex flex-col gap-3 font-mono-numbers",
        className
      )}
    >
      {/* Board Header */}
      <div className="flex items-center justify-between border-b border-[#16384C] pb-2 text-[11px] uppercase tracking-wider text-chrome-muted">
        <span className="font-semibold text-departure-amber flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-departure-amber animate-pulse" />
          {title}
        </span>
        <span>OPS MISSION CONTROL</span>
      </div>

      {/* Content */}
      {rows ? (
        <div className="flex flex-col gap-2 divide-y divide-[#12303F]/50">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="pt-2 first:pt-0 flex items-center justify-between text-[12px] gap-2 flex-wrap"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-wider">{row.code}</span>
                {row.destination && (
                  <span className="text-chrome-muted text-[11px]">{row.destination}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {row.gate && (
                  <span className="text-[11px] text-chrome-muted">GATE {row.gate}</span>
                )}
                {row.time && (
                  <span className="text-[11px] text-white">{row.time}</span>
                )}
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#12303F] text-departure-amber border border-[#1D445C]">
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
