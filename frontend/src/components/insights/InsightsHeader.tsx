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
  const { currentUser, isStaff } = useUser();
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const rangeOptions = [
    { label: "This week", value: 7 },
    { label: "14d", value: 14 },
    { label: "30d", value: 30 },
  ];

  const handleExportCsv = async () => {
    if (!isStaff) {
      showToast(
        "CSV export is restricted to operational staff members",
        "warning"
      );
      return;
    }

    setIsExporting(true);
    showToast("Preparing download...", "info");

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

      showToast("Report CSV downloaded successfully", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      showToast(`Unable to export report: ${msg}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-content-primary tracking-tight">
            Operational insights
          </h1>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-chip bg-brand-50 text-brand-700 border border-brand-200">
            {days === 7 ? "This week" : `Last ${days} days`}
          </span>
        </div>
        <p className="text-body text-slate-500 mt-1">
          Clustering of operational drivers, systemic friction, and supplier root causes
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Range Selector: "This week" / "14d" / "30d" */}
        <div
          role="radiogroup"
          aria-label="Reporting time window"
          className="inline-flex items-center bg-surface border border-border rounded-input p-1 shadow-xs"
        >
          {rangeOptions.map((opt) => {
            const isSelected = days === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onDaysChange(opt.value)}
                className={cn(
                  "min-h-[36px] sm:min-h-[32px] px-3 py-1 rounded-input text-caption font-medium transition-subtle cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  isSelected
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200 shadow-xs"
                    : "text-content-secondary hover:text-content-primary hover:bg-surface-subtle"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Refresh Action */}
        <Tooltip content="Refresh operational analytics">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh operational analytics"
            className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] p-2 bg-surface border border-border text-content-secondary hover:text-content-primary rounded-input hover:bg-surface-subtle transition-subtle cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-brand-600")} />
          </button>
        </Tooltip>

        {/* Export CSV Button (staff only, shows "Preparing download..." and toast) */}
        <Tooltip
          content={
            isStaff
              ? "Download uncapped CSV report of operational metrics"
              : "Export requires operational staff access"
          }
        >
          <Button
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4 text-content-secondary" />}
            loading={isExporting}
            onClick={handleExportCsv}
            disabled={isExporting || !isStaff}
            className="min-h-[44px] sm:min-h-[36px] shadow-xs focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {isExporting ? "Preparing download..." : "Export CSV"}
          </Button>
        </Tooltip>
      </div>
    </header>
  );
}
