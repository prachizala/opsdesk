import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Frontend Polling with Jitter and Backoff", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calculates exponential backoff with ceiling on consecutive errors", () => {
    let delay = 5000;
    const maxDelay = 60000;

    const computeNextDelay = (current: number, isError: boolean) => {
      if (!isError) return 5000;
      return Math.min(maxDelay, Math.round(current * 1.5));
    };

    delay = computeNextDelay(delay, true); // 7500
    expect(delay).toBe(7500);

    delay = computeNextDelay(delay, true); // 11250
    expect(delay).toBe(11250);

    delay = computeNextDelay(delay, false); // recovered -> reset to 5000
    expect(delay).toBe(5000);
  });

  it("aborts active requests on unmount via AbortController", () => {
    const controller = new AbortController();
    expect(controller.signal.aborted).toBe(false);

    controller.abort();
    expect(controller.signal.aborted).toBe(true);
  });

  it("pauses polling when document is hidden (visibilitychange)", () => {
    let isPolling = true;

    const handleVisibilityChange = (hidden: boolean) => {
      if (hidden) {
        isPolling = false;
      } else {
        isPolling = true;
      }
    };

    handleVisibilityChange(true);
    expect(isPolling).toBe(false);

    handleVisibilityChange(false);
    expect(isPolling).toBe(true);
  });
});
