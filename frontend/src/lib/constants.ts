/**
 * OpsDesk Design System & Microcopy Constants
 * Author: Prachi Zala <prachizala2003@gmail.com>
 */

export const DESIGN_TOKENS = {
  SPACING_GRID_UNIT: 4,
  MAX_PAGE_WIDTH_PX: 1440,
  TOPNAV_HEIGHT_PX: 56,
  SIDEBAR_WIDTH_EXPANDED_PX: 232,
  SIDEBAR_WIDTH_COLLAPSED_PX: 64,
  QUEUE_ROW_HEIGHT_PX: 56,
  MODAL_RADIUS_PX: 14,
  CARD_RADIUS_PX: 10,
  INPUT_RADIUS_PX: 6,
} as const;

export const OPERATIONAL_MICROCOPY = {
  EMPTY_QUEUE: "No tickets match the active filter criteria.",
  EMPTY_MESSAGES: "No messages recorded on this case yet.",
  EMPTY_SUPPLIERS: "No vendor conversations initiated for this booking.",
  EMPTY_INSIGHTS: "No operational anomalies detected in this window.",
  API_UNREACHABLE: "Operations API unreachable — changes cannot be saved.",
  TRANSFER_PRESERVED_NOTE: "Agent reassigned — supplier thread recipients and context remain active.",
  DEMO_AUTH_WARNING: "Demo authentication — identity is client-supplied and not secure.",
} as const;

export const SLA_ALERT_THRESHOLDS = {
  URGENT_COUNTDOWN_SECONDS: 300, // < 5 minutes
  AT_RISK_HOURS_REMAINING: 4,
} as const;
