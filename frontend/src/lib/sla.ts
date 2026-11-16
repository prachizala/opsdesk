import { SLAStatus } from "./types";

/**
 * Computes updated SLA status and remaining time client-side between polling intervals.
 * Uses the initial hours_remaining from backend and elapsed wall-clock time.
 */
export function calculateClientSla(
  sla: SLAStatus | null | undefined,
  fetchedAtMs: number,
  nowMs: number = Date.now()
): SLAStatus {
  if (!sla) {
    return { status: "NORMAL", color: "Green", badge: "OK", hours_remaining: null };
  }
  if (sla.status === "STOPPED" || sla.hours_remaining === null || sla.hours_remaining === undefined) {
    return sla;
  }

  const elapsedHours = (nowMs - fetchedAtMs) / (1000 * 3600);
  const remainingHours = Math.max(0, sla.hours_remaining - elapsedHours);

  if (remainingHours <= 0) {
    return {
      status: "BREACHED",
      color: "Red",
      badge: "BREACHED",
      hours_remaining: 0
    };
  }

  const formattedRemaining = remainingHours < 1
    ? `${Math.max(1, Math.round(remainingHours * 60))}m left`
    : `${remainingHours.toFixed(1)}h left`;

  if (sla.status === "AT_RISK" || remainingHours <= 24) {
    return {
      status: "AT_RISK",
      color: "Amber",
      badge: formattedRemaining,
      hours_remaining: Number(remainingHours.toFixed(1))
    };
  }

  return {
    status: "NORMAL",
    color: "Green",
    badge: formattedRemaining,
    hours_remaining: Number(remainingHours.toFixed(1))
  };
}
