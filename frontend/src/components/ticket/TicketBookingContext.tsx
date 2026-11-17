"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TicketDetail, DEMO_USERS } from "@/lib/types";
import {
  Card,
  CardHeader,
  KeyValue,
  Chip,
  FlightPathTimeline,
  Avatar,
  StatusChip,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { GitCommit, ExternalLink } from "lucide-react";
import { fetchTicketDetail } from "@/lib/api";

export interface TicketBookingContextProps {
  ticket: TicketDetail;
  currentUserId?: string;
}

interface SiblingPreviewData {
  id: string;
  status: string;
  priority?: string;
  slaStatus?: string;
  title?: string;
  lastActivity?: string;
}

export function TicketBookingContext({ ticket, currentUserId = "USR-101" }: TicketBookingContextProps) {
  // Resolve region and assignee name
  const region =
    ticket.agency_id === "AGY-001"
      ? "MEA"
      : ticket.agency_id === "AGY-002"
      ? "APAC"
      : "Global";

  const assigneeUser = DEMO_USERS.find((u) => u.id === ticket.assigned_to);
  const assigneeName = assigneeUser ? assigneeUser.name : ticket.assigned_to;

  // Linked tickets & Case Story
  const linkedIds = useMemo(() => ticket.linked_ticket_ids || [], [ticket.linked_ticket_ids]);
  const hasLinkedCases = linkedIds.length > 0;

  // Sibling preview metadata state
  const [siblingPreviews, setSiblingPreviews] = useState<Record<string, SiblingPreviewData>>({});
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!hasLinkedCases) return;

    let isMounted = true;
    linkedIds.forEach(async (id) => {
      try {
        const detail = await fetchTicketDetail(id, currentUserId);
        if (isMounted) {
          setSiblingPreviews((prev) => ({
            ...prev,
            [id]: {
              id: detail.id,
              status: detail.status,
              priority: detail.priority,
              slaStatus: detail.sla?.status || "NORMAL",
              title: detail.title,
              lastActivity: detail.updated_at || detail.created_at,
            },
          }));
        }
      } catch {
        if (isMounted) {
          setSiblingPreviews((prev) => ({
            ...prev,
            [id]: {
              id,
              status: "Resolved",
              priority: "Medium",
              slaStatus: "STOPPED",
              title: `Historical booking ticket ${id}`,
              lastActivity: ticket.created_at,
            },
          }));
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [linkedIds, currentUserId, hasLinkedCases, ticket.created_at]);

  // Combined node sequence: linked tickets preceding current ticket
  const allNodes: Array<{ id: string; isCurrent: boolean }> = [
    ...linkedIds.map((id) => ({ id, isCurrent: false })),
    { id: ticket.id, isCurrent: true },
  ];

  return (
    <div className="space-y-6">
      {/* 1. BOOKING CONTEXT KEYVALUES */}
      <Card padding="md">
        <CardHeader
          title="Booking Context"
          subtitle="Verified reservation data"
        />
        <div className="divide-y divide-border">
          <KeyValue
            label="TBOH ID"
            value={ticket.tboh_id}
            copyableText={ticket.tboh_id}
            isMono={true}
          />
          <KeyValue
            label="Agency"
            value={
              <span className="font-semibold text-content-primary">
                {ticket.agency_id}
              </span>
            }
          />
          <KeyValue
            label="Region"
            value={
              <Chip variant="subtle" size="sm">
                {region}
              </Chip>
            }
          />
          <KeyValue
            label="Check-in"
            value={formatDate(ticket.check_in_date)}
            isMono={true}
          />
          <KeyValue
            label="LCD Deadline"
            value={ticket.lcd_date ? formatDate(ticket.lcd_date) : "None"}
            isMono={true}
          />
          <KeyValue
            label="Intent"
            value={
              ticket.intent ? (
                <Chip variant="brand" size="sm">
                  {ticket.intent}
                </Chip>
              ) : (
                <span className="text-content-tertiary italic">Unclassified</span>
              )
            }
          />
          <KeyValue
            label="Created"
            value={formatDate(ticket.created_at)}
            isMono={true}
          />
          <KeyValue
            label="Assignee"
            value={
              ticket.assigned_to ? (
                <div className="inline-flex items-center gap-1.5 font-semibold text-content-primary">
                  <Avatar name={assigneeName || ticket.assigned_to} size="sm" />
                  <span>{assigneeName}</span>
                </div>
              ) : (
                <span className="text-content-tertiary italic">Unassigned</span>
              )
            }
          />
        </div>
      </Card>

      {/* 2. FULL FLIGHTPATHTIMELINE HERO GRAPHIC */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-caption font-semibold text-content-primary uppercase tracking-wider">
            Flight Path Timeline
          </h3>
          <span className="text-[11px] text-content-tertiary font-mono-numbers">
            Hero Arc
          </span>
        </div>
        <FlightPathTimeline
          createdAt={ticket.created_at}
          checkIn={ticket.check_in_date}
          lcd={ticket.lcd_date}
          variant="full"
        />
      </Card>

      {/* 3. "CASE STORY" CARD (WHEN LINKED TICKETS SHARE TBOH) */}
      {hasLinkedCases && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-caption font-semibold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5 text-brand-600" />
              <span>Case Story</span>
            </h3>
            <span className="text-[11px] font-mono-numbers text-content-tertiary">
              {allNodes.length} linked tickets
            </span>
          </div>

          <p className="text-caption text-content-secondary mb-3 leading-snug">
            Connected incident chain sharing reservation reference{" "}
            <span className="font-mono-numbers font-semibold text-content-primary">
              {ticket.tboh_id}
            </span>
            :
          </p>

          {/* Connected-nodes chain: Inline SVG representation */}
          <div className="relative py-2">
            <svg
              viewBox={`0 0 ${Math.max(220, allNodes.length * 75)} 56`}
              className="w-full h-14 overflow-visible"
            >
              {/* Connecting line */}
              <line
                x1={30}
                y1={28}
                x2={Math.max(220, allNodes.length * 75) - 30}
                y2={28}
                stroke="#CBD5E1"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              {allNodes.map((node, index) => {
                const total = allNodes.length;
                const startX = 30;
                const endX = Math.max(220, allNodes.length * 75) - 30;
                const x = total === 1 ? (startX + endX) / 2 : startX + (index / (total - 1)) * (endX - startX);
                const isCurrent = node.isCurrent;
                const preview = siblingPreviews[node.id];
                const status = isCurrent ? ticket.status : preview?.status || "Resolved";

                let dotFill = "#0E9AA7"; // brand
                if (status === "Resolved") dotFill = "#10B981"; // emerald
                if (status === "Escalated") dotFill = "#8B5CF6"; // violet
                if (status === "Pending") dotFill = "#F59E0B"; // amber
                if (status === "Closed") dotFill = "#64748B"; // slate

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Active Halo ring for current ticket */}
                    {isCurrent && (
                      <circle
                        cx={x}
                        cy={28}
                        r={14}
                        fill="none"
                        stroke="#0E9AA7"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-spin-slow origin-center"
                        style={{ transformOrigin: `${x}px 28px` }}
                      />
                    )}

                    {/* Outer node circle */}
                    <circle
                      cx={x}
                      cy={28}
                      r={isCurrent ? 10 : 8}
                      fill="#FFFFFF"
                      stroke={isCurrent ? "#0E9AA7" : "#94A3B8"}
                      strokeWidth={isCurrent ? "3" : "2"}
                    />

                    {/* Center status dot */}
                    <circle cx={x} cy={28} r={isCurrent ? 5 : 4} fill={dotFill} />

                    {/* Node ID label */}
                    <text
                      x={x}
                      y={48}
                      textAnchor="middle"
                      className="font-mono-numbers text-[10px] font-semibold"
                      fill={isCurrent ? "#0E9AA7" : "#64748B"}
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover mini preview card */}
            {hoveredNode && (
              <div className="mt-3 p-3 bg-surface-subtle border border-border rounded-input shadow-sm text-caption animate-in fade-in duration-150">
                {(() => {
                  const isCurrent = hoveredNode === ticket.id;
                  const preview = isCurrent
                    ? {
                        id: ticket.id,
                        status: ticket.status,
                        priority: ticket.priority,
                        slaStatus: ticket.sla?.status,
                        title: ticket.title,
                        lastActivity: ticket.updated_at || ticket.created_at,
                      }
                    : siblingPreviews[hoveredNode] || {
                        id: hoveredNode,
                        status: "Resolved",
                        priority: "Medium",
                        slaStatus: "STOPPED",
                        title: `Historical linked ticket ${hoveredNode}`,
                        lastActivity: ticket.created_at,
                      };

                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-numbers font-bold text-content-primary">
                          {preview.id} {isCurrent && "(Current)"}
                        </span>
                        <StatusChip status={preview.status} className="scale-90 origin-right" />
                      </div>
                      <p className="text-[12px] text-content-secondary line-clamp-1 font-medium">
                        {preview.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-content-tertiary pt-1 border-t border-border">
                        <span>SLA: {preview.slaStatus?.replace("_", " ") || "NORMAL"}</span>
                        <span>{formatDate(preview.lastActivity)}</span>
                      </div>
                      {!isCurrent && (
                        <Link
                          href={`/ticket/${hoveredNode}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline pt-1"
                        >
                          <span>Open case detail</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
