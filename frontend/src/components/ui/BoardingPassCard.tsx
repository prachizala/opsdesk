"use client";

import React from "react";
import { Plane, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BoardingPassCardProps {
  ticketId?: string;
  pnr?: string;
  passengerName?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  gate?: string;
  seat?: string;
  status?: string;
  className?: string;
}

export function BoardingPassCard({
  ticketId = "TCK-1001",
  pnr = "TBOH-94819",
  passengerName = "Sarah Jenkins",
  flightNumber = "EK 201",
  origin = "DXB",
  destination = "LHR",
  departureTime = "14:25 UTC",
  gate = "B14",
  seat = "12A",
  status = "ON TIME",
  className,
}: BoardingPassCardProps) {
  return (
    <div
      className={cn(
        "relative bg-surface border border-border rounded-card shadow-sm overflow-hidden flex flex-col md:flex-row font-sans",
        className
      )}
    >
      {/* Main Boarding Pass Section */}
      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        {/* Pass Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-input bg-brand-50 flex items-center justify-center text-brand-600">
              <Plane className="w-4 h-4 rotate-45" />
            </div>
            <div>
              <p className="text-caption font-semibold text-content-primary">BOARDING DISPATCH</p>
              <p className="text-[11px] text-content-tertiary font-mono-numbers">{ticketId}</p>
            </div>
          </div>
          <span className="text-[11px] font-mono-numbers font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
            {status}
          </span>
        </div>

        {/* Flight Route Banner */}
        <div className="flex items-center justify-between my-2">
          <div className="flex flex-col">
            <span className="text-28 font-bold font-mono-numbers tracking-tight text-content-primary">
              {origin}
            </span>
            <span className="text-caption text-content-tertiary">Origin</span>
          </div>

          <div className="flex-1 mx-4 flex flex-col items-center">
            <span className="text-[11px] font-mono-numbers font-semibold text-brand-600">
              {flightNumber}
            </span>
            <div className="w-full flex items-center gap-1 my-1">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
              <div className="flex-1 border-b-2 border-dashed border-brand-200" />
              <Plane className="w-3.5 h-3.5 text-brand-600 rotate-90 shrink-0" />
              <div className="flex-1 border-b-2 border-dashed border-brand-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            </div>
            <span className="text-[11px] font-mono-numbers text-content-tertiary">
              {departureTime}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-28 font-bold font-mono-numbers tracking-tight text-content-primary">
              {destination}
            </span>
            <span className="text-caption text-content-tertiary">Destination</span>
          </div>
        </div>

        {/* Passenger & Booking Details */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-[12px]">
          <div>
            <p className="text-content-tertiary text-[11px]">Passenger</p>
            <p className="font-semibold text-content-primary truncate">{passengerName}</p>
          </div>
          <div>
            <p className="text-content-tertiary text-[11px]">PNR / Reference</p>
            <p className="font-semibold font-mono-numbers text-content-primary">{pnr}</p>
          </div>
          <div>
            <p className="text-content-tertiary text-[11px]">Gate / Seat</p>
            <p className="font-semibold font-mono-numbers text-content-primary">
              {gate} / {seat}
            </p>
          </div>
        </div>
      </div>

      {/* Perforated Divider (Dashed with notch cutouts) */}
      <div className="relative flex md:flex-col items-center justify-between bg-surface">
        {/* Top/Left notch */}
        <div className="hidden md:block absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-canvas border border-border z-10" />
        {/* Vertical perforation line */}
        <div className="hidden md:block w-px h-full border-l-2 border-dashed border-border" />
        {/* Horizontal perforation line for mobile */}
        <div className="md:hidden w-full h-px border-t-2 border-dashed border-border my-2" />
        {/* Bottom/Right notch */}
        <div className="hidden md:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-canvas border border-border z-10" />
      </div>

      {/* Stub / Barcode Section */}
      <div className="p-5 md:w-48 bg-surface-subtle/50 flex flex-col justify-between items-center text-center gap-3">
        <div className="flex flex-col items-center">
          <QrCode className="w-12 h-12 text-content-secondary mb-1" />
          <span className="text-[10px] font-mono-numbers text-content-tertiary uppercase">
            ELECTRONIC PASS
          </span>
        </div>

        {/* Simulated Barcode */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="font-mono-numbers tracking-widest text-content-primary text-xs font-bold select-none scale-y-125"
            aria-hidden="true"
          >
            ||| | |||| | || ||||| | |||
          </div>
          <span className="font-mono-numbers text-[10px] text-content-tertiary">
            {pnr}
          </span>
        </div>
      </div>
    </div>
  );
}
