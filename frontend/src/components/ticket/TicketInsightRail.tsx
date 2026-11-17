"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TicketDetail } from "@/lib/types";
import { Card, CardHeader, StatusChip } from "@/components/ui";
import {
  Sparkles,
  Bug,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TicketInsightRailProps {
  ticket: TicketDetail;
  onOpenBugModal: () => void;
}

export function TicketInsightRail({ ticket, onOpenBugModal }: TicketInsightRailProps) {
  // Live countdown state for resolution SLA
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    ticket.sla.hours_remaining !== null && ticket.sla.hours_remaining !== undefined
      ? Math.round(ticket.sla.hours_remaining * 3600)
      : null
  );

  useEffect(() => {
    if (ticket.sla.hours_remaining !== null && ticket.sla.hours_remaining !== undefined) {
      setSecondsRemaining(Math.round(ticket.sla.hours_remaining * 3600));
    }
  }, [ticket.sla.hours_remaining]);

  useEffect(() => {
    if (secondsRemaining === null || ticket.sla.status === "STOPPED" || ticket.status === "Closed") {
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, ticket.sla.status, ticket.status]);

  const formatCountdown = (secs: number | null): string => {
    if (secs === null) return "Paused / Stopped";
    if (secs <= 0) return "SLA Breached";
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) return `${hours}h ${mins}m ${s}s`;
    return `${mins}m ${s}s`;
  };

  // Resolution SLA progress percentage
  const resolutionRatio = Math.max(
    0,
    Math.min(
      100,
      ticket.sla.hours_remaining !== null && ticket.sla.hours_remaining !== undefined
        ? Math.round((1 - Math.max(0, ticket.sla.hours_remaining) / 24) * 100)
        : 65
    )
  );

  const totalScore = ticket.queue_score ?? 85;

  return (
    <div className="space-y-6">
      {/* 1. SLA Performance Card */}
      <Card padding="md">
        <CardHeader
          title="SLA Performance"
          subtitle="Dual target tracking & countdown"
          action={
            <span
              className={cn(
                "text-[11px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                ticket.sla.status === "BREACHED"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : ticket.sla.status === "AT_RISK"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              )}
            >
              {ticket.sla.status.replace("_", " ")}
            </span>
          }
        />

        {/* Highlighted Controlling Constraint */}
        <div className="mb-4 p-2 bg-surface-subtle border border-border rounded-input flex items-center justify-between text-caption">
          <span className="font-medium text-content-secondary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            Controlling:
          </span>
          <span className="font-semibold text-content-primary">
            Controlled by check-in / LCD
          </span>
        </div>

        <div className="space-y-4">
          {/* Resolution SLA Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-caption mb-1.5">
              <span className="font-semibold text-content-primary">
                Resolution Target
              </span>
              <span className="font-mono-numbers text-[12px] font-medium text-content-secondary">
                {formatCountdown(secondsRemaining)}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-border">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  ticket.sla.status === "BREACHED"
                    ? "bg-red-500 w-full"
                    : ticket.sla.status === "AT_RISK"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                )}
                style={{
                  width: ticket.sla.status === "BREACHED" ? "100%" : `${Math.max(15, resolutionRatio)}%`,
                }}
              />
            </div>
          </div>

          {/* First Response SLA Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-caption mb-1.5">
              <span className="font-semibold text-content-primary">
                First Response SLA
              </span>
              <span className="font-mono-numbers text-[12px] font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Met (14m)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-border">
              <div className="h-full bg-emerald-500 rounded-full w-1/4" />
            </div>
          </div>
        </div>
      </Card>

      {/* 2. "Why it's here": Routing Reason Intelligence Card */}
      <Card padding="md" className="bg-gradient-to-br from-brand-50/40 via-surface to-surface border-brand-200">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-card bg-brand-100/70 text-brand-700 mt-0.5 shrink-0">
            <Sparkles className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h3 className="text-caption font-semibold text-brand-900 uppercase tracking-wider">
              Why It&apos;s Here
            </h3>
            <p className="text-caption text-content-secondary mt-1 leading-relaxed">
              {ticket.routing_reason ||
                "Auto-routed to active queue based on check-in arrival threshold (<24h) and high VIP agency impact weighting."}
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Linked Cases Card (TBOH linkage) */}
      <Card padding="md">
        <CardHeader
          title="Linked Cases"
          subtitle={`Earlier tickets sharing TBOH ${ticket.tboh_id}`}
        />
        {ticket.linked_ticket_ids && ticket.linked_ticket_ids.length > 0 ? (
          <div className="space-y-2">
            {ticket.linked_ticket_ids.map((id) => (
              <Link
                key={id}
                href={`/ticket/${id}`}
                className="flex items-center justify-between p-2.5 rounded-input bg-surface-subtle hover:bg-brand-50/80 border border-border hover:border-brand-300 text-table font-mono-numbers font-medium text-brand-700 transition-subtle group"
              >
                <div className="flex items-center gap-2">
                  <span>{id}</span>
                  <StatusChip status="Resolved" className="scale-90 origin-left" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-content-tertiary group-hover:text-brand-600 group-hover:translate-x-0.5 transition-subtle" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-caption text-content-tertiary italic">
            No prior tickets recorded for this booking reference.
          </p>
        )}
      </Card>

      {/* 4. Queue Score Breakdown Card */}
      <Card padding="md">
        <CardHeader
          title="Queue Score Breakdown"
          subtitle="Dynamic prioritization formula"
        />
        <div className="space-y-2.5 text-table">
          <div className="flex items-center justify-between py-1 text-content-secondary border-b border-border">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-content-tertiary" />
              Base Urgency Weight
            </span>
            <span className="font-mono-numbers font-semibold text-content-primary">
              40 pts
            </span>
          </div>
          <div className="flex items-center justify-between py-1 text-content-secondary border-b border-border">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-content-tertiary" />
              Check-in Proximity
            </span>
            <span className="font-mono-numbers font-semibold text-content-primary">
              30 pts
            </span>
          </div>
          <div className="flex items-center justify-between py-1 text-content-secondary border-b border-border">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-content-tertiary" />
              Agency Value Tier
            </span>
            <span className="font-mono-numbers font-semibold text-content-primary">
              15 pts
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5 font-semibold text-content-primary">
            <span>Total Queue Score</span>
            <span className="font-mono-numbers text-base font-bold text-brand-700">
              {totalScore} / 100
            </span>
          </div>

          {/* Mini Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-border mt-1">
            <div
              className="h-full bg-brand-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, totalScore)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* 5. Product Defect Link Card */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-caption font-semibold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
            <Bug className="w-3.5 h-3.5 text-brand-600" />
            Product Defect
          </span>
          <button
            type="button"
            onClick={onOpenBugModal}
            className="text-caption text-brand-600 hover:text-brand-700 font-semibold cursor-pointer transition-subtle"
          >
            {ticket.suggested_bug_link ? "Edit Defect" : "Attach Defect"}
          </button>
        </div>

        {ticket.suggested_bug_link ? (
          <a
            href={ticket.suggested_bug_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between gap-2 text-caption font-mono-numbers text-brand-700 hover:underline break-all bg-brand-50 p-2.5 rounded-input border border-brand-200 w-full transition-subtle group"
          >
            <span className="truncate">{ticket.suggested_bug_link}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-brand-600 group-hover:translate-x-0.5 transition-subtle" />
          </a>
        ) : (
          <div className="text-caption text-content-tertiary italic p-2 bg-surface-subtle rounded-input border border-dashed border-border text-center">
            No engineering bug or defect linked.
          </div>
        )}
      </Card>
    </div>
  );
}
