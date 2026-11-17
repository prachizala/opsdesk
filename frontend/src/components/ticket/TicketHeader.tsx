"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { TicketDetail } from "@/lib/types";
import {
  StatusChip,
  PriorityChip,
  SlaBadge,
  SlaRing,
  Button,
  Tooltip,
} from "@/components/ui";
import {
  ArrowLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Shuffle,
  ShieldAlert,
} from "lucide-react";

export interface TicketHeaderProps {
  ticket: TicketDetail;
  isStaff: boolean;
  isLead: boolean;
  currentUserId: string;
  onClaim: () => Promise<void>;
  onUnassign: () => Promise<void>;
  onStatusChange: (status: string) => Promise<void>;
  onOpenEscalate: () => void;
  onOpenTransfer: () => void;
}

export function TicketHeader({
  ticket,
  isStaff,
  isLead,
  currentUserId,
  onClaim,
  onUnassign,
  onStatusChange,
  onOpenEscalate,
  onOpenTransfer,
}: TicketHeaderProps) {
  // Compute valid next states based on status state-machine
  const validNextStatuses = useMemo((): string[] => {
    switch (ticket.status) {
      case "New":
        return ["Open", "Pending", "Escalated", "Closed"];
      case "Open":
        return ["Pending", "Escalated", "Resolved", "Closed"];
      case "Pending":
        return ["Open", "Escalated", "Resolved", "Closed"];
      case "Escalated":
        return ["Open", "Pending", "Resolved", "Closed"];
      case "Resolved":
        return ["Closed", "Open"];
      case "Closed":
        return isLead ? ["Open"] : [];
      default:
        return ["Open", "Pending", "Resolved", "Closed"];
    }
  }, [ticket.status, isLead]);

  const isAssignedToMe = ticket.assigned_to === currentUserId;
  const isClosed = ticket.status === "Closed";
  const isEscalated = ticket.status === "Escalated";

  return (
    <div className="mb-6">
      {/* 1. BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-caption text-content-secondary mb-3">
        <Link
          href="/"
          className="hover:text-content-primary inline-flex items-center gap-1 transition-subtle"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Queue
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-content-tertiary" />
        <span className="font-mono-numbers font-semibold text-content-primary">
          {ticket.id}
        </span>
      </nav>

      {/* 2. ACTION HEADER CARD */}
      <div className="bg-surface border border-border rounded-card p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Metadata & Title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono-numbers text-xs font-semibold px-2 py-0.5 rounded bg-surface-subtle text-content-primary border border-border">
                {ticket.id}
              </span>
              <StatusChip status={ticket.status} />
              <PriorityChip priority={ticket.priority} />

              {/* Large SlaBadge + SlaRing Container */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-subtle rounded-card border border-border">
                <SlaRing
                  status={ticket.sla.status}
                  hoursRemaining={ticket.sla.hours_remaining}
                  size={20}
                />
                <SlaBadge
                  sla={ticket.sla}
                  size="lg"
                  isEscalated={isEscalated}
                  className="border-0 bg-transparent p-0 shadow-none font-semibold"
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold text-content-primary tracking-tight">
              {ticket.title}
            </h1>
          </div>

          {/* Action Buttons (Staff Only) */}
          {isStaff && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Assign / Claim Button */}
              {isAssignedToMe ? (
                <Tooltip content="Case is assigned to your active queue">
                  <span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      disabled
                    >
                      Assigned to You
                    </Button>
                  </span>
                </Tooltip>
              ) : ticket.assigned_to ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UserCheck className="w-3.5 h-3.5" />}
                  onClick={onClaim}
                >
                  Claim Case
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UserCheck className="w-3.5 h-3.5" />}
                  onClick={onClaim}
                >
                  Claim (Assign)
                </Button>
              )}

              {/* Unassign Button */}
              {ticket.assigned_to ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<UserX className="w-3.5 h-3.5 text-content-secondary" />}
                  onClick={onUnassign}
                >
                  Unassign
                </Button>
              ) : (
                <Tooltip content="Case is not currently assigned to any agent">
                  <span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<UserX className="w-3.5 h-3.5 text-content-disabled" />}
                      disabled
                    >
                      Unassign
                    </Button>
                  </span>
                </Tooltip>
              )}

              {/* Status Switcher Dropdown */}
              <div className="flex items-center">
                {isClosed && !isLead ? (
                  <Tooltip content="Closed tickets are terminal. Only Operations Leads can reopen.">
                    <span>
                      <Button variant="secondary" size="sm" disabled>
                        Closed (Terminal)
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <select
                    value={ticket.status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="h-8 px-2.5 bg-surface border border-border rounded-input text-caption font-medium text-content-primary hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-brand-500 transition-subtle cursor-pointer"
                    aria-label="Change ticket status"
                  >
                    <option value={ticket.status} disabled>
                      Status: {ticket.status}
                    </option>
                    {validNextStatuses.map((st) => (
                      <option key={st} value={st}>
                        {isClosed && st === "Open" ? "Reopen as Open" : `Mark as ${st}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Escalate Button (Violet Outline) */}
              {isEscalated ? (
                <Tooltip content="Ticket is already escalated to Operations Escalation Manager">
                  <span>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1.5 h-8 px-3 text-caption font-semibold rounded-input border border-violet-200 bg-violet-50 text-violet-400 opacity-60 cursor-not-allowed"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
                      Escalated
                    </button>
                  </span>
                </Tooltip>
              ) : isClosed ? (
                <Tooltip content="Cannot escalate a closed ticket">
                  <span>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1.5 h-8 px-3 text-caption font-semibold rounded-input border border-violet-200 bg-violet-50 text-violet-400 opacity-60 cursor-not-allowed"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
                      Escalate
                    </button>
                  </span>
                </Tooltip>
              ) : (
                <button
                  type="button"
                  onClick={onOpenEscalate}
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-caption font-semibold rounded-input border border-violet-400 bg-violet-50/70 text-violet-700 hover:bg-violet-100 hover:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-subtle cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-violet-600" />
                  Escalate
                </button>
              )}

              {/* Transfer Button */}
              {isClosed ? (
                <Tooltip content="Cannot transfer a closed ticket">
                  <span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Shuffle className="w-3.5 h-3.5 text-content-disabled" />}
                      disabled
                    >
                      Transfer
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Shuffle className="w-3.5 h-3.5 text-content-secondary" />}
                  onClick={onOpenTransfer}
                >
                  Transfer
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
