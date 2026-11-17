"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Play } from "lucide-react";
import { Button } from "@/components/ui";

export interface QueueHeaderProps {
  totalCount: number;
  firstTicketId?: string | null;
  isStaff: boolean;
  isExporting: boolean;
  onExport: () => void;
  onCreateOpen: () => void;
}

export function QueueHeader({
  totalCount,
  firstTicketId,
  isStaff,
  isExporting,
  onExport,
  onCreateOpen,
}: QueueHeaderProps) {
  const router = useRouter();

  const handleWorkNext = () => {
    if (firstTicketId) {
      router.push(`/ticket/${firstTicketId}`);
    }
  };

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

      <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
        {/* Prominent "Work next" button */}
        <Button
          variant="primary"
          size="md"
          disabled={!firstTicketId}
          onClick={handleWorkNext}
          icon={<Play className="w-3.5 h-3.5 fill-current" />}
          className="bg-brand-600 hover:bg-brand-700 text-white shadow-xs font-semibold ring-1 ring-brand-700/20"
          title={firstTicketId ? `Work next case: ${firstTicketId}` : "No cases in queue"}
        >
          Work next
        </Button>

        {/* Export CSV (staff only) */}
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

        {/* Primary "New ticket" */}
        <Button
          variant="secondary"
          size="md"
          icon={<Plus className="w-4 h-4 text-content-primary" />}
          onClick={onCreateOpen}
          className="border-border-strong hover:bg-surface-subtle"
        >
          New ticket
        </Button>
      </div>
    </div>
  );
}
