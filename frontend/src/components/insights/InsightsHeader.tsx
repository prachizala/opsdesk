"use client";

import React, { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button, Tooltip } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { getExportUrl } from "@/lib/api";

export interface InsightsHeaderProps {
  days: number;
  onDaysChange: (days: number) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function InsightsHeader({
  days,
  onDaysChange,
  onRefresh,
  loading,
}: InsightsHeaderProps) {
  const { currentUser, isLead, isStaff } = useUser();
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const rangeOptions = [
    { label: "Last 7 days", value: 7 },
    { label: "14 days", value: 14 },
    { label: "30 days", value: 30 },
  ];

  const handleExportCsv = async () => {
    // Only lead or authorized staff can trigger export
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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-semibold text-content-primary tracking-tight">
          Operational Insights &amp; Recurring Themes
        </h1>
        <p className="text-body text-slate-500 mt-0.5">
          Real-time clustering of operational drivers, root causes, and systemic friction
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Range Selector: "Last 7 days", "14 days", "30 days" */}
        <div className="inline-flex items-center bg-surface border border-border rounded-input p-0.5 shadow-xs">
          <span className="text-[11px] font-semibold text-content-tertiary px-2.5 uppercase tracking-wider hidden xs:inline-block">
            Window:
          </span>
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onDaysChange(opt.value)}
              className={cn(
                "px-3 py-1 rounded-input text-caption font-medium transition-subtle cursor-pointer select-none",
                days === opt.value
                  ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200 shadow-xs"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-subtle"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Refresh Action */}
        <Tooltip content="Refresh analytics window">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh operational analytics"
            className="p-2 bg-surface border border-border text-content-secondary hover:text-content-primary rounded-input hover:bg-surface-subtle transition-subtle cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-brand-600")} />
          </button>
        </Tooltip>

        {/* Export CSV Button (secondary button with download icon, staff/lead only) */}
        <Tooltip
          content={
            isLead
              ? "Download uncapped CSV report of tickets and operational metrics"
              : isStaff
              ? "CSV export restricted to Team Lead role"
              : "Export requires operational staff access"
          }
        >
          <Button
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4 text-content-secondary" />}
            loading={isExporting}
            onClick={handleExportCsv}
            disabled={isExporting || !isLead}
            className="shadow-xs"
          >
            {isExporting ? "Preparing download..." : "Export CSV"}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
