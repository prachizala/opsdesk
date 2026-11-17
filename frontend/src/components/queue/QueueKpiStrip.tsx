"use client";

import React, { useMemo } from "react";
import { Inbox, Clock, AlertTriangle, UserX } from "lucide-react";
import { KpiCard } from "@/components/ui";
import { TicketSummary } from "@/lib/types";

export interface QueueKpiStripProps {
  tickets: TicketSummary[];
}

export function QueueKpiStrip({ tickets }: QueueKpiStripProps) {
  const kpis = useMemo(() => {
    const totalLoaded = tickets.length;
    const openCount = tickets.filter(
      (t) => t.status !== "Closed" && t.status !== "Resolved"
    ).length;
    const atRiskCount = tickets.filter((t) => t.sla.status === "AT_RISK").length;
    const breachedCount = tickets.filter((t) => t.sla.status === "BREACHED").length;
    const unassignedCount = tickets.filter((t) => !t.assigned_to).length;

    return {
      openCount,
      atRiskCount,
      breachedCount,
      unassignedCount,
      totalLoaded,
    };
  }, [tickets]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Open Cases"
        value={kpis.openCount}
        icon={<Inbox className="w-4 h-4 text-brand-600" />}
        subtext="Active in current view"
      />
      <KpiCard
        label="At Risk"
        value={kpis.atRiskCount}
        icon={<Clock className="w-4 h-4 text-amber-600" />}
        subtext="SLA approaching deadline"
      />
      <KpiCard
        label="Breached"
        value={kpis.breachedCount}
        icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
        subtext="Immediate action needed"
      />
      <KpiCard
        label="Unassigned"
        value={kpis.unassignedCount}
        icon={<UserX className="w-4 h-4 text-slate-500" />}
        subtext="Pending agent triage"
      />
    </div>
  );
}
