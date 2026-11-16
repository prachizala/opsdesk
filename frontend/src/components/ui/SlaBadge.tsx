"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Clock, AlertTriangle, ArrowUpCircle, PauseCircle } from "lucide-react";
import { SLAStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SlaBadgeProps {
  sla: SLAStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
  isEscalated?: boolean;
}

export function SlaBadge({ sla, size = "sm", className, isEscalated = false }: SlaBadgeProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    sla.hours_remaining !== null && sla.hours_remaining !== undefined
      ? Math.round(sla.hours_remaining * 3600)
      : null
  );

  const prevStatusRef = useRef<string>(sla.status);
  const [announceText, setAnnounceText] = useState<string>("");

  // Announce only when SLA state changes (WCAG polite live region rule)
  useEffect(() => {
    if (prevStatusRef.current !== sla.status) {
      setAnnounceText(`SLA status changed to ${sla.status.toLowerCase().replace("_", " ")}`);
      prevStatusRef.current = sla.status;
    }
  }, [sla.status]);

  // Keep seconds remaining in sync with prop updates
  useEffect(() => {
    if (sla.hours_remaining !== null && sla.hours_remaining !== undefined) {
      setSecondsRemaining(Math.round(sla.hours_remaining * 3600));
    } else {
      setSecondsRemaining(null);
    }
  }, [sla.hours_remaining]);

  // Live countdown timer (30s interval normally; 1s interval when < 5 mins)
  useEffect(() => {
    if (secondsRemaining === null || sla.status === "STOPPED") return;

    const isUrgent = Math.abs(secondsRemaining) < 300; // less than 5 minutes
    const intervalMs = isUrgent ? 1000 : 30000;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev !== null ? prev - (isUrgent ? 1 : 30) : null));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [secondsRemaining, sla.status]);

  // Format countdown string in tabular-nums
  const formatCountdown = (secs: number | null): string => {
    if (secs === null) return "";
    const isOverdue = secs < 0;
    const absSecs = Math.abs(secs);
    const hours = Math.floor(absSecs / 3600);
    const mins = Math.floor((absSecs % 3600) / 60);

    if (isOverdue) {
      if (hours > 0) return `overdue ${hours}h ${mins}m`;
      return `overdue ${mins}m`;
    }
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    if (hours > 0) return `${hours}h ${mins}m`;
    const s = absSecs % 60;
    if (hours === 0 && mins < 5) return `${mins}m ${s}s`;
    return `${mins}m`;
  };

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-caption",
    md: "px-3 py-1 text-body",
    lg: "px-3.5 py-1.5 text-sm font-semibold",
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-4.5 h-4.5" : "w-4 h-4";

  // Determine variant styling and icons
  if (sla.status === "STOPPED") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium border bg-slate-100 text-content-secondary border-border select-none shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <PauseCircle className={iconSize} />
        <span>Stopped</span>
      </span>
    );
  }

  if (isEscalated) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold border bg-sla-escalated-bg text-sla-escalated-text border-purple-200 select-none shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <ArrowUpCircle className={iconSize} />
        <span>Escalated</span>
        {secondsRemaining !== null && (
          <span className="font-mono-numbers opacity-85">({formatCountdown(secondsRemaining)})</span>
        )}
      </span>
    );
  }

  if (sla.status === "BREACHED") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold border bg-sla-breached-bg text-sla-breached-text border-red-200 select-none shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <AlertTriangle className={iconSize} />
        <span>Breached</span>
        {secondsRemaining !== null && (
          <span className="font-mono-numbers opacity-90">({formatCountdown(secondsRemaining)})</span>
        )}
        {announceText && <span className="sr-only" aria-live="polite">{announceText}</span>}
      </span>
    );
  }

  if (sla.status === "AT_RISK") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold border bg-sla-at_risk-bg text-sla-at_risk-text border-amber-300 select-none shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <Clock className={iconSize} />
        <span>At risk</span>
        {secondsRemaining !== null && (
          <span className="font-mono-numbers font-medium">({formatCountdown(secondsRemaining)})</span>
        )}
        {announceText && <span className="sr-only" aria-live="polite">{announceText}</span>}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border bg-sla-normal-bg text-sla-normal-text border-emerald-200 select-none shrink-0",
        sizeClasses[size],
        className
      )}
    >
      <CheckCircle2 className={iconSize} />
      <span>On track</span>
      {secondsRemaining !== null && (
        <span className="font-mono-numbers opacity-80">({formatCountdown(secondsRemaining)})</span>
      )}
      {announceText && <span className="sr-only" aria-live="polite">{announceText}</span>}
    </span>
  );
}
