export interface ThemeMeta {
  category: "urgent" | "warning" | "standard" | "neutral";
  barColor: string;
  badgeBg: string;
  badgeText: string;
  avgHoursPerIncident: number;
  rootCause: string;
  operationalSummary: string;
  recommendedAction: string;
}

const THEME_DICTIONARY: Record<string, Partial<ThemeMeta>> = {
  "Hotel Check-in Rejection": {
    category: "urgent",
    barColor: "bg-brand-orange",
    badgeBg: "bg-red-50 dark:bg-red-950/40",
    badgeText: "text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60",
    avgHoursPerIncident: 3.5,
    rootCause: "Local property unable to match agency booking voucher against CRS/GDS inventory. Agency traveler stranded at front desk.",
    operationalSummary: "Critical check-in failure requiring immediate supplier override and direct hotel front-desk reconfirmation.",
    recommendedAction: "Escalate directly to hotel duty manager via dedicated supplier line; issue urgent rebooking guarantee if unconfirmed within 20 mins.",
  },
  "Supplier Contact Unreachable": {
    category: "urgent",
    barColor: "bg-brand-orange",
    badgeBg: "bg-red-50 dark:bg-red-950/40",
    badgeText: "text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60",
    avgHoursPerIncident: 3.2,
    rootCause: "Local destination management company (DMC) emergency dispatch hotline unresponsive during off-hours travel window.",
    operationalSummary: "Supplier unreachable during live traveler escalation; risk of passenger abandonment and contract breach.",
    recommendedAction: "Trigger Tier-2 emergency supplier escalation protocol; switch to backup hotel inventory provider.",
  },
  "Schedule Disruption": {
    category: "warning",
    barColor: "bg-brand-orange",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
    avgHoursPerIncident: 2.8,
    rootCause: "Involuntary carrier schedule amendment or equipment swap executed without automated PNR status synchronization.",
    operationalSummary: "Flight timing change caused downstream missed connection or hotel check-in mismatch across multi-leg booking.",
    recommendedAction: "Apply GDS waiver code to reissue onward ticket segments; re-sync hotel check-in window with supplier.",
  },
  "Cancellation Penalty Dispute": {
    category: "warning",
    barColor: "bg-brand-orange",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
    avgHoursPerIncident: 2.6,
    rootCause: "Discrepancy between agency contract cancellation deadline (UTC) and local hotel tariff timezone restrictions.",
    operationalSummary: "Agency disputed non-refundable penalty fee charged by bedbank for timely cancellation request.",
    recommendedAction: "Submit agency timestamp audit log to supplier disputes team requesting full waiver based on agency SLA.",
  },
  "Supplier Lag": {
    category: "warning",
    barColor: "bg-brand-orange",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
    avgHoursPerIncident: 2.4,
    rootCause: "Bedbank XML/JSON API response latency exceeding 45-second gateway timeout on reservation modification requests.",
    operationalSummary: "API timeout prevents real-time booking amendment confirmation, requiring manual supplier portal intervention.",
    recommendedAction: "Engage supplier technical operations team; log latency incident on supplier scorecard.",
  },
  "Refund Delay": {
    category: "warning",
    barColor: "bg-brand-orange",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
    avgHoursPerIncident: 2.0,
    rootCause: "Airline BSP settlement batch processing delay and manual card payment reversal approvals in finance queue.",
    operationalSummary: "Delayed refund issuance past the 5-business-day standard agency turnaround commitment.",
    recommendedAction: "Expedite credit batch queue with finance operations; send proactive agency settlement ETA notice.",
  },
  "Payment Gateway Reconciliation": {
    category: "standard",
    barColor: "bg-brand-orange",
    badgeBg: "bg-brand-50 dark:bg-brand-50/20",
    badgeText: "text-brand-700 dark:text-brand-orange-text border-brand-200 dark:border-brand-500/30",
    avgHoursPerIncident: 1.8,
    rootCause: "Mismatch between agency credit account authorization code and internal ERP settlement invoice ledger.",
    operationalSummary: "Settlement mismatch causing automated booking lock until manual payment verification is completed.",
    recommendedAction: "Perform three-way match between Stripe/Adyen authorization payload, agency ledger, and reservation record.",
  },
  "Room Mismatch": {
    category: "standard",
    barColor: "bg-brand-orange",
    badgeBg: "bg-brand-50 dark:bg-brand-50/20",
    badgeText: "text-brand-700 dark:text-brand-orange-text border-brand-200 dark:border-brand-500/30",
    avgHoursPerIncident: 1.8,
    rootCause: "Bedding configuration mapping discrepancy between supplier room code (DBL/TWN) and hotel front-office PMS.",
    operationalSummary: "Traveler arrived to single bed instead of requested twin bedding or vice versa.",
    recommendedAction: "Dispatch automated hotel PMS amendment request; issue room upgrade authorization if preferred bedding unavailable.",
  },
  "Fare Recalculation": {
    category: "standard",
    barColor: "bg-brand-orange",
    badgeBg: "bg-brand-50 dark:bg-brand-50/20",
    badgeText: "text-brand-700 dark:text-brand-orange-text border-brand-200 dark:border-brand-500/30",
    avgHoursPerIncident: 1.6,
    rootCause: "Dynamic fare ladder adjustment by airline inventory control during ticket reissue approval interval.",
    operationalSummary: "Fare difference required reassessment before ticket revalidation could proceed.",
    recommendedAction: "Verify carrier fare rule applicability and calculate agency price protection supplement.",
  },
  "Missing Confirmation Voucher": {
    category: "standard",
    barColor: "bg-brand-orange",
    badgeBg: "bg-brand-50 dark:bg-brand-50/20",
    badgeText: "text-brand-700 dark:text-brand-orange-text border-brand-200 dark:border-brand-500/30",
    avgHoursPerIncident: 1.2,
    rootCause: "PDF voucher generation trigger failed to dispatch due to temporary webhook failure during peak booking burst.",
    operationalSummary: "Agency missing downloadable hotel confirmation voucher prior to guest departure date.",
    recommendedAction: "Regenerate and email cryptographically verified PDF voucher; verify supplier confirmation number.",
  },
  "Documentation Lag": {
    category: "standard",
    barColor: "bg-brand-orange",
    badgeBg: "bg-brand-50 dark:bg-brand-50/20",
    badgeText: "text-brand-700 dark:text-brand-orange-text border-brand-200 dark:border-brand-500/30",
    avgHoursPerIncident: 1.2,
    rootCause: "Supplier confirmation number delayed by up to 2 hours following initial agency booking acceptance.",
    operationalSummary: "Reservation shows confirmed status in agency portal but lacks official property confirmation reference.",
    recommendedAction: "Poll supplier booking retrieval endpoint; dispatch confirmation notification upon code receipt.",
  },
  "Special Facility Request": {
    category: "standard",
    barColor: "bg-brand-orange",
    badgeBg: "bg-brand-50 dark:bg-brand-50/20",
    badgeText: "text-brand-700 dark:text-brand-orange-text border-brand-200 dark:border-brand-500/30",
    avgHoursPerIncident: 1.4,
    rootCause: "Special request text string (accessible bathroom, high floor) unacknowledged by hotel booking interface.",
    operationalSummary: "High-priority passenger amenity or accessibility requirement pending property confirmation.",
    recommendedAction: "Place direct concierge service call to hotel reservations to lock in room assignment notes.",
  },
};

export function getThemeMeta(themeName: string): ThemeMeta {
  const directMatch = THEME_DICTIONARY[themeName];
  if (directMatch) {
    return {
      category: directMatch.category || "standard",
      barColor: directMatch.barColor || "bg-brand-orange",
      badgeBg: directMatch.badgeBg || "bg-brand-50 dark:bg-brand-50/20",
      badgeText: directMatch.badgeText || "text-brand-700 dark:text-brand-orange-text border-brand-200 dark:border-brand-500/30",
      avgHoursPerIncident: directMatch.avgHoursPerIncident || 2.0,
      rootCause: directMatch.rootCause || "Recurring operational pattern detected across inbound booking interactions.",
      operationalSummary: directMatch.operationalSummary || "Pattern clustered by automated classification model.",
      recommendedAction: directMatch.recommendedAction || "Review sample tickets and apply standard operating procedure.",
    };
  }

  // Fallback heuristic based on keywords
  const lower = themeName.toLowerCase();
  if (lower.includes("emergency") || lower.includes("rejection") || lower.includes("unreachable") || lower.includes("urgent")) {
    return {
      category: "urgent",
      barColor: "bg-brand-orange",
      badgeBg: "bg-red-50 dark:bg-red-950/40",
      badgeText: "text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60",
      avgHoursPerIncident: 3.2,
      rootCause: "High-friction traveler incident requiring immediate operational intervention.",
      operationalSummary: "Time-critical operational impediment affecting live traveler journeys.",
      recommendedAction: "Prioritize desk intervention and contact supplier management immediately.",
    };
  }

  if (lower.includes("cancellation") || lower.includes("refund") || lower.includes("dispute") || lower.includes("delay")) {
    return {
      category: "warning",
      barColor: "bg-brand-orange",
      badgeBg: "bg-amber-50 dark:bg-amber-950/40",
      badgeText: "text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      avgHoursPerIncident: 2.5,
      rootCause: "Policy or settlement friction between agency booking terms and provider rules.",
      operationalSummary: "Commercial or booking status disruption requiring agency liaison.",
      recommendedAction: "Review dispute documentation and initiate supplier fee waiver review.",
    };
  }

  if (lower.includes("unclassified") || lower.includes("general")) {
    return {
      category: "neutral",
      barColor: "bg-brand-orange",
      badgeBg: "bg-slate-100 dark:bg-slate-800",
      badgeText: "text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      avgHoursPerIncident: 1.5,
      rootCause: "Routine operational inquiries without specific failure signatures.",
      operationalSummary: "General agency communication and informational inquiries.",
      recommendedAction: "Apply automated response macro or route to standard inquiry queue.",
    };
  }

  return {
    category: "standard",
    barColor: "bg-brand-orange",
    badgeBg: "bg-brand-50 dark:bg-brand-50/20",
    badgeText: "text-brand-700 dark:text-brand-orange-text border-brand-200 dark:border-brand-500/30",
    avgHoursPerIncident: 2.0,
    rootCause: "Operational inquiry recurring across booking management workflows.",
    operationalSummary: "Systemic operational workflow item identified in the reporting window.",
    recommendedAction: "Monitor cluster volume and verify standard processing SLAs.",
  };
}
