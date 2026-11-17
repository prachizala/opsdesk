"use client";

import React from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui";

export interface QueueHeaderProps {
  totalCount: number;
  isStaff: boolean;
  isExporting: boolean;
  onExport: () => void;
  onCreateOpen: () => void;
}

export function QueueHeader({
  totalCount,
  isStaff,
  isExporting,
  onExport,
  onCreateOpen,
}: QueueHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-page font-semibold text-content-primary tracking-tight">
            Operations Queue
          </h1>
          <span className="font-mono-numbers text-caption px-2.5 py-0.5 rounded-full bg-surface-subtle border border-border text-content-secondary font-medium shrink-0">
            {totalCount.toLocaleString()} cases
          </span>
        </div>
        <p className="text-caption text-content-tertiary mt-1 truncate">
          Real-time travel dispatching with LCD-aware SLA countdowns and tenant isolation.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {isStaff && (
          <Button
            variant="secondary"
            size="md"
            loading={isExporting}
            icon={<Download className="w-4 h-4 text-content-secondary" />}
            onClick={onExport}
          >
            Export CSV
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={onCreateOpen}
        >
          New ticket
        </Button>
      </div>
    </div>
  );
}
