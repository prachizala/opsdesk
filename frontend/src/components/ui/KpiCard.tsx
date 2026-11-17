"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

export interface KpiDelta {
  value: string | number;
  trend?: "up" | "down" | "neutral";
  label?: string;
}

export interface KpiCardProps {
  label: string;
  value: string | number;
  sparklineData?: number[];
  delta?: KpiDelta;
  icon?: React.ReactNode;
  subtext?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  sparklineData,
  delta,
  icon,
  subtext,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-card p-4 shadow-xs flex flex-col justify-between transition-subtle hover:border-border-strong",
        className
      )}
    >
      {/* Top Header: Label + Optional Icon */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-caption font-medium text-content-secondary truncate">
          {label}
        </span>
        {icon && (
          <div className="w-7 h-7 rounded-input bg-surface-subtle flex items-center justify-center text-content-tertiary shrink-0">
            {icon}
          </div>
        )}
      </div>

      {/* Middle Row: 28px Number + Optional Sparkline */}
      <div className="flex items-baseline justify-between gap-3 my-1">
        <span className="text-kpi font-semibold text-content-primary font-mono-numbers tracking-tight leading-none">
          {value}
        </span>
        {sparklineData && sparklineData.length > 0 && (
          <div className="shrink-0 pt-1">
            <Sparkline data={sparklineData} width={76} height={26} strokeColor="#0B7F8B" />
          </div>
        )}
      </div>

      {/* Bottom Row: Optional Delta only when data provided, or subtext */}
      {(delta || subtext) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-[12px]">
          {delta && (
            <div
              className={cn(
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono-numbers text-[11px] font-medium leading-tight shrink-0",
                delta.trend === "up"
                  ? "bg-emerald-50 text-emerald-700"
                  : delta.trend === "down"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-surface-subtle text-content-secondary"
              )}
            >
              {delta.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
              {delta.trend === "down" && <ArrowDownRight className="w-3 h-3" />}
              {delta.trend === "neutral" && <Minus className="w-3 h-3" />}
              <span>{delta.value}</span>
            </div>
          )}
          {(delta?.label || subtext) && (
            <span className="text-content-tertiary truncate text-[11px]">
              {delta?.label || subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
