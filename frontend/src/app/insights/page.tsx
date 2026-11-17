"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { fetchInsightsThemes } from "@/lib/api";
import { InsightsResponse, ThemeInsight } from "@/lib/types";
import { Card, ErrorState } from "@/components/ui";
import {
  InsightsHeader,
  InsightsKpiStrip,
  ThemesBarChart,
  ThemeDetailDrawer,
  InsightsEmptyState,
  InsightsUnauthorizedState,
} from "@/components/insights";

export default function InsightsPage() {
  const { currentUser, isLead, isEscalationManager } = useUser();

  const [data, setData] = useState<InsightsResponse | null>(null);
  const [days, setDays] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer state for inspecting theme sample tickets & root causes
  const [selectedTheme, setSelectedTheme] = useState<ThemeInsight | null>(null);

  const isAuthorized = isLead || isEscalationManager;

  const loadData = useCallback(async () => {
    if (!isAuthorized) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetchInsightsThemes(days, currentUser.id);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load operational insights";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [days, currentUser.id, isAuthorized]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // RBAC guard: Operations leadership only (Lead & Escalation Manager)
  if (!isAuthorized) {
    return <InsightsUnauthorizedState currentRole={currentUser.role} />;
  }

  const themes = data?.themes || [];
  const hasNoData = !loading && themes.length === 0;

  return (
    <div className="max-w-[1440px] mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* 1. Header with Range Control, Refresh, and Export CSV */}
      <InsightsHeader
        days={days}
        onDaysChange={setDays}
        onRefresh={loadData}
        loading={loading}
      />

      {/* Error state if API fails */}
      {error && (
        <ErrorState
          title="Operational Insights Unavailable"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* 2. KPI Strip: 4 KpiCards with 28px numbers */}
      <InsightsKpiStrip
        data={data}
        days={days}
        loading={loading}
      />

      {/* 3. Main Insights Content: Horizontal Bar Chart or Empty State */}
      {hasNoData ? (
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 border-b border-border bg-surface flex items-center justify-between">
            <div>
              <h2 className="text-section font-semibold text-content-primary">
                Recurring Themes by Affected Tickets
              </h2>
              <p className="text-caption text-content-secondary mt-0.5">
                Deterministic clustering across {days}-day sample
              </p>
            </div>
            <span className="text-caption text-content-tertiary font-mono-numbers">
              0 categories detected
            </span>
          </div>

          <InsightsEmptyState
            days={days}
            onExpandWindow={() => setDays(30)}
          />
        </Card>
      ) : (
        <ThemesBarChart
          themes={themes}
          totalTagged={data?.total_tagged_records || 0}
          days={days}
          loading={loading}
          onSelectTheme={setSelectedTheme}
        />
      )}

      {/* 4. Slide-Out Drawer: Detailed Theme Breakdown & Sample Tickets */}
      <ThemeDetailDrawer
        theme={selectedTheme}
        days={days}
        isOpen={Boolean(selectedTheme)}
        onClose={() => setSelectedTheme(null)}
      />
    </div>
  );
}
