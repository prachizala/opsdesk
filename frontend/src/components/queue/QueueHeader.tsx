"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Download, Play } from "lucide-react";
import { PageHeadline, Button } from "@/components/ui";

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
      {/* Eyebrow label + two-tone H1 "Operations Queue", count chip, one-line subtitle */}
      <PageHeadline
        eyebrow="LIVE OPERATIONS"
        primaryTitle="Operations"
        emphasisWord="Queue"
        badge={
          <span className="font-mono-numbers text-caption px-2.5 py-0.5 rounded-full bg-surface-subtle border border-border text-content-secondary font-medium shrink-0">
            {totalCount.toLocaleString()} cases
          </span>
        }
        subtitle="Real-time travel dispatching with LCD-aware SLA countdowns and tenant isolation."
      />

      <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
        {/* "Work next" button (opens first ticket in queue) */}
        <Button
          variant="secondary"
          size="md"
          disabled={!firstTicketId}
          onClick={handleWorkNext}
          icon={<Play className="w-3.5 h-3.5 fill-current text-brand-600" />}
          className="font-medium hover:border-brand-500"
          title={firstTicketId ? `Work next case: ${firstTicketId}` : "No cases in queue"}
        >
          Work next
        </Button>

        {/* Secondary "Export CSV" (staff only) */}
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

        {/* Primary "New ticket" (navy pill with arrow) */}
        <Button
          variant="primary"
          size="md"
          onClick={onCreateOpen}
          showSignatureArrow={true}
        >
          New ticket
        </Button>
      </div>
    </div>
  );
}
