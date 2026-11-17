"use client";

import React from "react";
import { Layers, Activity, Clock, AlertTriangle } from "lucide-react";
import { KpiCard, Skeleton } from "@/components/ui";
import { InsightsResponse } from "@/lib/types";
import { getThemeMeta } from "./themeData";

export interface InsightsKpiStripProps {
  data: InsightsResponse | null;
  days: number;
  loading: boolean;
}

export function InsightsKpiStrip({ data, days, loading }: InsightsKpiStripProps) {
  const themes = data?.themes || [];

  // 1. Recurring Themes Detected (total count)
  const themesCount = themes.length;

  // 2. Total Affected Tickets (sum across themes)
  const totalAffectedTickets = themes.reduce((acc, t) => acc + t.count, 0);

  // 3. Est. Hours Wasted / Impact (formatted neatly from real data)
  const totalHoursWasted = themes.reduce((acc, t) => {
    const meta = getThemeMeta(t.theme);
    return acc + t.count * meta.avgHoursPerIncident;
  }, 0);

  // 4. Top Escalation / Problem Area
  const topTheme = themes.length > 0 ? themes[0] : null;
  const topAreaName = topTheme
    ? topTheme.theme.length > 20
      ? `${topTheme.theme.slice(0, 19)}…`
      : topTheme.theme
    : "None";

  // Sparkline trajectory from themes distribution
  const sparklineCounts = themes.length > 1 ? themes.map((t) => t.count) : [0, 4, 8, 12, 16];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-card p-4 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-7 rounded-input" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Recurring Themes Detected */}
      <KpiCard
        label="Recurring Themes Detected"
        value={themesCount.toString()}
        icon={<Layers className="w-4 h-4 text-brand-600" />}
        subtext={`Identified in last ${days} days`}
        sparklineData={sparklineCounts}
      />

      {/* 2. Total Affected Tickets */}
      <KpiCard
        label="Total Affected Tickets"
        value={totalAffectedTickets.toLocaleString()}
        icon={<Activity className="w-4 h-4 text-brand-600" />}
        subtext={`${totalAffectedTickets > 0 ? "Indexed from triage records" : "No affected tickets"}`}
        delta={
          totalAffectedTickets > 0
            ? {
                value: `${days}d window`,
                trend: "neutral",
              }
            : undefined
        }
      />

      {/* 3. Est. Hours Wasted / Impact */}
      <KpiCard
        label="Est. Hours Wasted / Impact"
        value={`${Math.round(totalHoursWasted).toLocaleString()} hrs`}
        icon={<Clock className="w-4 h-4 text-amber-600" />}
        subtext="Avg ~2.0h operational overhead / case"
        delta={
          totalHoursWasted > 0
            ? {
                value: `~${(totalHoursWasted / Math.max(1, totalAffectedTickets)).toFixed(1)}h / case`,
                trend: totalHoursWasted > 100 ? "down" : "neutral",
              }
            : undefined
        }
      />

      {/* 4. Top Escalation / Problem Area */}
      <KpiCard
        label="Top Escalation / Problem Area"
        value={topAreaName}
        icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
        subtext={
          topTheme
            ? `${topTheme.percentage}% volume • ${topTheme.count.toLocaleString()} cases`
            : "No active friction clusters"
        }
      />
    </div>
  );
}
