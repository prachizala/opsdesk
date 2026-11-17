"use client";

import React, { useState } from "react";
import { ChevronRight, Sparkles, Layers } from "lucide-react";
import { Card, Skeleton, Tooltip } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ThemeInsight } from "@/lib/types";
import { getThemeMeta } from "./themeData";

export interface ThemesBarChartProps {
  themes: ThemeInsight[];
  totalTagged: number;
  days: number;
  loading: boolean;
  onSelectTheme: (theme: ThemeInsight) => void;
}

export function ThemesBarChart({
  themes,
  totalTagged,
  days,
  loading,
  onSelectTheme,
}: ThemesBarChartProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  if (loading) {
    return (
      <Card padding="none" className="overflow-hidden">
        <div className="p-5 border-b border-border bg-surface flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-3 w-96" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="p-6 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Calculate max count for proportional bar scaling
  const maxCount = themes.length > 0 ? Math.max(...themes.map((t) => t.count)) : 100;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Chart Section Header */}
      <div className="p-5 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-section font-semibold text-content-primary tracking-tight">
              Recurring Themes by Affected Tickets
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <Sparkles className="w-3 h-3 text-brand-600" />
              <span>Pattern Engine</span>
            </span>
          </div>
          <p className="text-caption text-content-secondary mt-1">
            Deterministic clustering across {days}-day sample ({totalTagged.toLocaleString()} total indexed cases). Click any theme to inspect root cause &amp; sample tickets.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-caption text-content-tertiary">
          <Layers className="w-4 h-4 text-content-tertiary" />
          <span className="font-mono-numbers font-medium">
            {themes.length} {themes.length === 1 ? "theme" : "themes"} tracked
          </span>
        </div>
      </div>

      {/* Horizontal Bar Chart List */}
      <div className="divide-y divide-border">
        {themes.map((theme, index) => {
          const meta = getThemeMeta(theme.theme);
          const topSample = theme.sample_ticket_ids?.[0] || "None";
          const relativeWidth = Math.min(100, Math.max(4, Math.round((theme.count / maxCount) * 100)));
          const isHovered = hoveredTheme === theme.theme;

          return (
            <div
              key={theme.theme}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTheme(theme)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectTheme(theme);
                }
              }}
              onMouseEnter={() => setHoveredTheme(theme.theme)}
              onMouseLeave={() => setHoveredTheme(null)}
              className={cn(
                "p-5 transition-subtle cursor-pointer group relative outline-hidden",
                isHovered ? "bg-surface-subtle/80" : "hover:bg-surface-subtle/50"
              )}
              aria-label={`Inspect ${theme.theme} (${theme.count} cases)`}
            >
              {/* Row Top: Theme Title + Metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-surface text-content-secondary text-caption font-semibold flex items-center justify-center shrink-0 border border-border group-hover:border-brand-500 group-hover:text-brand-700 transition-subtle font-mono-numbers shadow-xs">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-table font-semibold text-content-primary group-hover:text-brand-700 transition-subtle truncate">
                      {theme.theme}
                    </h3>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0",
                        meta.badgeBg,
                        meta.badgeText
                      )}
                    >
                      {meta.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-caption shrink-0">
                  <span className="font-semibold text-content-primary font-mono-numbers">
                    {theme.count.toLocaleString()} cases
                  </span>
                  <span className="font-mono-numbers font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 shadow-xs">
                    {theme.percentage}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-content-tertiary group-hover:text-brand-600 group-hover:translate-x-0.5 transition-subtle" />
                </div>
              </div>

              {/* Horizontal Bar with Tooltip on Hover */}
              <Tooltip
                position="top"
                content={
                  <div className="text-left space-y-1 p-0.5 max-w-xs">
                    <div className="font-semibold text-white flex items-center justify-between gap-3">
                      <span>{theme.theme}</span>
                      <span className="font-mono-numbers text-brand-300">{theme.percentage}%</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-tight line-clamp-2">
                      {meta.operationalSummary}
                    </p>
                    <div className="pt-1 text-[10px] text-slate-400 font-mono-numbers border-t border-slate-700 flex items-center justify-between">
                      <span>Top case: {topSample}</span>
                      <span className="text-brand-300">Click to inspect →</span>
                    </div>
                  </div>
                }
              >
                <div className="w-full bg-surface-subtle rounded-full h-3 overflow-hidden border border-border/70 my-2">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      meta.barColor
                    )}
                    style={{ width: `${relativeWidth}%` }}
                  />
                </div>
              </Tooltip>

              {/* Bottom Row: Sample Case Pills */}
              {theme.sample_ticket_ids && theme.sample_ticket_ids.length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-caption text-content-secondary">
                  <span className="text-[11px] font-semibold text-content-tertiary uppercase tracking-wider shrink-0">
                    Sample cases:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {theme.sample_ticket_ids.slice(0, 5).map((tId) => (
                      <span
                        key={tId}
                        className="font-mono font-mono-numbers text-[11px] px-2 py-0.5 rounded-input bg-surface border border-border text-brand-700 group-hover:border-brand-300 transition-subtle shadow-xs"
                      >
                        {tId}
                      </span>
                    ))}
                    {theme.sample_ticket_ids.length > 5 && (
                      <span className="text-[11px] text-content-tertiary font-mono-numbers">
                        +{theme.sample_ticket_ids.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
