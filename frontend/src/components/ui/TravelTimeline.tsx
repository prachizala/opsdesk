"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TravelTimelineProps {
  nowDate?: string | Date;
  createdAt?: string | Date;
  lcd?: string | Date | null;
  checkIn?: string | Date | null;
  controllingDeadline?: "LCD" | "CHECK_IN" | "SLA" | string;
  variant?: "compact" | "full";
  className?: string;
}

export function TravelTimeline({
  nowDate,
  createdAt,
  lcd,
  checkIn,
  controllingDeadline,
  variant = "full",
  className,
}: TravelTimelineProps) {
  const now = nowDate ? new Date(nowDate).getTime() : Date.now();
  const lcdTime = lcd ? new Date(lcd).getTime() : null;
  const checkInTime = checkIn ? new Date(checkIn).getTime() : null;

  // Determine past states
  const isLcdPast = lcdTime !== null && lcdTime < now;
  const isCheckInPast = checkInTime !== null && checkInTime < now;

  // Identify controlling deadline
  const effectiveControlling =
    controllingDeadline ||
    (lcdTime && !isLcdPast ? "LCD" : checkInTime && !isCheckInPast ? "CHECK_IN" : "LCD");

  // Format date helper: "Oct 14, 18:00"
  const formatDate = (dateVal?: string | Date | number | null): string => {
    if (!dateVal) return "N/A";
    const d = typeof dateVal === "number" || typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Compact Variant (~20px height for table rows)
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 h-5 text-[12px] font-mono-numbers select-none whitespace-nowrap",
          className
        )}
        title={
          createdAt
            ? `Created (${formatDate(createdAt)}) -> NOW -> LCD (${lcd ? formatDate(lcd) : "None"}) -> Check-in (${checkIn ? formatDate(checkIn) : "None"})`
            : `NOW -> LCD (${lcd ? formatDate(lcd) : "None"}) -> Check-in (${checkIn ? formatDate(checkIn) : "None"})`
        }
      >
        <span className="text-content-disabled font-medium text-[11px]">NOW</span>
        <div className="relative w-24 h-1.5 bg-surface-subtle rounded-full overflow-hidden flex items-center border border-border">
          {/* Past progress segment */}
          <div
            className={cn(
              "h-full transition-subtle",
              isCheckInPast
                ? "w-full bg-slate-300"
                : isLcdPast
                ? "w-1/2 bg-slate-300"
                : "w-1/6 bg-brand-500"
            )}
          />
          {/* LCD Marker dot */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border",
              isLcdPast
                ? "bg-slate-400 border-slate-300"
                : effectiveControlling === "LCD"
                ? "bg-amber-500 border-amber-300 ring-2 ring-amber-100"
                : "bg-brand-600 border-white"
            )}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-[11px] px-1 py-0.2 rounded font-medium",
              isLcdPast
                ? "text-content-disabled line-through"
                : effectiveControlling === "LCD"
                ? "bg-amber-50 text-amber-700 font-semibold border border-amber-200"
                : "text-content-secondary"
            )}
          >
            LCD {lcd ? formatDate(lcd).split(",")[0] : "—"}
          </span>
          <span className="text-content-disabled text-[10px]">→</span>
          <span
            className={cn(
              "text-[11px] px-1 py-0.2 rounded font-medium",
              isCheckInPast
                ? "text-content-disabled line-through"
                : effectiveControlling === "CHECK_IN"
                ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200"
                : "text-content-secondary"
            )}
          >
            In {checkIn ? formatDate(checkIn).split(",")[0] : "—"}
          </span>
        </div>
      </div>
    );
  }

  // Full Variant (for ticket detail view)
  return (
    <div className={cn("w-full flex flex-col gap-2 select-none py-1", className)}>
      {/* Track Container with 8px rounded track */}
      <div className="relative flex items-center w-full my-3">
        {/* Horizontal 8px rounded track */}
        <div className="w-full h-2 rounded-full bg-surface-subtle border border-border relative overflow-hidden flex">
          {/* Past progress segment */}
          <div
            className={cn(
              "h-full transition-subtle",
              isCheckInPast
                ? "w-full bg-slate-300"
                : isLcdPast
                ? "w-1/2 bg-slate-300"
                : "w-1/6 bg-brand-500"
            )}
          />
        </div>

        {/* Milestone 1: NOW */}
        <div className="absolute left-0 -translate-x-1/2 flex flex-col items-center">
          <div className="w-3.5 h-3.5 rounded-full bg-surface border-2 border-brand-600 shadow-xs z-10" />
        </div>

        {/* Milestone 2: LCD Marker */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2 shadow-xs z-10 transition-subtle",
              isLcdPast
                ? "bg-slate-300 border-slate-400"
                : effectiveControlling === "LCD"
                ? "bg-amber-500 border-white ring-4 ring-amber-100"
                : "bg-surface border-border-strong"
            )}
          />
        </div>

        {/* Milestone 3: Check-in */}
        <div className="absolute right-0 translate-x-1/2 flex flex-col items-center">
          <div
            className={cn(
              "w-3.5 h-3.5 rounded-full border-2 shadow-xs z-10 transition-subtle",
              isCheckInPast
                ? "bg-slate-300 border-slate-400"
                : effectiveControlling === "CHECK_IN"
                ? "bg-brand-600 border-white ring-4 ring-brand-100"
                : "bg-surface border-border-strong"
            )}
          />
        </div>
      </div>

      {/* Labels Row below the track: 12px text */}
      <div className="relative flex justify-between items-start text-[12px] pt-1">
        {/* NOW Label */}
        <div className="flex flex-col items-start text-left">
          <span className="font-semibold text-content-primary">NOW</span>
          <span className="text-[11px] text-content-tertiary font-mono-numbers">
            {formatDate(now)}
          </span>
        </div>

        {/* LCD Marker Label */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "font-medium",
                isLcdPast
                  ? "text-content-disabled line-through"
                  : effectiveControlling === "LCD"
                  ? "text-amber-800 font-semibold"
                  : "text-content-secondary"
              )}
            >
              LCD
            </span>
            {effectiveControlling === "LCD" && !isLcdPast && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-1 py-0.2 rounded">
                Controlling
              </span>
            )}
          </div>
          <span
            className={cn(
              "text-[11px] font-mono-numbers",
              isLcdPast
                ? "text-content-disabled line-through"
                : "text-content-tertiary"
            )}
          >
            {formatDate(lcd)}
          </span>
        </div>

        {/* Check-in Label */}
        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-1">
            {effectiveControlling === "CHECK_IN" && !isCheckInPast && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 px-1 py-0.2 rounded">
                Controlling
              </span>
            )}
            <span
              className={cn(
                "font-medium",
                isCheckInPast
                  ? "text-content-disabled line-through"
                  : effectiveControlling === "CHECK_IN"
                  ? "text-brand-800 font-semibold"
                  : "text-content-secondary"
              )}
            >
              Check-in
            </span>
          </div>
          <span
            className={cn(
              "text-[11px] font-mono-numbers",
              isCheckInPast
                ? "text-content-disabled line-through"
                : "text-content-tertiary"
            )}
          >
            {formatDate(checkIn)}
          </span>
        </div>
      </div>
    </div>
  );
}
