"use client";

import React from "react";
import { Layers, Activity, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  HealthBar,
  SlaCounts,
  CountUp,
  Skeleton,
  Card,
} from "@/components/ui";
import { InsightsResponse } from "@/lib/types";
import { getThemeMeta } from "./themeData";

export interface InsightsKpiStripProps {
  data: InsightsResponse | null;
  slaCounts?: SlaCounts;
  totalTicketsCount?: number;
  days: number;
  loading: boolean;
  onFilterStatus?: (status: "NORMAL" | "AT_RISK" | "BREACHED" | "ESCALATED" | "ALL") => void;
}

export function InsightsKpiStrip({
  data,
  slaCounts,
  totalTicketsCount,
  days,
  loading,
  onFilterStatus,
}: InsightsKpiStripProps) {
  const themes = data?.themes || [];

  // Metrics strictly computed from real API data
  const themesCount = themes.length;
  const totalAffectedTickets = themes.reduce((acc, t) => acc + t.count, 0);

  const totalHoursWasted = themes.reduce((acc, t) => {
    const meta = getThemeMeta(t.theme);
    return acc + t.count * meta.avgHoursPerIncident;
  }, 0);

  const topTheme = themes.length > 0 ? themes[0] : null;

  if (loading) {
    return (
      <div className="space-y-4">
        {/* SLA HealthBar skeleton */}
        <div className="bg-surface border border-border rounded-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* 4 KPI cards skeleton */}
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Fleet SLA HealthBar computed strictly from real API data with legend counts and filter links */}
      {slaCounts && (
        <Card className="p-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-orange dark:text-brand-orange-text" />
              <span className="text-caption font-semibold text-content-primary">
                Operational SLA health status
              </span>
            </div>
            <span className="text-[11px] text-content-tertiary font-mono-numbers">
              {totalTicketsCount ?? (slaCounts.onTrack + slaCounts.atRisk + slaCounts.breached + slaCounts.escalated)} active cases monitored
            </span>
          </div>
          <HealthBar
            counts={slaCounts}
            total={totalTicketsCount}
            onFilterClick={onFilterStatus}
          />
        </Card>
      )}

      {/* 2. 4 KPI Cards with CountUp on load (NO pointer-position effects) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Recurring themes */}
        <Card className="p-4 shadow-xs flex flex-col justify-between h-full hover:border-border-strong transition-subtle">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-caption font-medium text-content-secondary truncate">
              Recurring themes
            </span>
            <div className="w-7 h-7 rounded-input bg-surface-subtle flex items-center justify-center text-brand-orange dark:text-brand-orange-text shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-3 my-1">
            <span className="text-kpi font-semibold text-content-primary font-mono-numbers tracking-tight leading-none">
              <CountUp end={themesCount} durationMs={700} />
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-[12px]">
            <span className="text-content-tertiary truncate text-[11px]">
              {days === 7 ? "Detected this week" : `Detected in ${days}d window`}
            </span>
          </div>
        </Card>

        {/* KPI 2: Affected tickets */}
        <Card className="p-4 shadow-xs flex flex-col justify-between h-full hover:border-border-strong transition-subtle">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-caption font-medium text-content-secondary truncate">
              Affected tickets
            </span>
            <div className="w-7 h-7 rounded-input bg-surface-subtle flex items-center justify-center text-brand-orange dark:text-brand-orange-text shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-3 my-1">
            <span className="text-kpi font-semibold text-content-primary font-mono-numbers tracking-tight leading-none">
              <CountUp end={totalAffectedTickets} durationMs={800} />
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-[12px]">
            <span className="text-content-tertiary truncate text-[11px]">
              {totalAffectedTickets > 0 ? "Clustered from triage records" : "No affected tickets"}
            </span>
          </div>
        </Card>

        {/* KPI 3: Estimated impact */}
        <Card className="p-4 shadow-xs flex flex-col justify-between h-full hover:border-border-strong transition-subtle">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-caption font-medium text-content-secondary truncate">
              Estimated impact
            </span>
            <div className="w-7 h-7 rounded-input bg-surface-subtle flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-3 my-1">
            <span className="text-kpi font-semibold text-content-primary font-mono-numbers tracking-tight leading-none">
              <CountUp end={Math.round(totalHoursWasted)} suffix=" hrs" durationMs={900} />
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-[12px]">
            <span className="text-content-tertiary truncate text-[11px]">
              Operational overhead across cases
            </span>
          </div>
        </Card>

        {/* KPI 4: Top friction area */}
        <Card className="p-4 shadow-xs flex flex-col justify-between h-full hover:border-border-strong transition-subtle">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-caption font-medium text-content-secondary truncate">
              Top friction area
            </span>
            <div className="w-7 h-7 rounded-input bg-surface-subtle flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-3 my-1">
            <span className="text-kpi font-semibold text-content-primary tracking-tight leading-none truncate text-[22px]">
              {topTheme ? topTheme.theme : "None"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-[12px]">
            {topTheme ? (
              <span className="text-content-tertiary truncate text-[11px] font-mono-numbers">
                <CountUp end={topTheme.percentage} suffix="%" durationMs={1000} /> volume share • {topTheme.count} cases
              </span>
            ) : (
              <span className="text-content-tertiary truncate text-[11px]">
                No active friction clusters
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
