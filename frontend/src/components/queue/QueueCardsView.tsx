"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plane, Calendar, Clock, UserPlus, ArrowUpCircle, Copy, ExternalLink, Link2 } from "lucide-react";
import { TicketSummary } from "@/lib/types";
import { SlaBadge, SlaRing, PriorityMark, StatusChip, Chip } from "@/components/ui";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { assignTicket, escalateTicket } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface QueueCardsViewProps {
  tickets: TicketSummary[];
  selectedTicketId?: string | null;
  onSelectTicket?: (ticketId: string) => void;
  onRefresh?: () => void;
}

export function QueueCardsView({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onRefresh,
}: QueueCardsViewProps) {
  const router = useRouter();
  const { currentUser } = useUser();
  const { showToast } = useToast();

  const handleAssignToMe = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await assignTicket(ticketId, currentUser.id, currentUser.id);
      showToast(`Assigned ticket ${ticketId} to you`, "success");
      onRefresh?.();
    } catch {
      showToast("Failed to assign ticket", "error");
    }
  };

  const handleEscalate = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await escalateTicket(ticketId, "Operational priority escalation from cards view", currentUser.id);
      showToast(`Escalated ticket ${ticketId}`, "warning");
      onRefresh?.();
    } catch {
      showToast("Failed to escalate ticket", "error");
    }
  };

  const handleCopyTboh = (tbohId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tbohId);
    showToast(`Copied ${tbohId} to clipboard`, "info");
  };

  const handleCardClick = (ticketId: string) => {
    if (onSelectTicket) {
      onSelectTicket(ticketId);
    } else {
      router.push(`/ticket/${ticketId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {tickets.map((t, idx) => {

        const checkInFormatted = new Date(t.check_in_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        const lcdFormatted = t.lcd_date
          ? new Date(t.lcd_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : null;

        const isClosedOrResolved =
          t.status === "Closed" || t.status === "Resolved" || t.sla.status === "STOPPED";

        const isSelected = selectedTicketId === t.id;

        const linkedList: string[] =
          (t as unknown as { linked_ticket_ids?: string[] }).linked_ticket_ids || [];

        return (
          <div
            key={t.id}
            onClick={() => handleCardClick(t.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                router.push(`/ticket/${t.id}`);
              } else if (e.key === " " && onSelectTicket) {
                e.preventDefault();
                onSelectTicket(t.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Boarding pass ticket ${t.id} - ${t.title}`}
            className={cn(
              "relative bg-surface border border-border rounded-card shadow-xs overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-200 select-none",
              "hover:rotate-[1.5deg] hover:scale-[1.01] hover:shadow-md",
              isSelected && "ring-2 ring-brand-500",
              isClosedOrResolved && "opacity-60"
            )}
          >
            {/* Top Pass Header: ID left, Check-in / LCD right */}
            <div className="p-4 border-b border-border/70 flex items-start justify-between gap-3 bg-surface-subtle/30">
              {/* ID left */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-brand-600 rotate-45 shrink-0" />
                  <span className="font-mono-numbers text-[14px] font-bold text-content-primary">
                    {t.id}
                  </span>
                  {linkedList.length > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-brand-700 font-mono-numbers bg-brand-50 border border-brand-200 px-1 rounded">
                      <Link2 className="w-2.5 h-2.5 text-brand-600" />
                      {linkedList.length}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono-numbers text-content-tertiary">
                  REF #{idx + 1} • {t.agency_id}
                </span>
              </div>

              {/* Check-in / LCD right */}
              <div className="flex flex-col items-end text-right font-mono-numbers">
                <span className="text-[11px] font-bold text-content-primary flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-content-tertiary" />
                  {checkInFormatted}
                </span>
                {lcdFormatted && (
                  <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-amber-600" />
                    LCD: {lcdFormatted}
                  </span>
                )}
              </div>
            </div>

            {/* Middle Section: Title, Chips, Assignee */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <p className="text-table font-semibold text-content-primary line-clamp-2 leading-snug">
                  {t.title}
                </p>
                {t.routing_reason && (
                  <p className="text-[11px] text-content-tertiary mt-1 line-clamp-1 italic">
                    Reason: {t.routing_reason}
                  </p>
                )}
              </div>

              {/* Status and Priority Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <div className="flex items-center gap-1">
                  <SlaRing status={t.sla.status} hoursRemaining={t.sla.hours_remaining} size={16} />
                  <SlaBadge sla={t.sla} size="sm" isEscalated={t.status === "Escalated"} />
                </div>
                <PriorityMark priority={t.priority} />
                <StatusChip status={t.status} />
                {t.intent && (
                  <Chip size="sm" variant="brand" className="text-[10px] h-5 truncate max-w-[140px]">
                    {t.intent}
                  </Chip>
                )}
              </div>
            </div>

            {/* Perforated Divider with Notch Cutouts */}
            <div className="relative w-full flex items-center justify-between bg-surface px-0 my-0">
              {/* Left Notch */}
              <div className="w-4 h-4 rounded-full bg-canvas border border-border -ml-2 shrink-0 z-10" />
              {/* Dashed perforation line */}
              <div className="flex-1 border-t-2 border-dashed border-border" />
              {/* Right Notch */}
              <div className="w-4 h-4 rounded-full bg-canvas border border-border -mr-2 shrink-0 z-10" />
            </div>

            {/* Bottom Stub: TBOH Barcode Mono + Quick Actions */}
            <div className="p-3 bg-surface-subtle/50 flex items-center justify-between gap-3 text-caption">
              {/* TBOH Barcode Mono */}
              <div className="flex flex-col font-mono-numbers">
                <span
                  className="tracking-widest text-[11px] font-bold text-content-primary scale-y-125 select-none"
                  aria-hidden="true"
                >
                  ||| | |||| | || |||
                </span>
                <span className="text-[10px] text-content-tertiary font-semibold uppercase mt-0.5">
                  {t.tboh_id}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1">
                {!t.assigned_to && (
                  <button
                    type="button"
                    onClick={(e) => handleAssignToMe(t.id, e)}
                    className="p-1.5 rounded-input bg-surface hover:bg-brand-50 text-brand-700 border border-border hover:border-brand-300 shadow-xs text-[11px] font-medium transition-colors"
                    title="Assign to me"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-brand-600" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => handleEscalate(t.id, e)}
                  className="p-1.5 rounded-input bg-surface hover:bg-amber-50 text-amber-700 border border-border hover:border-amber-300 shadow-xs text-[11px] font-medium transition-colors"
                  title="Escalate ticket"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5 text-amber-600" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCopyTboh(t.tboh_id, e)}
                  className="p-1.5 rounded-input bg-surface hover:bg-surface-subtle text-content-secondary border border-border shadow-xs text-[11px] font-medium transition-colors"
                  title="Copy TBOH"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/ticket/${t.id}`);
                  }}
                  className="p-1.5 rounded-input bg-brand-600 hover:bg-brand-700 text-white shadow-xs text-[11px] font-medium transition-colors"
                  title="Open ticket details"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
