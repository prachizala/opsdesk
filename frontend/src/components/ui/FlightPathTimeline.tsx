"use client";

import React from "react";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlightPathTimelineProps {
  nowDate?: string | Date;
  createdAt?: string | Date;
  lcd?: string | Date | null;
  checkIn?: string | Date | null;
  controllingDeadline?: "LCD" | "CHECK_IN" | "SLA" | string;
  variant?: "compact" | "full";
  className?: string;
}

export function FlightPathTimeline({
  nowDate,
  createdAt,
  lcd,
  checkIn,
  controllingDeadline,
  variant = "full",
  className,
}: FlightPathTimelineProps) {
  const now = nowDate ? new Date(nowDate).getTime() : Date.now();
  const lcdTime = lcd ? new Date(lcd).getTime() : null;
  const checkInTime = checkIn ? new Date(checkIn).getTime() : null;

  // Determine past states & deadlines
  const isLcdPast = lcdTime !== null && lcdTime < now;
  const isCheckInPast = checkInTime !== null && checkInTime < now;

  // Identify controlling deadline
  const effectiveControlling =
    controllingDeadline ||
    (lcdTime && !isLcdPast ? "LCD" : checkInTime && !isCheckInPast ? "CHECK_IN" : "LCD");

  // Plane color based on progress toward LCD gate:
  // Approaching gate (< 2 hours or ratio > 0.75): amber #FFB020
  // Past gate: red #B91C1C
  // Otherwise brand teal #0E9AA7
  let planeColor = "#0E9AA7"; // brand teal
  if (isLcdPast) {
    planeColor = "#B91C1C"; // breached/past gate
  } else if (lcdTime !== null) {
    const hoursToLcd = (lcdTime - now) / (1000 * 60 * 60);
    if (hoursToLcd <= 2) {
      planeColor = "#D97706"; // amber approaching gate
    }
  }

  // Calculate plane progress position (0 to 100%)
  let planeProgressPct = 15; // default starting point
  if (lcdTime && checkInTime) {
    const totalSpan = checkInTime - now;
    if (totalSpan <= 0) {
      planeProgressPct = 95;
    } else if (isLcdPast) {
      planeProgressPct = 65;
    } else {
      planeProgressPct = 25;
    }
  }

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
            ? `Flight Path: NOW -> LCD Gate (${lcd ? formatDate(lcd) : "None"}) -> Check-in (${checkIn ? formatDate(checkIn) : "None"})`
            : `Flight Path: NOW -> LCD Gate (${lcd ? formatDate(lcd) : "None"}) -> Check-in (${checkIn ? formatDate(checkIn) : "None"})`
        }
      >
        <span className="text-content-disabled font-medium text-[11px] flex items-center gap-1">
          <Plane className="w-3 h-3 rotate-45 shrink-0" style={{ color: planeColor }} />
          NOW
        </span>
        <div className="relative w-28 h-1.5 bg-surface-subtle rounded-full overflow-visible flex items-center border border-border">
          {/* Dotted / dashed track */}
          <div className="absolute inset-0 border-b border-dashed border-border-strong top-0" />
          
          {/* LCD Gate Marker dot */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border",
              isLcdPast
                ? "bg-slate-400 border-slate-300"
                : effectiveControlling === "LCD"
                ? "bg-departure-amber border-amber-300 ring-2 ring-amber-100"
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
            Gate {lcd ? formatDate(lcd).split(",")[0] : "—"}
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

  // Full Variant (Signature Mission Control Graphic)
  return (
    <div className={cn("w-full flex flex-col gap-2 select-none py-2", className)}>
      {/* SVG Arc Track with Plane Marker */}
      <div className="relative w-full h-12 flex items-center">
        <svg
          viewBox="0 0 400 48"
          preserveAspectRatio="none"
          className="w-full h-12 overflow-visible"
        >
          {/* Dotted arc track */}
          <path
            d="M 20 36 Q 200 6, 380 36"
            fill="none"
            stroke="#CBD2DC"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {/* Active progress arc segment */}
          <path
            d={isLcdPast ? "M 20 36 Q 200 6, 380 36" : "M 20 36 Q 110 20, 200 21"}
            fill="none"
            stroke={isLcdPast ? "#94A3B8" : "#0E9AA7"}
            strokeWidth="2.5"
            strokeDasharray={isLcdPast ? "none" : "none"}
          />
        </svg>

        {/* Milestone 1: NOW with moving Plane marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-300"
          style={{
            left: `${planeProgressPct}%`,
            top: planeProgressPct < 50 ? "24px" : "30px",
          }}
        >
          <div
            className="w-6 h-6 rounded-full bg-surface border border-border shadow-xs flex items-center justify-center transition-colors"
            style={{ borderColor: planeColor }}
            title={`Plane position: ${isLcdPast ? "Past LCD Gate" : "En route"}`}
          >
            <Plane className="w-3.5 h-3.5 rotate-45" style={{ color: planeColor }} />
          </div>
        </div>

        {/* Milestone 2: LCD Gate (50% position) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center z-10">
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2 shadow-xs transition-subtle flex items-center justify-center",
              isLcdPast
                ? "bg-slate-300 border-slate-400"
                : effectiveControlling === "LCD"
                ? "bg-departure-amber border-white ring-4 ring-amber-100"
                : "bg-surface border-border-strong"
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Milestone 3: Check-in (100% position) */}
        <div className="absolute right-4 -translate-x-1/2 top-7 flex flex-col items-center z-10">
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2 shadow-xs transition-subtle",
              isCheckInPast
                ? "bg-slate-300 border-slate-400"
                : effectiveControlling === "CHECK_IN"
                ? "bg-brand-600 border-white ring-4 ring-brand-100"
                : "bg-surface border-border-strong"
            )}
          />
        </div>
      </div>

      {/* Milestone Labels Row */}
      <div className="relative flex justify-between items-start text-[12px] pt-1">
        {/* NOW */}
        <div className="flex flex-col items-start text-left">
          <span className="font-semibold text-content-primary flex items-center gap-1">
            <span>NOW</span>
          </span>
          <span className="text-[11px] text-content-tertiary font-mono-numbers">
            {formatDate(now)}
          </span>
        </div>

        {/* LCD Gate Marker Label */}
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
              LCD Gate
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

// Re-export alias for TravelTimeline backward compatibility
export const TravelTimeline = FlightPathTimeline;
