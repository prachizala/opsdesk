import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SLABadge } from "@/components/Badge";
import { calculateClientSla } from "@/lib/sla";
import { SLAStatus } from "@/lib/types";

describe("SLABadge and SLA Calculator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates normal client SLA with remaining hours", () => {
    const initialSla: SLAStatus = {
      status: "NORMAL",
      color: "Green",
      badge: "48.0h left",
      hours_remaining: 48.0,
    };
    const fetchedAt = 1000000;
    // 2 hours elapsed = 2 * 3600 * 1000 ms
    const now = fetchedAt + 2 * 3600 * 1000;
    const updated = calculateClientSla(initialSla, fetchedAt, now);

    expect(updated.status).toBe("NORMAL");
    expect(updated.hours_remaining).toBe(46.0);
    expect(updated.badge).toBe("46.0h left");
  });

  it("transitions to AT_RISK when remaining hours drop below 24h", () => {
    const initialSla: SLAStatus = {
      status: "NORMAL",
      color: "Green",
      badge: "25.0h left",
      hours_remaining: 25.0,
    };
    const fetchedAt = 1000000;
    // 2 hours elapsed -> 23h remaining
    const now = fetchedAt + 2 * 3600 * 1000;
    const updated = calculateClientSla(initialSla, fetchedAt, now);

    expect(updated.status).toBe("AT_RISK");
    expect(updated.color).toBe("Amber");
    expect(updated.hours_remaining).toBe(23.0);
  });

  it("transitions to BREACHED when remaining hours reach 0", () => {
    const initialSla: SLAStatus = {
      status: "AT_RISK",
      color: "Amber",
      badge: "1.0h left",
      hours_remaining: 1.0,
    };
    const fetchedAt = 1000000;
    // 2 hours elapsed -> breached
    const now = fetchedAt + 2 * 3600 * 1000;
    const updated = calculateClientSla(initialSla, fetchedAt, now);

    expect(updated.status).toBe("BREACHED");
    expect(updated.color).toBe("Red");
    expect(updated.badge).toBe("BREACHED");
    expect(updated.hours_remaining).toBe(0);
  });

  it("preserves STOPPED SLA status for closed tickets", () => {
    const stoppedSla: SLAStatus = {
      status: "STOPPED",
      color: "Gray",
      badge: "RESOLVED",
      hours_remaining: null,
    };
    const updated = calculateClientSla(stoppedSla, 1000000, 2000000);
    expect(updated.status).toBe("STOPPED");
    expect(updated.badge).toBe("RESOLVED");
  });

  it("renders SLABadge component correctly across all states", () => {
    const { rerender } = render(
      <SLABadge sla={{ status: "NORMAL", color: "Green", badge: "32.0h left", hours_remaining: 32 }} />
    );
    expect(screen.getByText("On track")).toBeDefined();
    expect(screen.getByText("1d 8h")).toBeDefined();

    rerender(
      <SLABadge sla={{ status: "AT_RISK", color: "Amber", badge: "14.5h left", hours_remaining: 14.5 }} />
    );
    expect(screen.getByText("At risk")).toBeDefined();
    expect(screen.getByText("14h 30m")).toBeDefined();

    rerender(
      <SLABadge sla={{ status: "BREACHED", color: "Red", badge: "BREACHED", hours_remaining: 0 }} />
    );
    expect(screen.getByText("Breached")).toBeDefined();
    expect(screen.getByText("0m 0s")).toBeDefined();

    rerender(
      <SLABadge sla={{ status: "STOPPED", color: "Gray", badge: "CLOSED", hours_remaining: null }} />
    );
    expect(screen.getByText("Stopped")).toBeDefined();

    rerender(
      <SLABadge sla={{ status: "CLOSED", color: "Gray", badge: "CLOSED", hours_remaining: null }} />
    );
    expect(screen.getByText("Closed")).toBeDefined();
  });
});
