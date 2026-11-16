# OpsDesk Final QA & UI Audit Report (Phase 8)

**Audit Date:** 2026-11-16  
**Lead Designer / Engineer:** Prachi Zala (`prachizala2003@gmail.com`)  
**Design Concept:** *Calm Mission Control for Travel Operations*  

---

## 1. Verification Matrix

| Page | State | Requester (Agency) | Operations Agent | Team Lead |
| :--- | :--- | :--- | :--- | :--- |
| **`/` (Queue)** | Default | Filtered to own agency cases; no queue score or routing reason columns | Full queue with SLA left bars, score bars, sort order | Full queue + unassigned triage + export button |
| | Loading | Full-width TableRowSkeleton (5 rows) | Full-width TableRowSkeleton (5 rows) | Full-width TableRowSkeleton (5 rows) |
| | Empty | Clean empty state with "No cases match" | Empty state + "Clear filters" action | Empty state + "New Ticket" trigger |
| | Error | Inline ErrorState with "Try again" | Inline ErrorState with "Try again" | Inline ErrorState with "Try again" |
| | Mobile (<768px) | Stacked cards with SLA badge | Stacked cards with SLA badge | Stacked cards + mobile filter bottom-sheet |
| **`/ticket/[id]`** | Default | Booking context, Public reply thread, no internal notes | 3-column layout: Booking + Travel Timeline + Center activity + Right insight rail | Full controls: Reopen closed cases, reassign, CSV |
| | Actions | Read-only communication | Claim, Transfer, Escalate (14px modal), Status dropdown | All agent actions + terminal status override |
| | Modals | None | Escalate Modal, Transfer Modal, Side Thread Modal | All modals + Link product defect |
| | Mobile | Single column with tab bar | Single column with sticky tab bar | Single column with sticky tab bar |
| **`/insights`** | Default | Restricted Access card (RBAC) | Restricted Access card (RBAC) | 4 KPI cards, horizontal SVG bar chart, theme drawer |
| | Empty | Restricted Access card (RBAC) | Restricted Access card (RBAC) | Flight-path globe SVG + "No anomalies" |

---

## 2. "Needs Backend" Field Specifications

The following UI elements were designed with elegant fallbacks (`—`) because they currently lack direct backing API fields:

1. **`breach_rate` (`/api/insights/breach-rate`)**:
   - *Design Expectation:* Aggregated percentage of tickets that breached SLA over the selected time horizon with a directional delta trend icon.
   - *Current Fallback:* Renders clean `—` with tooltip explaining backend aggregation requirement.
2. **`avg_resolution_time` (`/api/insights/resolution-time`)**:
   - *Design Expectation:* Mean duration in hours/minutes from ticket creation to `Resolved` status.
   - *Current Fallback:* Renders clean `—` with tooltip explaining backend duration metric requirement.
3. **`duplicate_booking_count` (`/api/tickets/linked-count?tboh_id=...`)**:
   - *Design Expectation:* Live inline indicator during ticket creation ("3 earlier cases share this booking").
   - *Current Fallback:* Handled via existing `ticket.linked_ticket_ids` on the ticket detail page.

---

## 3. Recommended Screenshot Tour

1. **`http://localhost:3000/` (Queue Desktop - Agent View)**:
   - High-density Linear-style table with 4px SLA color bars, live tabular count-downs, and rank `#1` emergency badges.
2. **`http://localhost:3000/` (Queue - Filtered State & Create Ticket Modal)**:
   - Active filter chips bar and 14px-radius grouped booking/issue creation modal.
3. **`http://localhost:3000/` (Queue - Mobile View <768px)**:
   - Responsive stacked cards with bottom-sheet filter trigger.
4. **`http://localhost:3000/ticket/TCK-1004` (Ticket Detail - Desktop 3-Column)**:
   - Left booking context + hero Travel Timeline (NOW to Check-in with LCD marker and controlling deadline callout); Center activity tabs; Right insight rail.
5. **`http://localhost:3000/ticket/TCK-1004` (Ticket Detail - Internal Staff Note vs Supplier Thread)**:
   - Yellow-50 dashed internal note bubble + transfer-proof supplier recipient pill row.
6. **`http://localhost:3000/ticket/TCK-1004` (Ticket Detail - Requester Role)**:
   - Switch persona to Grand Travel Agency: verify internal notes, routing scores, and staff rail are completely omitted without placeholders.
7. **`http://localhost:3000/insights` (Operations Insights - Team Lead View)**:
   - 4 KPI cards, interactive 7d/14d/30d horizon selector, pure SVG/CSS horizontal bar chart.
8. **`http://localhost:3000/insights` (Insights - Theme Inspection Drawer)**:
   - Click any theme bar to slide in sample ticket pills and queue filter navigation.
