"use client";

import React from "react";
import { TicketDetail, DEMO_USERS } from "@/lib/types";
import { Card, CardHeader, KeyValue, Chip, TravelTimeline, Avatar } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export interface TicketBookingContextProps {
  ticket: TicketDetail;
}

export function TicketBookingContext({ ticket }: TicketBookingContextProps) {
  // Resolve region and assignee name
  const region =
    ticket.agency_id === "AGY-001"
      ? "MEA"
      : ticket.agency_id === "AGY-002"
      ? "APAC"
      : "Global";

  const assigneeUser = DEMO_USERS.find((u) => u.id === ticket.assigned_to);
  const assigneeName = assigneeUser ? assigneeUser.name : ticket.assigned_to;

  return (
    <div className="space-y-6">
      {/* Booking Context KeyValues */}
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

      {/* Hero Graphic: FULL TravelTimeline from @/components/ui */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-caption font-semibold text-content-primary uppercase tracking-wider">
            Travel Timeline
          </h3>
          <span className="text-[11px] text-content-tertiary font-mono-numbers">
            8px active track
          </span>
        </div>
        <TravelTimeline
          createdAt={ticket.created_at}
          checkIn={ticket.check_in_date}
          lcd={ticket.lcd_date}
          variant="full"
        />
      </Card>
    </div>
  );
}
