"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Link2, HelpCircle, AlertTriangle } from "lucide-react";
import { TicketSummary } from "@/lib/types";
import {
  SlaBadge,
  PriorityChip,
  StatusChip,
  Chip,
  Avatar,
  Tooltip,
  TravelTimeline,
  TableRowSkeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export interface QueueTableProps {
  tickets: TicketSummary[];
  loading: boolean;
  page: number;
  pageSize: number;
  isStaff: boolean;
}

export function QueueTable({
  tickets,
  loading,
  page,
  pageSize,
  isStaff,
}: QueueTableProps) {
  const router = useRouter();

  if (loading && tickets.length === 0) {
    return (
      <div className="w-full overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-micro-label uppercase text-content-tertiary h-10">
              <th className="px-3 w-10 text-center">#</th>
              <th className="px-3 w-36">SLA Status</th>
              <th className="px-3">Ticket</th>
              <th className="px-3 w-28 hidden lg:table-cell">Agency</th>
              <th className="px-3 w-32 hidden md:table-cell">Intent</th>
              <th className="px-3 w-20">Priority</th>
              <th className="px-3 w-20">Status</th>
              <th className="px-3 w-36 min-[1440px]:w-56">Dates</th>
              <th className="px-3 w-28 hidden xl:table-cell">Assignee</th>
              {isStaff && <th className="px-3 w-16 text-right hidden min-[1280px]:table-cell">Score</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={isStaff ? 10 : 9} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left border-collapse table-fixed">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-border bg-surface-subtle text-micro-label uppercase text-content-tertiary sticky top-0 z-10 h-10 select-none">
            <th className="px-3 w-10 text-center font-medium">#</th>
            <th className="px-3 w-36 font-medium">SLA Status</th>
            <th className="px-3 font-medium">Ticket</th>
            <th className="px-3 w-28 hidden lg:table-cell font-medium">Agency</th>
            <th className="px-3 w-32 hidden md:table-cell font-medium">Intent</th>
            <th className="px-3 w-20 font-medium">Priority</th>
            <th className="px-3 w-20 font-medium">Status</th>
            <th className="px-3 w-36 min-[1440px]:w-56 font-medium">Dates</th>
            <th className="px-3 w-28 hidden xl:table-cell font-medium">Assignee</th>
            {isStaff && (
              <th className="px-3 w-16 text-right hidden min-[1280px]:table-cell font-medium">
                Score
              </th>
            )}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-border">
          {tickets.map((t, idx) => {
            const rank = page * pageSize + idx + 1;
            const now = Date.now();
            const checkInTime = new Date(t.check_in_date).getTime();
            const checkInDiffMs = checkInTime - now;
            const checkInDiffHours = checkInDiffMs / (3600 * 1000);

            // Rank #1 emergency row: check-in < 4h
            const isRank1Emergency =
              rank === 1 &&
              checkInDiffHours >= 0 &&
              checkInDiffHours < 4;

            // Closed or Stopped row emphasis
            const isClosedOrStopped =
              t.status === "Closed" ||
              t.status === "Resolved" ||
              t.sla.status === "STOPPED";

            // 4px left SLA color bar
            const slaBorderColor = {
              NORMAL: "border-l-emerald-500",
              AT_RISK: "border-l-amber-500",
              BREACHED: "border-l-red-600",
              STOPPED: "border-l-slate-300",
            }[t.sla.status] || "border-l-slate-300";

            // Date calculations
            const checkInHoursInt = Math.floor(checkInDiffHours);
            const checkInDays = Math.floor(checkInHoursInt / 24);
            const checkInRemHours = Math.abs(checkInHoursInt % 24);

            let checkInText = "";
            if (checkInDiffMs < 0) {
              checkInText = "Checked in";
            } else if (checkInDays > 0) {
              checkInText = `In ${checkInDays}d ${checkInRemHours}h`;
            } else if (checkInHoursInt > 0) {
              checkInText = `In ${checkInHoursInt}h`;
            } else {
              checkInText = "In < 1h";
            }

            const lcdDateFormatted = t.lcd_date
              ? `LCD ${new Date(t.lcd_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}`
              : null;

            // Controlling deadline logic
            const isCheckinControlling =
              t.intent === "Emergency Check-in Assist" ||
              !t.lcd_date ||
              (checkInDiffHours < 24 && checkInDiffHours >= 0);

            // Linked cases count
            const linkedCount =
              (t as unknown as { linked_ticket_ids?: string[] }).linked_ticket_ids?.length || 0;

            return (
              <tr
                key={t.id}
                onClick={() => router.push(`/ticket/${t.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/ticket/${t.id}`);
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const nextRow = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (nextRow) nextRow.focus();
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prevRow = e.currentTarget.previousElementSibling as HTMLElement | null;
                    if (prevRow) prevRow.focus();
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label={`View ticket ${t.id} - ${t.title}`}
                className={cn(
                  "h-[56px] hover:bg-surface-subtle transition-subtle cursor-pointer border-l-4 group select-none focus:outline-none focus:bg-surface-subtle",
                  slaBorderColor,
                  isClosedOrStopped && "opacity-60 text-content-tertiary"
                )}
              >
                {/* 1. Gutter Rank # */}
                <td className="px-3 text-center text-caption font-mono-numbers text-content-tertiary">
                  <div className="flex items-center justify-center gap-1">
                    <span>{rank}</span>
                    {/* Why here? hover pill for internal staff */}
                    {isStaff && t.routing_reason && (
                      <Tooltip
                        position="right"
                        content={
                          <div className="max-w-xs text-left p-1 whitespace-normal">
                            <span className="font-semibold text-brand-300 block text-[11px] mb-0.5">
                              Why here?
                            </span>
                            <span className="text-[11px] text-white leading-tight">
                              {t.routing_reason}
                            </span>
                          </div>
                        }
                      >
                        <span
                          className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity text-[10px] text-brand-600 hover:text-brand-700 cursor-help"
                          onClick={(e) => e.stopPropagation()}
                          title="Routing explanation"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </td>

                {/* 2. SLA Status (one-line badge + ring) */}
                <td className="px-3">
                  <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                    <SlaBadge
                      sla={t.sla}
                      size="sm"
                      showRing
                      isEscalated={t.status === "Escalated"}
                      className="shrink-0"
                    />
                    {isRank1Emergency && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded leading-none shrink-0 animate-pulse">
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                        Check-in &lt; 4h
                      </span>
                    )}
                  </div>
                </td>

                {/* 3. Ticket Details */}
                <td className="px-3 min-w-0">
                  <div className="flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono-numbers text-[13px] font-semibold text-content-primary group-hover:text-brand-600 transition-subtle shrink-0">
                        {t.id}
                      </span>
                      <span className="font-mono-numbers text-[11px] text-content-tertiary truncate">
                        {t.tboh_id}
                      </span>
                      {linkedCount > 0 && (
                        <span
                          className="inline-flex items-center gap-0.5 text-[11px] text-brand-700 font-mono-numbers bg-brand-50 border border-brand-200 px-1 py-0.2 rounded shrink-0"
                          title={`${linkedCount} linked tickets`}
                        >
                          <Link2 className="w-3 h-3 text-brand-600" />
                          <span>{linkedCount}</span>
                        </span>
                      )}
                    </div>
                    <span
                      className="text-table text-content-secondary truncate block font-normal"
                      title={t.title}
                    >
                      {t.title}
                    </span>
                  </div>
                </td>

                {/* 4. Agency */}
                <td className="px-3 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar name={t.agency_id} id={t.agency_id} size="sm" />
                    <span className="text-table font-medium text-content-secondary truncate">
                      {t.agency_id}
                    </span>
                  </div>
                </td>

                {/* 5. Intent */}
                <td className="px-3 hidden md:table-cell">
                  <Chip size="sm" variant="brand" className="truncate max-w-[120px]">
                    {t.intent || "General"}
                  </Chip>
                </td>

                {/* 6. Priority */}
                <td className="px-3">
                  <PriorityChip priority={t.priority} />
                </td>

                {/* 7. Status */}
                <td className="px-3">
                  <StatusChip status={t.status} />
                </td>

                {/* 8. Compact Dates Cell */}
                <td className="px-3">
                  <div className="flex flex-col justify-center text-[11px] font-mono-numbers leading-tight min-w-0">
                    <span
                      className={cn(
                        "truncate",
                        isCheckinControlling
                          ? "font-semibold text-content-primary"
                          : "text-content-secondary"
                      )}
                    >
                      {checkInText}
                    </span>
                    {lcdDateFormatted && (
                      <span
                        className={cn(
                          "truncate text-[10px]",
                          !isCheckinControlling
                            ? "font-semibold text-content-primary"
                            : "text-content-tertiary"
                        )}
                      >
                        {lcdDateFormatted}
                      </span>
                    )}

                    {/* Compact TravelTimeline strip on >= 1440px */}
                    <div className="hidden min-[1440px]:block mt-0.5">
                      <TravelTimeline
                        variant="compact"
                        checkIn={t.check_in_date}
                        lcd={t.lcd_date}
                        createdAt={t.created_at}
                        controllingDeadline={isCheckinControlling ? "CHECK_IN" : "LCD"}
                      />
                    </div>
                  </div>
                </td>

                {/* 9. Assignee */}
                <td className="px-3 hidden xl:table-cell">
                  {t.assigned_to ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Avatar name={t.assigned_to} id={t.assigned_to} size="sm" />
                      <span className="text-table font-medium text-content-secondary truncate">
                        {t.assigned_to}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-input text-[11px] text-content-disabled border border-dashed border-border whitespace-nowrap">
                      Unassigned
                    </span>
                  )}
                </td>

                {/* 10. Score (Staff Only) */}
                {isStaff && (
                  <td className="px-3 text-right hidden min-[1280px]:table-cell">
                    {t.queue_score !== null && t.queue_score !== undefined ? (
                      <div className="flex items-center justify-end gap-1.5 font-mono-numbers text-caption">
                        <span className="font-semibold text-content-primary">
                          {t.queue_score}
                        </span>
                        <div className="w-6 h-1 bg-surface-subtle rounded-full overflow-hidden shrink-0 border border-border/60">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (t.queue_score / 150) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-content-disabled text-caption font-mono-numbers">
                        —
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
