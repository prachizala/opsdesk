"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { fetchInsightsThemes, getExportUrl } from "@/lib/api";
import { InsightsResponse, ThemeInsight } from "@/lib/types";
import {
  Button,
  Card,
  Drawer,
  Tooltip,
  Skeleton,
  ErrorState,
} from "@/components/ui";
import {
  Download,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  RefreshCw,
  Activity,
  Flame,
  AlertTriangle,
  ExternalLink,
  Timer,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InsightsPage() {
  const { currentUser, isLead, isEscalationManager } = useUser();
  const { showToast } = useToast();

  const [data, setData] = useState<InsightsResponse | null>(null);
  const [days, setDays] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Drawer state for inspecting theme sample tickets
  const [selectedTheme, setSelectedTheme] = useState<ThemeInsight | null>(null);

  const loadData = useCallback(async () => {
    if (!isLead && !isEscalationManager) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInsightsThemes(days, currentUser.id);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load insights";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [days, currentUser.id, isLead, isEscalationManager]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle CSV export with streaming feedback
  const handleExportCsv = async () => {
    if (!isLead) {
      showToast(
        `CSV export is restricted to Operations Team Lead. Current identity: ${currentUser.role}`,
        "warning"
      );
      return;
    }
    setIsExporting(true);
    showToast("Preparing download... streaming operational dataset", "info");
    try {
      const res = await fetch(getExportUrl(), {
        headers: {
          "X-User-Id": currentUser.id,
        },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.detail || `Export failed with HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `opsdesk_report_${days}d_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Operations report CSV downloaded successfully", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      showToast(`Error exporting report: ${msg}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  // RBAC guard: Operations leadership only
  if (!isLead && !isEscalationManager) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-content-primary mb-2">
          Restricted Leadership Console
        </h2>
        <p className="text-body text-content-secondary mb-6 leading-relaxed">
          The <strong>Operations Insights & Themes</strong> dashboard is restricted to{" "}
          <strong>Team Lead</strong> and <strong>Escalation Manager</strong> roles.
        </p>
        <Link href="/">
          <Button variant="primary" size="md">
            Return to Operations Queue
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate top theme metrics
  const topTheme = data?.themes && data.themes.length > 0 ? data.themes[0] : null;

  return (
    <div className="max-w-[1440px] mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-content-primary tracking-tight">
            Operations Insights
          </h1>
          <p className="text-body text-content-secondary mt-0.5">
            Real-time clustering of operational drivers, categorization, and breach diagnostics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector (7d / 14d / 30d) */}
          <div className="flex items-center bg-surface border border-border rounded-input p-0.5 shadow-xs">
            <span className="text-[11px] font-semibold text-content-tertiary px-2.5 uppercase tracking-wider">
              Window:
            </span>
            {[7, 14, 30].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setDays(period)}
                className={cn(
                  "px-3 py-1 rounded-input text-caption font-semibold transition-subtle cursor-pointer",
                  days === period
                    ? "bg-brand-50 text-brand-700 border border-brand-200 shadow-xs"
                    : "text-content-secondary hover:text-content-primary hover:bg-surface-subtle"
                )}
              >
                {period}d
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <Tooltip content="Refresh analytics window">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              aria-label="Refresh analytics"
              className="p-2 bg-surface border border-border text-content-secondary hover:text-content-primary rounded-input hover:bg-surface-subtle transition-subtle cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </Tooltip>

          {/* Export Report Button (Ghost variant) */}
          <Button
            variant="ghost"
            size="md"
            icon={<Download className="w-4 h-4 text-content-secondary" />}
            loading={isExporting}
            onClick={handleExportCsv}
            disabled={isExporting || !isLead}
            title={isLead ? "Stream uncapped CSV dataset" : "Export restricted to Team Lead"}
          >
            {isExporting ? "Preparing..." : "Export report"}
          </Button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Failed to Load Operational Insights"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* 2. 4 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Tagged Records */}
        <Card padding="md" className="space-y-2">
          <div className="flex items-center justify-between text-caption text-content-tertiary font-semibold uppercase tracking-wider">
            <span>Total Tagged Records</span>
            <Activity className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-semibold font-mono-numbers text-content-primary">
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              data?.total_tagged_records.toLocaleString() ?? "—"
            )}
          </div>
          <p className="text-caption text-content-secondary">
            Inbound tickets indexed in last {days} days
          </p>
        </Card>

        {/* KPI 2: Top Driver */}
        <Card padding="md" className="space-y-2">
          <div className="flex items-center justify-between text-caption text-content-tertiary font-semibold uppercase tracking-wider">
            <span>Top Driver</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-semibold text-content-primary truncate" title={topTheme?.theme}>
            {loading ? (
              <Skeleton className="h-9 w-36" />
            ) : (
              topTheme?.theme || "None"
            )}
          </div>
          <p className="text-caption text-content-secondary">
            {topTheme ? `${topTheme.percentage}% of inbound volume` : "—"}
          </p>
        </Card>

        {/* KPI 3: Breach Rate (Needs backend aggregation) */}
        <Card padding="md" className="space-y-2">
          <div className="flex items-center justify-between text-caption text-content-tertiary font-semibold uppercase tracking-wider">
            <span>Breach Rate</span>
            <Tooltip content="Requires backend aggregation endpoint /api/insights/breach-rate">
              <AlertTriangle className="w-4 h-4 text-content-tertiary" />
            </Tooltip>
          </div>
          <div className="text-3xl font-semibold font-mono-numbers text-content-tertiary flex items-center gap-2">
            <span>—</span>
            <span className="text-caption font-normal text-content-tertiary italic">
              (Needs backend)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-caption text-content-tertiary">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>SLA breach metric pending backend support</span>
          </div>
        </Card>

        {/* KPI 4: Avg Resolution Time (Needs backend aggregation) */}
        <Card padding="md" className="space-y-2">
          <div className="flex items-center justify-between text-caption text-content-tertiary font-semibold uppercase tracking-wider">
            <span>Avg Resolution Time</span>
            <Tooltip content="Requires backend aggregation endpoint /api/insights/resolution-time">
              <Clock className="w-4 h-4 text-content-tertiary" />
            </Tooltip>
          </div>
          <div className="text-3xl font-semibold font-mono-numbers text-content-tertiary flex items-center gap-2">
            <span>—</span>
            <span className="text-caption font-normal text-content-tertiary italic">
              (Needs backend)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-caption text-content-tertiary">
            <Timer className="w-3.5 h-3.5" />
            <span>Resolution duration pending backend support</span>
          </div>
        </Card>
      </div>

      {/* 3. "TOP THEMES" HORIZONTAL BAR CHART & SAMPLE INSPECTION */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-5 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-section font-semibold text-content-primary">
              Top Operational Themes & Root Causes
            </h2>
            <p className="text-caption text-content-secondary mt-0.5">
              Deterministic rule classifications across {days}d window. Click any theme to inspect sample cases.
            </p>
          </div>
          <span className="text-caption text-content-tertiary font-mono-numbers">
            {data?.themes?.length || 0} categories tracked
          </span>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : !data || data.themes.length === 0 ? (
          /* 4. CUSTOM SVG EMPTY STATE (Flight path over globe with teal wash) */
          <div className="py-16 px-6 text-center max-w-lg mx-auto space-y-4">
            <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
              {/* Subtle brand teal wash circle */}
              <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-md" />
              <svg
                className="w-20 h-20 text-brand-600 relative z-10"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Globe wireframe */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  strokeDasharray="4 3"
                />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="38"
                  ry="16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />
                <path
                  d="M50 12V88"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />
                {/* Arc Flight Path */}
                <path
                  d="M18 68C26 36 64 22 84 32"
                  stroke="#0B7F8B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Airplane icon on flight path */}
                <polygon
                  points="84,32 75,30 78,35"
                  fill="#0B7F8B"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-section font-semibold text-content-primary">
                No operational anomalies detected in this window
              </h3>
              <p className="text-body text-content-secondary mt-1">
                All inbound bookings across the past {days} days resolved without recurring thematic spikes or cluster anomalies.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDays(30)}
              >
                Expand Window to 30 Days
              </Button>
            </div>
          </div>
        ) : (
          /* Horizontal SVG / CSS Bar Chart */
          <div className="divide-y divide-border">
            {data.themes.map((theme, index) => {
              // Color coding by theme urgency
              const isEmergency = theme.theme.toLowerCase().includes("emergency") || theme.theme.toLowerCase().includes("urgent");
              const isCancellation = theme.theme.toLowerCase().includes("cancellation") || theme.theme.toLowerCase().includes("refund");
              const isUnclassified = theme.theme.toLowerCase().includes("unclassified");

              const barColor = isEmergency
                ? "bg-red-500"
                : isCancellation
                ? "bg-amber-500"
                : isUnclassified
                ? "bg-slate-400"
                : "bg-brand-600";

              return (
                <div
                  key={theme.theme}
                  onClick={() => setSelectedTheme(theme)}
                  className="p-5 hover:bg-surface-subtle transition-subtle cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedTheme(theme);
                    }
                  }}
                  aria-label={`Inspect theme ${theme.theme}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-surface-subtle text-content-secondary text-caption font-semibold flex items-center justify-center shrink-0 border border-border group-hover:border-brand-500 transition-subtle">
                        {index + 1}
                      </span>
                      <h3 className="text-table font-semibold text-content-primary group-hover:text-brand-700 transition-subtle">
                        {theme.theme}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-caption">
                      <span className="font-semibold text-content-primary font-mono-numbers">
                        {theme.count.toLocaleString()} cases
                      </span>
                      <span className="font-mono-numbers font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {theme.percentage}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-content-tertiary group-hover:text-brand-600 transition-subtle" />
                    </div>
                  </div>

                  {/* Pure CSS / SVG Percentage Bar */}
                  <div className="w-full bg-surface-subtle rounded-full h-2.5 overflow-hidden border border-border/80">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", barColor)}
                      style={{ width: `${Math.min(100, Math.max(3, theme.percentage))}%` }}
                    />
                  </div>

                  {/* Sample Ticket Pills Quick View */}
                  {theme.sample_ticket_ids && theme.sample_ticket_ids.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-caption text-content-secondary">
                      <span className="text-[11px] font-semibold text-content-tertiary uppercase tracking-wider shrink-0">
                        Sample cases:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {theme.sample_ticket_ids.slice(0, 5).map((tId) => (
                          <span
                            key={tId}
                            className="font-mono-numbers text-[11px] px-2 py-0.5 rounded bg-surface border border-border text-brand-700 hover:border-brand-400 transition-subtle"
                          >
                            {tId}
                          </span>
                        ))}
                        {theme.sample_ticket_ids.length > 5 && (
                          <span className="text-[11px] text-content-tertiary">
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
        )}
      </Card>

      {/* 5. SIDE DRAWER: THEME SAMPLE TICKETS & DETAILS */}
      <Drawer
        isOpen={Boolean(selectedTheme)}
        onClose={() => setSelectedTheme(null)}
        title={selectedTheme?.theme}
        subtitle={`${selectedTheme?.count.toLocaleString() || 0} cases (${selectedTheme?.percentage || 0}% of window volume)`}
        width="md"
      >
        {selectedTheme && (
          <div className="space-y-6 pt-2">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-subtle border border-border rounded-card text-table">
                <span className="text-caption text-content-secondary block">
                  Incident Count
                </span>
                <span className="text-xl font-semibold font-mono-numbers text-content-primary">
                  {selectedTheme.count}
                </span>
              </div>
              <div className="p-3 bg-surface-subtle border border-border rounded-card text-table">
                <span className="text-caption text-content-secondary block">
                  Volume Share
                </span>
                <span className="text-xl font-semibold font-mono-numbers text-brand-700">
                  {selectedTheme.percentage}%
                </span>
              </div>
            </div>

            {/* Verification Context */}
            <div className="p-3.5 bg-brand-50/50 border border-brand-200 rounded-card flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div className="text-caption text-content-secondary leading-relaxed">
                Deterministic classifier identified this cluster based on repeated agency inquiry patterns and PNR status signals across the {days}-day sample.
              </div>
            </div>

            {/* Clickable Sample Tickets */}
            <div>
              <h3 className="text-caption font-semibold text-content-primary uppercase tracking-wider mb-3">
                Sample Representative Cases
              </h3>
              <div className="space-y-2">
                {selectedTheme.sample_ticket_ids && selectedTheme.sample_ticket_ids.length > 0 ? (
                  selectedTheme.sample_ticket_ids.map((id) => (
                    <Link
                      key={id}
                      href={`/ticket/${id}`}
                      className="flex items-center justify-between p-3 rounded-input bg-surface border border-border hover:border-brand-400 hover:bg-brand-50/30 transition-subtle group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono-numbers font-semibold text-brand-700">
                          {id}
                        </span>
                        <span className="text-caption text-content-secondary">
                          View details & timeline
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-content-tertiary group-hover:text-brand-600 transition-subtle" />
                    </Link>
                  ))
                ) : (
                  <p className="text-caption text-content-tertiary italic">
                    No sample IDs linked for this theme.
                  </p>
                )}
              </div>
            </div>

            {/* Filter in Queue CTA */}
            <div className="pt-4 border-t border-border">
              <Link
                href={`/?intent=${encodeURIComponent(selectedTheme.theme)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-input text-table font-semibold transition-subtle shadow-sm"
              >
                <span>Filter Queue by this Theme</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
