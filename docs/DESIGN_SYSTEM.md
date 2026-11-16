# OpsDesk Design System

**Concept:** *"Calm mission control for travel operations."*  
OpsDesk operators monitor this screen for 8-hour continuous shifts. The visual language prioritizes **low visual noise**, **deterministic status signalling**, and **dense yet breathable information rhythm**.

---

## 1. Color Tokens & CSS Variables

All colors are declared as CSS custom properties in `src/app/globals.css` and mapped to Tailwind utilities in `tailwind.config.ts`.

### 1.1 Canvas & Surfaces
| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| `--canvas` | `#F7F8FA` | `bg-canvas` | Global application backdrop |
| `--surface` | `#FFFFFF` | `bg-surface` | Primary elevated cards, modals, tables |
| `--surface-subtle` | `#F1F3F6` | `bg-surface-subtle` | Table row hover, tab rails, subtle tracks |
| `--border` | `#E3E7ED` | `border-border` | Standard 1px container borders |
| `--border-strong` | `#CBD2DC` | `border-border-strong` | Focus boundaries, dividers, active tabs |

### 1.2 Text Hierarchy (WCAG 2.2 AA Compliance >= 4.5:1 on White)
| Token | Hex | Tailwind Class | Contrast Ratio | Usage |
| :--- | :--- | :--- | :---: | :--- |
| `--text-primary` | `#0F172A` | `text-content-primary` | 15.8:1 | Page titles, primary ticket titles, headers |
| `--text-secondary` | `#475569` | `text-content-secondary` | 7.3:1 | Body copy, meta descriptions, form labels |
| `--text-tertiary` | `#64748B` | `text-content-tertiary` | 4.6:1 | Timestamps, table column labels, helper text |
| `--text-disabled` | `#94A3B8` | `text-content-disabled` | 2.9:1 | Disabled button labels and inactive icons |

### 1.3 Brand Palette (Ocean Teal)
| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| `--brand-50` | `#ECFEFF` | `bg-brand-50` | Active navigation pill, selected item background |
| `--brand-100` | `#CFFAFE` | `bg-brand-100` | Accent chips, subtle highlighted states |
| `--brand-500` | `#0E9AA7` | `bg-brand-500` | Focus rings, key visual indicators |
| `--brand-600` | `#0B7F8B` | `bg-brand-600` | Primary action buttons (`Button primary`) |
| `--brand-700` | `#0A6772` | `bg-brand-700` | Primary button hover and active pressed state |

### 1.4 SLA Semantic Matrix
> **Rule:** SLA status must **always** be paired with an icon and explicit text label. Color alone is never permitted.

| SLA Status | Icon | Text Hex | Background Hex | Tailwind Tokens |
| :--- | :---: | :--- | :--- | :--- |
| **NORMAL** | `CheckCircle2` | `#15803D` | `#DCFCE7` | `text-sla-normal-text bg-sla-normal-bg` |
| **AT_RISK** | `Clock` / `AlertTriangle` | `#B45309` | `#FEF3C7` | `text-sla-at_risk-text bg-sla-at_risk-bg` |
| **BREACHED** | `AlertOctagon` | `#B91C1C` | `#FEE2E2` | `text-sla-breached-text bg-sla-breached-bg` |
| **ESCALATED** | `ArrowUpCircle` | `#6D28D9` | `#EDE9FE` | `text-sla-escalated-text bg-sla-escalated-bg` |

### 1.5 Priority & Status Semantic Tokens
- **Priority:**
  - `Urgent`: Red (`#B91C1C` on `#FEE2E2`)
  - `High`: Orange (`#C2410C` on `#FFEDD5`)
  - `Medium`: Blue (`#1D4ED8` on `#DBEAFE`)
  - `Low`: Slate (`#475569` on `#F1F5F9`)
- **Status:**
  - `New`: Blue (`#1D4ED8` on `#EFF6FF`)
  - `Open`: Teal (`#0E9AA7` on `#ECFEFF`)
  - `Pending`: Amber (`#B45309` on `#FEF3C7`)
  - `Escalated`: Violet (`#6D28D9` on `#EDE9FE`)
  - `Resolved`: Green (`#15803D` on `#DCFCE7`)
  - `Closed`: Slate (`#475569` on `#F1F5F9`)

---

## 2. Typography Scale & Fonts

- **UI Font:** `Inter` (`--font-inter`, sans-serif) with optical sizing and font feature settings `cv02`, `cv03`, `cv04`, `cv11`.
- **Data & Monospace Font:** `JetBrains Mono` (`--font-mono`, monospace) strictly paired with `font-variant-numeric: tabular-nums` for:
  - Ticket IDs (`TCK-1001`)
  - TBOH References (`TBOH-94819`)
  - Live countdown timers (`2h 14m`, `overdue 35m`)
  - Timestamps and queue scores.

### Scale Table
| Token | Size / Line Height | Font Weight | Usage |
| :--- | :---: | :---: | :--- |
| `caption` | 12px / 16px | 400 or 500 | Badge labels, helper messages, table captions |
| `table` | 13px / 20px | 400 or 500 | Table cell content, meta rows, sidebar items |
| `body` | 14px / 20px | 400 or 500 | Default body text, dialog inputs, notes |
| `section` | 16px / 24px | 500 or 600 | Card titles, section headers, tab labels |
| `page` | 20px / 28px | 600 | Page header titles |
| `kpi` | 28px / 36px | 600 | Metric numbers on analytics cards |
| `micro-label` | 11px / 14px | 500 (Uppercase, +0.05em tracking) | Section category tags, table header caps |

---

## 3. Spacing, Geometry & Elevation

- **4px Spatial Grid:** All spacing must adhere strictly to multiples of 4px: `4px` (0.25rem), `8px` (0.5rem), `12px` (0.75rem), `16px` (1rem), `24px` (1.5rem), `32px` (2rem), `48px` (3rem).
- **Border Radii:**
  - `radius-input`: `6px` (form inputs, badges, filter chips)
  - `radius-card`: `10px` (content panels, KPI cards, table containers)
  - `radius-modal`: `14px` (dialogs, flyouts, drawers)
- **Shadows:**
  - `shadow-sm`: `0 1px 2px rgba(15, 23, 42, 0.06)` (Cards, input fields)
  - `shadow-md`: `0 4px 6px -1px rgba(15, 23, 42, 0.08)` (Dropdowns, popovers)
  - `shadow-lg`: `0 10px 15px -3px rgba(15, 23, 42, 0.08)` (Modal dialogs)

---

## 4. Interaction, Focus & Motion Tokens

- **Focus Ring:** Every interactive element must display a `2px solid var(--brand-500)` outline with `2px outline-offset` upon `:focus-visible`.
- **Motion Durations:**
  - Hover states: `120ms` with `cubic-bezier(0, 0, 0.2, 1)`
  - Panel / Drawer slide-in: `180ms` with `cubic-bezier(0, 0, 0.2, 1)`
- **Accessibility (`prefers-reduced-motion`):** When user system preference is set to reduced motion, all transition and animation durations collapse to `0.01ms`.

---

## 5. Design System "Do & Don't" Guide

### DO
- ✅ **DO** pair every SLA and priority badge with an icon and explicit text.
- ✅ **DO** use `font-mono-numbers` (`tabular-nums`) for all countdown timers, dates, ticket IDs, and TBOH references so text doesn't jiggle.
- ✅ **DO** keep primary buttons strictly at `bg-brand-600` (hover `bg-brand-700`).
- ✅ **DO** respect role boundaries: if a Requester is logged in, hide all queue scores, routing explanations, and internal note options completely (no empty disabled placeholders).
- ✅ **DO** provide clear empty, error, and loading skeleton states for every data list.

### DON'T
- ❌ **DON'T** use saturated gradients or bright hero graphics that cause eye strain during 8-hour operator shifts.
- ❌ **DON'T** rely on color alone to indicate SLA breaches or risks.
- ❌ **DON'T** add third-party component libraries or animation engines (framer-motion).
- ❌ **DON'T** allow table numbers to jump in width during live countdown ticks.
- ❌ **DON'T** show internal operational diagnostics to external agency Requesters.

---

## 6. Primitives & Components Inventory (`src/components/ui`)

| Primitive | Role & Variants | Key Behavior |
| :--- | :--- | :--- |
| `Button` | `primary`, `secondary`, `ghost`, `danger`, `outline` | 44px min touch target, spinner loading, icon slot |
| `IconButton` | `primary`, `secondary`, `ghost`, `danger` | Square aspect ratio, `aria-label` required |
| `Input` / `Textarea` | Standard, error, disabled, helper text | 2px brand focus ring with 2px offset |
| `Select` | Typed options array, placeholder, error state | Dropdown with custom SVG arrow |
| `Tabs` | Horizontal pill tabs with count badges | Role-aware filtering, accessible keyboard tab |
| `SlaBadge` | `NORMAL`, `AT_RISK`, `BREACHED`, `STOPPED`, `ESCALATED` | Live countdown in tabular mono numbers, `aria-live="polite"` state announce |
| `PriorityChip` | `Urgent`, `High`, `Medium`, `Low` | Soft tinted chips with border |
| `StatusChip` | `New`, `Open`, `Pending`, `Escalated`, `Resolved`, `Closed` | Calm, muted operational tinting |
| `Avatar` | Size `sm`, `md`, `lg` | Deterministic background color generated via string hash |
| `Card` | Padding `none`, `sm`, `md`, `lg` | 10px radius, 1px border, subtle shadow-sm |
| `Modal` / `Drawer` | MaxWidth `sm` to `xl`, Width `sm` to `lg` | 14px radius, focus trap, body scroll lock, Esc to close |
| `TravelTimeline` | Horizontal deadline track | NOW to Check-in with LCD marker; controlling deadline highlighted in 12px mono badge |
| `EmptyState` / `ErrorState` | Calm operational copy + action CTA | Custom SVG illustration, retry action |
| `KeyValue` | Label + value with copyable mono text | Clipboard copy button with tick feedback |

---

## 7. QA Verification Matrix (Phase 8 Audit)

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

