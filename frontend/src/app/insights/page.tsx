"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { fetchInsightsThemes, fetchTickets } from "@/lib/api";
import { InsightsResponse, ThemeInsight } from "@/lib/types";
import { Card, ErrorState, SlaCounts } from "@/components/ui";
import {
  InsightsHeader,
  InsightsKpiStrip,
  ThemesBarChart,
  ThemeDetailDrawer,
  InsightsEmptyState,
  InsightsUnauthorizedState,
} from "@/components/insights";

export default function InsightsPage() {
  const router = useRouter();
  const { currentUser, isLead, isEscalationManager } = useUser();

  const [data, setData] = useState<InsightsResponse | null>(null);
  const [slaCounts, setSlaCounts] = useState<SlaCounts | undefined>(undefined);
  const [totalTickets, setTotalTickets] = useState<number>(0);
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
      // Parallel fetch: real insights clustering + real fleet SLA tickets
      const [insightsRes, ticketsRes] = await Promise.all([
        fetchInsightsThemes(days, currentUser.id),
        fetchTickets("triage", 100, 0, currentUser.id).catch(() => null),
      ]);

      setData(insightsRes);

      if (ticketsRes && ticketsRes.tickets) {
        const counts: SlaCounts = {
          onTrack: ticketsRes.tickets.filter((t) => t.sla?.status === "NORMAL").length,
          atRisk: ticketsRes.tickets.filter((t) => t.sla?.status === "AT_RISK").length,
          breached: ticketsRes.tickets.filter((t) => t.sla?.status === "BREACHED").length,
          escalated: ticketsRes.tickets.filter((t) => t.status === "Escalated").length,
        };
        setSlaCounts(counts);
        setTotalTickets(ticketsRes.total || ticketsRes.tickets.length);
      }
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

  const handleFilterStatus = (status: "NORMAL" | "AT_RISK" | "BREACHED" | "ESCALATED" | "ALL") => {
    if (status === "ALL") {
      router.push("/");
    } else if (status === "ESCALATED") {
      router.push("/?status=Escalated");
    } else {
      router.push(`/?statusFilter=${status}`);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* 1. Header with Range Control, Refresh, and Export CSV */}
      <InsightsHeader
        days={days}
        onDaysChange={setDays}
        onRefresh={loadData}
        loading={loading}
      />

      {/* Error state with retry button */}
      {error && (
        <ErrorState
          title="Operational insights unavailable"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* 2. Fleet SLA HealthBar & 4 KPI cards with SpotlightGlow and CountUp */}
      <InsightsKpiStrip
        data={data}
        slaCounts={slaCounts}
        totalTicketsCount={totalTickets}
        days={days}
        loading={loading}
        onFilterStatus={handleFilterStatus}
      />

      {/* 3. Top Themes: Horizontal Bar Chart sorted descending or Empty State */}
      {hasNoData ? (
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 border-b border-border bg-surface flex items-center justify-between">
            <div>
              <h2 className="text-section font-semibold text-content-primary">
                Top themes
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
