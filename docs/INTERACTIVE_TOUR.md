# OpsDesk Visual Tour & Operator Cheatsheet

**Author:** Prachi Zala (`prachizala2003@gmail.com`)  
**Product:** OpsDesk Mission Control Console  

---

## 1. Quick Keyboard Cheatsheet

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Global | Focus global search / command palette |
| `Esc` | Modal / Drawer | Dismiss active modal, slide-out drawer, or popover |
| `Tab` / `Shift + Tab` | Queue Table | Navigate focus through queue rows and filter controls |
| `Enter` | Queue Table | Open focused ticket detail view |
| `Ctrl + Enter` / `Cmd + Enter` | Ticket Composer | Dispatch customer reply or record internal note |

---

## 2. Operator Role Matrix

- **Requester (Agency Portal):**
  - Clean view restricted to tickets opened by own agency (`AGY-001`, `AGY-002`).
  - Internal operational queues, triage scores, routing reason explanations, and internal staff notes are completely omitted.
- **Operations Agent:**
  - Full operational table with 4px SLA left indicator bar, live countdowns, and quick claim/unassign actions.
  - Ticket detail view with 3 columns: Left Booking + Hero Travel Timeline; Center activity streams; Right SLA and routing rail.
  - Can initiate supplier side threads with preserved recipient routing.
- **Operations Team Lead:**
  - Full queue visibility + unassigned triage queue + streaming CSV data export.
  - Ability to reopen terminal `Closed` cases.
  - Access to `/insights` analytics dashboard with 4 KPI cards and root-cause clustering.
