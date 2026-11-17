"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles, Layers, ArrowRight, ExternalLink } from "lucide-react";
import { Card, Skeleton } from "@/components/ui";
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

  // Ensure themes are sorted descending by incident count
  const sortedThemes = [...themes].sort((a, b) => b.count - a.count);
  const maxCount = sortedThemes.length > 0 ? Math.max(...sortedThemes.map((t) => t.count)) : 100;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Chart Section Header */}
      <div className="p-5 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-section font-semibold text-content-primary tracking-tight">
              Top themes
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              <Sparkles className="w-3 h-3 text-brand-600" />
              <span>Pattern engine</span>
            </span>
          </div>
          <p className="text-caption text-content-secondary mt-1">
            Deterministic clustering across {days}-day sample ({totalTagged.toLocaleString()} total indexed cases). Click any theme to inspect details in side drawer.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-caption text-content-tertiary">
          <Layers className="w-4 h-4 text-content-tertiary" />
          <span className="font-mono-numbers font-medium">
            {sortedThemes.length} {sortedThemes.length === 1 ? "theme" : "themes"} tracked
          </span>
        </div>
      </div>

      {/* Horizontal Bar Chart List */}
      <div className="divide-y divide-border">
        {sortedThemes.map((theme, index) => {
          const meta = getThemeMeta(theme.theme);
          const relativeWidth = Math.min(100, Math.max(5, Math.round((theme.count / maxCount) * 100)));
          const isHovered = hoveredTheme === theme.theme;

          // Bar color: Departure amber for top/urgent/warning themes, brand teal for standard
          const isAmberTheme = index === 0 || meta.category === "urgent" || meta.category === "warning";
          const barColorClass = isAmberTheme ? "bg-amber-500" : "bg-brand-600";

          const sampleTickets = theme.sample_ticket_ids?.slice(0, 3) || [];

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
                "p-5 transition-subtle cursor-pointer group relative outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
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
                  <span
                    className={cn(
                      "font-mono-numbers font-semibold px-2 py-0.5 rounded border shadow-xs text-[12px]",
                      isAmberTheme
                        ? "text-amber-800 bg-amber-50 border-amber-200"
                        : "text-brand-700 bg-brand-50 border-brand-200"
                    )}
                  >
                    {theme.percentage}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-content-tertiary group-hover:text-brand-600 group-hover:translate-x-0.5 transition-subtle" />
                </div>
              </div>

              {/* Horizontal Bar */}
              <div className="w-full bg-surface-subtle rounded-full h-3 overflow-hidden border border-border/70 my-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    barColorClass
                  )}
                  style={{ width: `${relativeWidth}%` }}
                />
              </div>

              {/* Bottom Row: Sample tickets with hover popover preview */}
              <div className="flex items-center justify-between gap-4 mt-2">
                {sampleTickets.length > 0 ? (
                  <div className="flex items-center gap-2 text-caption text-content-secondary flex-wrap">
                    <span className="text-[11px] font-semibold text-content-tertiary uppercase tracking-wider shrink-0">
                      Sample tickets:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {sampleTickets.map((tId) => (
                        <Link
                          key={tId}
                          href={`/ticket/${tId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono font-mono-numbers text-[11px] px-2 py-0.5 rounded-input bg-surface border border-border text-brand-700 hover:border-brand-500 hover:bg-brand-50 transition-subtle shadow-xs inline-flex items-center gap-1"
                        >
                          <span>{tId}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </Link>
                      ))}
                      {theme.sample_ticket_ids.length > 3 && (
                        <span className="text-[11px] text-content-tertiary font-mono-numbers">
                          +{theme.sample_ticket_ids.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-caption text-content-tertiary italic">
                    No sample tickets recorded in current window
                  </span>
                )}

                <span className="text-[11px] text-content-tertiary hidden sm:inline-block group-hover:text-brand-600 transition-colors">
                  Click to open details drawer →
                </span>
              </div>

              {/* Hover Popover showing up to 3 sample tickets */}
              {isHovered && sampleTickets.length > 0 && (
                <div
                  role="tooltip"
                  className="absolute z-30 left-6 right-6 -bottom-2 translate-y-full bg-surface border border-border-strong rounded-card shadow-lg p-3 space-y-2 pointer-events-auto animate-in fade-in zoom-in-95 duration-100 max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-border pb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-content-tertiary">
                      Sample tickets for {theme.theme} (up to 3)
                    </span>
                    <span className="text-[10px] text-brand-700 font-mono-numbers">
                      {theme.count} total cases
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {sampleTickets.map((tId) => (
                      <Link
                        key={tId}
                        href={`/ticket/${tId}`}
                        className="flex items-center justify-between p-1.5 rounded-input bg-surface-subtle hover:bg-brand-50 hover:border-brand-300 border border-transparent transition-subtle group/link"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-brand-700">
                            {tId}
                          </span>
                          <span className="text-[11px] text-content-secondary group-hover/link:text-content-primary">
                            Open ticket investigation
                          </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-content-tertiary group-hover/link:text-brand-600 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                  <div className="text-[10px] text-content-tertiary pt-1 border-t border-border flex justify-between">
                    <span>Click row to view full drawer analysis</span>
                    <span className="text-brand-600 font-medium">Open drawer →</span>
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
