"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Link2, Calendar, Clock, AlertTriangle } from "lucide-react";
import { TicketSummary } from "@/lib/types";
import { SlaBadge, PriorityChip, StatusChip, Chip, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface MobileTicketCardProps {
  ticket: TicketSummary;
  rank: number;
}

export function MobileTicketCard({ ticket, rank }: MobileTicketCardProps) {
  const router = useRouter();

  const now = Date.now();
  const checkInTime = new Date(ticket.check_in_date).getTime();
  const checkInDiffMs = checkInTime - now;
  const checkInDiffHours = checkInDiffMs / (3600 * 1000);

  const isRank1Emergency = rank === 1 && checkInDiffHours >= 0 && checkInDiffHours < 4;

  const isClosedOrStopped =
    ticket.status === "Closed" ||
    ticket.status === "Resolved" ||
    ticket.sla.status === "STOPPED";

  const slaBorderColor = {
    NORMAL: "border-l-emerald-500",
    AT_RISK: "border-l-amber-500",
    BREACHED: "border-l-red-600",
    STOPPED: "border-l-slate-300",
  }[ticket.sla.status] || "border-l-slate-300";

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

  const linkedCount =
    (ticket as unknown as { linked_ticket_ids?: string[] }).linked_ticket_ids?.length || 0;

  return (
    <div
      onClick={() => router.push(`/ticket/${ticket.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/ticket/${ticket.id}`);
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`View ticket ${ticket.id} - ${ticket.title}`}
      className={cn(
        "p-4 hover:bg-surface-subtle transition-subtle cursor-pointer flex flex-col gap-2.5 border-l-4 focus:outline-none focus:bg-surface-subtle",
        slaBorderColor,
        isClosedOrStopped && "opacity-60 text-content-tertiary"
      )}
    >
      {/* Top row: ID + TBOH + SLA Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono-numbers text-caption font-semibold text-content-primary">
            #{rank} {ticket.id}
          </span>
          <span className="font-mono-numbers text-[11px] text-content-tertiary truncate">
            {ticket.tboh_id}
          </span>
          {linkedCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-brand-700 bg-brand-50 border border-brand-200 px-1 rounded shrink-0">
              <Link2 className="w-2.5 h-2.5 text-brand-600" />
              <span>{linkedCount}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isRank1Emergency && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded leading-none shrink-0 animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
              &lt; 4h
            </span>
          )}
          <SlaBadge sla={ticket.sla} size="sm" showRing isEscalated={ticket.status === "Escalated"} />
        </div>
      </div>

      {/* Middle: Title */}
      <p className="text-table text-content-primary font-medium line-clamp-2">
        {ticket.title}
      </p>

      {/* Chips row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <PriorityChip priority={ticket.priority} />
        <StatusChip status={ticket.status} />
        {ticket.intent && (
          <Chip size="sm" variant="brand">
            {ticket.intent}
          </Chip>
        )}
      </div>

      {/* Bottom row: Deadlines and Assignee */}
      <div className="flex items-center justify-between text-caption text-content-secondary pt-2 border-t border-border/60">
        <div className="flex items-center gap-2 font-mono-numbers text-[11px]">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 text-content-tertiary" />
            {checkInText}
          </span>
          {ticket.lcd_date && (
            <span className="inline-flex items-center gap-1 text-content-tertiary">
              <Clock className="w-3 h-3" />
              LCD {new Date(ticket.lcd_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          {ticket.assigned_to ? (
            <div className="flex items-center gap-1">
              <Avatar name={ticket.assigned_to} id={ticket.assigned_to} size="sm" />
              <span className="truncate max-w-[90px]">{ticket.assigned_to}</span>
            </div>
          ) : (
            <span className="text-content-disabled italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
