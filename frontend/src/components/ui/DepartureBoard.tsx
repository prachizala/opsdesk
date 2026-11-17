"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SplitFlapProps {
  char?: string | number;
  size?: "sm" | "md" | "lg";
  amber?: boolean;
  className?: string;
}

/**
 * SplitFlap: Flip digit animation with 3D perspective and split top/bottom cards.
 * Amber mono text by default. Stays navy in both light and dark modes.
 */
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
        "relative select-none inline-flex flex-col items-center justify-center font-mono-numbers font-bold rounded-sm bg-[#07111E] border border-[#1E293B] overflow-hidden shadow-xs split-flap-container",
        amber ? "text-departure-amber" : "text-white",
        sizeClasses[size],
        className
      )}
      aria-label={String(displayChar)}
    >
      {/* Top half */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-[#0B1526] overflow-hidden border-b border-[#050D18]/90 flex items-end justify-center">
        <span className="translate-y-1/2">{displayChar}</span>
      </div>

      {/* Bottom half */}
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-[#081120] overflow-hidden flex items-start justify-center">
        <span className="-translate-y-1/2">{displayChar}</span>
      </div>

      {/* Flipping card flap */}
      {isFlipping && (
        <div className="absolute inset-0 bg-[#0F2038] animate-flap flex items-center justify-center pointer-events-none opacity-80" />
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

/**
 * DepartureBoard: Large 24px-rounded navy panel, split-flap digit flip animation, amber mono text.
 * Stays dark navy (#0F172A / #0B1120) in BOTH light and dark modes.
 */
export function DepartureBoard({
  title = "DISPATCH DEPARTURE BOARD",
  rows,
  children,
  className,
}: DepartureBoardProps) {
  return (
    <div
      className={cn(
        "bg-[#0F172A] border border-[#1E293B] rounded-[24px] p-5 text-slate-100 shadow-md flex flex-col gap-3 font-mono-numbers",
        className
      )}
    >
      {/* Board Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-[11px] uppercase tracking-wider text-slate-400">
        <span className="font-semibold text-departure-amber flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-departure-amber animate-pulse" />
          {title}
        </span>
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <span>ZONE: GLOBAL DISPATCH</span>
          <span className="hidden sm:inline">TERMINAL 1</span>
        </div>
      </div>

      {/* Structured Board Rows */}
      {rows && rows.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-[#1E293B]/60">
            <span className="col-span-3">TICKET / FLT</span>
            <span className="col-span-4">DESTINATION / ROUTE</span>
            <span className="col-span-2">GATE / LCD</span>
            <span className="col-span-3 text-right">STATUS</span>
          </div>

          {rows.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded-lg bg-[#0B1120]/60 hover:bg-[#1E293B]/50 transition-subtle text-caption"
            >
              <div className="col-span-3 flex items-center gap-1 font-bold text-slate-200">
                {row.code.split("").map((c, i) => (
                  <SplitFlap key={i} char={c} size="sm" amber={false} />
                ))}
              </div>
              <span className="col-span-4 truncate text-slate-300">
                {row.destination || "SYSTEM DISPATCH"}
              </span>
              <span className="col-span-2 text-departure-amber font-semibold">
                {row.gate || row.time || "--:--"}
              </span>
              <span className="col-span-3 text-right font-semibold text-slate-300">
                {row.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
