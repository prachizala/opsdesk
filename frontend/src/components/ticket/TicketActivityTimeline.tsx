"use client";

import React, { useMemo } from "react";
import { TicketDetail } from "@/lib/types";
import { Tooltip } from "@/components/ui";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export interface ActivityEvent {
  id: string;
  type: "created" | "public_reply" | "internal_note" | "supplier_thread" | "assigned" | "escalated" | "status" | "bug_linked";
  actor: string;
  timestamp: string;
  summary: string;
  dotColor: string; // Tailwind class
}

export interface TicketActivityTimelineProps {
  ticket: TicketDetail;
}

export function TicketActivityTimeline({ ticket }: TicketActivityTimelineProps) {
  // Synthesize and sort chronologically (most recent first)
  const events = useMemo((): ActivityEvent[] => {
    const list: ActivityEvent[] = [];

    // 1. Ticket Creation
    list.push({
      id: "ev-create",
      type: "created",
      actor: ticket.agency_id || "Agency",
      timestamp: ticket.created_at,
      summary: `Ticket created for booking ${ticket.tboh_id} (${ticket.priority} priority)`,
      dotColor: "bg-blue-500",
    });

    // 2. Messages
    (ticket.messages || []).forEach((msg) => {
      const isInternal = msg.message_type === "InternalNote";
      const snippet = msg.content.length > 80 ? `${msg.content.slice(0, 80)}…` : msg.content;
      list.push({
        id: `ev-msg-${msg.id}`,
        type: isInternal ? "internal_note" : "public_reply",
        actor: msg.sender_name || (isInternal ? "Staff Member" : "Agency Agent"),
        timestamp: msg.created_at,
        summary: isInternal
          ? `Recorded internal staff note: "${snippet}"`
          : `Dispatched public reply to agency: "${snippet}"`,
        dotColor: isInternal ? "bg-amber-500" : "bg-blue-600",
      });
    });

    // 3. Supplier Threads
    (ticket.side_conversations || []).forEach((sc) => {
      list.push({
        id: `ev-sc-${sc.id}`,
        type: "supplier_thread",
        actor: sc.created_by || "Operations Agent",
        timestamp: sc.created_at,
        summary: `Initiated supplier thread with ${sc.supplier_name} ("${sc.subject}")`,
        dotColor: "bg-teal-500",
      });
    });

    // 4. Assignment
    if (ticket.assigned_to) {
      list.push({
        id: "ev-assign",
        type: "assigned",
        actor: ticket.assigned_to,
        timestamp: ticket.updated_at || ticket.created_at,
        summary: `Case claimed and assigned to ${ticket.assigned_to}`,
        dotColor: "bg-emerald-500",
      });
    }

    // 5. Escalation
    if (ticket.status === "Escalated") {
      list.push({
        id: "ev-escalate",
        type: "escalated",
        actor: "Operations Lead",
        timestamp: ticket.updated_at || ticket.created_at,
        summary: "Case escalated to Global Escalation Manager queue",
        dotColor: "bg-purple-600",
      });
    }

    // 6. Bug Link
    if (ticket.suggested_bug_link) {
      list.push({
        id: "ev-bug",
        type: "bug_linked",
        actor: "Product Engineering",
        timestamp: ticket.updated_at || ticket.created_at,
        summary: `Associated product defect link: ${ticket.suggested_bug_link}`,
        dotColor: "bg-rose-500",
      });
    }

    // Sort descending by time
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [ticket]);

  // Group events by day label
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: ActivityEvent[] } = {};
    const now = new Date();

    events.forEach((ev) => {
      const d = new Date(ev.timestamp);
      let dayLabel = "Earlier";

      if (!isNaN(d.getTime())) {
        const isToday =
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear();

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday =
          d.getDate() === yesterday.getDate() &&
          d.getMonth() === yesterday.getMonth() &&
          d.getFullYear() === yesterday.getFullYear();

        if (isToday) {
          dayLabel = "Today";
        } else if (isYesterday) {
          dayLabel = "Yesterday";
        } else {
          dayLabel = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
      }

      if (!groups[dayLabel]) groups[dayLabel] = [];
      groups[dayLabel].push(ev);
    });

    return groups;
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border text-caption font-semibold text-content-primary">
        <Clock className="w-4 h-4 text-brand-600" />
        <span>Chronological Case Audit Log</span>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([dayLabel, dayEvents]) => (
          <div key={dayLabel} className="space-y-3">
            {/* Day Header Badge */}
            <div className="sticky top-0 z-10">
              <span className="text-[11px] font-semibold text-content-tertiary uppercase tracking-wider bg-surface px-2 py-0.5 rounded border border-border">
                {dayLabel}
              </span>
            </div>

            {/* Vertical Line with 10px Coloured Dots */}
            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2.5">
              {dayEvents.map((ev) => (
                <div key={ev.id} className="relative group">
                  {/* 10px Coloured Dot */}
                  <div
                    className={cn(
                      "absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface transition-transform group-hover:scale-125",
                      ev.dotColor
                    )}
                  />

                  {/* Event Details */}
                  <div className="text-table">
                    <div className="flex items-center gap-2 text-caption">
                      <span className="font-semibold text-content-primary">
                        {ev.actor}
                      </span>
                      <Tooltip content={formatDate(ev.timestamp)}>
                        <span className="text-content-tertiary text-[11px] cursor-default">
                          {formatRelativeTime(ev.timestamp)}
                        </span>
                      </Tooltip>
                    </div>
                    <p className="text-content-secondary mt-0.5 text-caption leading-relaxed">
                      {ev.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
