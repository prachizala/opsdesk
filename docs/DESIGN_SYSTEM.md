# OpsDesk Design System

**Concept:** *"Calm mission control for travel operations."*  
OpsDesk operators monitor this screen during 8-hour continuous shifts. The visual language prioritizes **low visual noise**, **deterministic status signalling**, and a **dense yet breathable information rhythm**.

---

## 1. Color Tokens & CSS Variables

All colors are declared as CSS custom properties in `src/app/globals.css` and mapped to Tailwind utilities in `tailwind.config.ts`.

### 1.1 Canvas & Surfaces
| Token | Hex | Tailwind Utility | Role / Usage |
| :--- | :--- | :--- | :--- |
| `--canvas` | `#F7F8FA` | `bg-canvas` | Global application page backdrop |
| `--surface` | `#FFFFFF` | `bg-surface` | Primary elevated cards, modals, tables, top navigation |
| `--surface-subtle` | `#F1F3F6` | `bg-surface-subtle` | Table row hover, tab rails, subtle tracks, input disabled states |
| `--border` | `#E3E7ED` | `border-border` | Standard 1px container and table divider borders |
| `--border-strong` | `#CBD2DC` | `border-border-strong` | Active boundaries, focused dividers, input hover borders |

### 1.2 Text Hierarchy (WCAG 2.2 AA Compliance >= 4.5:1 on White)
| Token | Hex | Tailwind Utility | Contrast Ratio | Role / Usage |
| :--- | :--- | :--- | :---: | :--- |
| `--text-primary` | `#0F172A` | `text-content-primary` | 15.8:1 | Page titles, primary ticket titles, table identifiers, values |
| `--text-secondary` | `#475569` | `text-content-secondary` | 7.3:1 | Body copy, meta descriptions, form field labels, secondary items |
| `--text-tertiary` | `#64748B` | `text-content-tertiary` | 4.6:1 | Timestamps, table column labels, helper text, breadcrumbs |
| `--text-disabled` | `#94A3B8` | `text-content-disabled` | 2.9:1 | Disabled button labels, placeholders, inactive icons |

### 1.3 Brand Palette (Ocean Teal)
| Token | Hex | Tailwind Utility | Role / Usage |
| :--- | :--- | :--- | :--- |
| `--brand-50` | `#ECFEFF` | `bg-brand-50` | Active navigation pill, active tab count chip, selected row highlight |
| `--brand-100` | `#CFFAFE` | `bg-brand-100` | Accent badges, subtle rings, hover states on brand items |
| `--brand-500` | `#0E9AA7` | `bg-brand-500` | Keyboard focus ring (`2px solid` with `2px offset`), key indicators |
| `--brand-600` | `#0B7F8B` | `bg-brand-600` | Primary action buttons (`Button variant="primary"`), active indicators |
| `--brand-700` | `#0A6772` | `bg-brand-700` | Primary button hover / active pressed states, dark accents |

### 1.4 SLA Semantic Matrix
> **Rule:** SLA status must **always** be rendered on a single line (`whitespace-nowrap`), paired with an icon and explicit text label. Color alone is never permitted.

| SLA Status | Icon | Text Hex | Background Hex | Tailwind Tokens | Countdown Behavior |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **On track** | `CheckCircle2` | `#15803D` | `#DCFCE7` | `text-sla-normal-text bg-sla-normal-bg` | "On track 3d 4h" or "On track 2h 14m" |
| **At risk** | `Clock` | `#B45309` | `#FEF3C7` | `text-sla-at_risk-text bg-sla-at_risk-bg` | "At risk 2h 14m" (urgent < 5m) |
| **Breached** | `AlertTriangle` | `#B91C1C` | `#FEE2E2` | `text-sla-breached-text bg-sla-breached-bg` | "Breached 10h 3m" (red pulse on SlaRing) |
| **Escalated** | `ArrowUpCircle` | `#6D28D9` | `#EDE9FE` | `text-sla-escalated-text bg-sla-escalated-bg` | "Escalated 2h 14m" |
| **Stopped / Closed** | `PauseCircle` | `#64748B` | `#F1F3F6` | `text-sla-stopped-text bg-sla-stopped-bg` | "Stopped" or "Closed" (No countdown) |

- **Refresh Frequency:** Countdown updates every 30 seconds under normal conditions, and accelerates to every 1 second when remaining time is less than 5 minutes.
- **Accessibility:** Emits `aria-live="polite"` only when the SLA status changes, avoiding repetitive screen reader chatter on ticks.

### 1.5 Priority Chips (Soft Tint, No Border)
Chips are compact 20-22px height, 12px text, soft background, without harsh borders:
- **Urgent:** Red (`#B91C1C` text on `#FEE2E2` background)
- **High:** Orange (`#C2410C` text on `#FFEDD5` background)
- **Medium:** Blue (`#1D4ED8` text on `#DBEAFE` background)
- **Low:** Slate (`#64748B` text on `#F1F3F6` background)

### 1.6 Status Chips (Soft Tint, No Border)
- **New:** Blue (`#1D4ED8` text on `#EFF6FF` background)
- **Open:** Teal (`#0E9AA7` text on `#ECFEFF` background)
- **Pending:** Amber (`#B45309` text on `#FEF3C7` background)
- **Escalated:** Violet (`#6D28D9` text on `#EDE9FE` background)
- **Resolved:** Green (`#15803D` text on `#DCFCE7` background)
- **Closed:** Slate (`#64748B` text on `#F1F3F6` background)

---

## 2. Typography Scale & Fonts

- **UI Font:** `Inter` (`--font-inter`, sans-serif) with optical sizing and font feature settings `cv02`, `cv03`, `cv04`, `cv11`.
- **Data & Monospace Font:** `JetBrains Mono` (`--font-mono`, monospace) strictly paired with `font-variant-numeric: tabular-nums` for:
  - Ticket IDs (`TCK-1001`)
  - Booking & TBOH References (`TBOH-94819`)
  - Live countdown timers (`Breached 10h 3m`, `At risk 2h 14m`, `On track 3d 4h`)
  - Timestamps, queue scores, metrics.

### Type Scale
| Scale Value | Font Size / Line Height | Tailwind Class | Usage |
| :---: | :---: | :--- | :--- |
| **11** | 11px / 14px (+0.05em letter spacing) | `text-11` / `text-micro-label` | Section category tags, table header caps, metadata tags |
| **12** | 12px / 16px | `text-12` / `text-caption` | Chips, SlaBadge, helper text, TravelTimeline labels |
| **13** | 13px / 20px | `text-13` / `text-table` | Table cells, queue rows, sidebar navigation labels |
| **14** | 14px / 20px | `text-14` / `text-body` | Standard body text, form inputs, notes, message threads |
| **16** | 16px / 24px | `text-16` / `text-section` | Card headers, section titles, modal headers |
| **20** | 20px / 28px | `text-20` / `text-page` | Primary page headers ("Operations Queue", "Insights") |
| **28** | 28px / 36px | `text-28` / `text-kpi` | High-impact metric numbers on KPI summary cards |

---

## 3. Spatial System, Radii & Shadows

- **Strict 4px Spatial Grid:** All spacing and layout dimensions must be exact multiples of 4px: `4px` (0.25rem), `8px` (0.5rem), `12px` (0.75rem), `16px` (1rem), `20px` (1.25rem), `24px` (1.5rem), `32px` (2rem), `48px` (3rem).
- **Border Radii:**
  - `radius-input` / `radius-chip`: `6px` (form inputs, selects, chips, buttons)
  - `radius-card`: `10px` (KPI cards, content panels, table containers)
  - `radius-modal`: `14px` (modals, dialog cards, flyout drawers)
- **Elevation Shadows:**
  - `shadow-xs`: `0 1px 2px rgba(15, 23, 42, 0.04)` (Buttons, subtle interactive items)
  - `shadow-sm`: `0 1px 2px rgba(15, 23, 42, 0.06)` (Cards, input containers)
  - `shadow-md`: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)` (Dropdowns, popovers, toast alerts)
  - `shadow-lg`: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` (Modals, flyout panels)

---

## 4. Interaction, Focus & Motion

- **Keyboard Focus Ring:** Every interactive element must display a `2px solid var(--brand-500)` outline with `2px outline-offset` upon `:focus-visible`.
- **Motion Durations:**
  - Hover states: `120ms` with `cubic-bezier(0, 0, 0.2, 1)`
  - Panel / Drawer / Dialog slide & fade: `180ms` with `cubic-bezier(0, 0, 0.2, 1)`
- **Accessibility (`prefers-reduced-motion`):** When user system preference is set to reduced motion, all transition and animation durations collapse to `0.01ms`, and the breached SLA red pulse stops.

---

## 5. UI Primitives Inventory (`frontend/src/components/ui/`)

All primitives are exported from `frontend/src/components/ui/index.ts`:

1. **`Button`:**
   - Variants: `primary`, `secondary`, `ghost`, `danger`, `outline`
   - Sizes: `sm` (32px), `md` (36px)
   - Supports `loading` spinner and icon slots (`iconPosition="left" | "right"`)
2. **`IconButton`:**
   - Sizes `sm` (32px), `md` (36px), strictly enforces accessible `aria-label`
3. **`Input`, `Select`, `Textarea`:**
   - Unified 36px inputs with label, helperText, error state, and 2px brand focus rings
4. **`Tabs`:**
   - Underline style with active indicator and mono count chips (`variant="underline" | "pill"`)
5. **`Chip`, `PriorityChip`, `StatusChip`:**
   - Height 20-22px, 12px text, soft background, no borders
6. **`SlaBadge`:**
   - Single line always (`whitespace-nowrap`), paired icon + label + mono countdown
   - Closed/Stopped states are muted slate without countdown
7. **`SlaRing`:**
   - Small 16-20px circular progress SVG next to the badge, filling as deadline approaches
   - Subtle red pulse only when breached (respects reduced motion)
8. **`TravelTimeline`:**
   - Horizontal 8px rounded track: NOW -> LCD -> Check-in
   - LCD marker, controlling deadline highlighted & labelled, past greyed out, 12px labels
   - Supports both `compact` (~20px height for table rows) and `full` variants (for ticket details)
   - Dates supplied as props, no API calls
9. **`Sparkline`:**
   - Pure inline SVG sparkline, stroke only, zero external libraries
10. **`KpiCard`:**
    - Label, 28px number, optional inline Sparkline, optional delta badge only when data is provided
11. **`Avatar`, `Card`, `Tooltip`, `Modal`, `Drawer`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `KeyValue`, `Countdown`:**
    - Fully accessible, theme-coherent operational components

---

## 6. App Shell (`frontend/src/components/shell/`)

- **`TopNav`:**
  - 56px height (`h-14`)
  - Geometric flight-path "O" logo mark SVG + "OpsDesk"
  - Center Ctrl+K global search bar
  - Right role switcher showing avatar, name, role, agency/region
  - Slim amber demo-auth banner (32px, `h-8`) dismissible per session
  - Persistent API unreachable alert banner when backend is offline
- **`Sidebar`:**
  - 232px width (`w-[232px]`), collapsible to 64px icon rail (`w-16`) with in-memory state
  - Items: Operations Queue, Insights (with RBAC visibility)
  - Active item: `bg-brand-50` background + 3px brand left bar (`border-l-[3px] border-brand-600`)
  - Bottom collapse / expand toggle button
- **`Layout` (`frontend/src/app/layout.tsx`):**
  - Max-width 1440px container, 24px padding (`px-6 py-6`), integrated shell components

---

## 7. Design System Do & Don't Rules

### DO
- ✅ **DO** pair every SLA badge with an icon and explicit text label on a single line (`whitespace-nowrap`).
- ✅ **DO** use `font-mono-numbers` (`tabular-nums`) for all countdown timers, ticket IDs, and numeric metrics to prevent layout shifts.
- ✅ **DO** keep chips at 20-22px height with soft tinted backgrounds and zero borders.
- ✅ **DO** maintain strict 4px spacing alignment throughout all panels.
- ✅ **DO** respect role boundaries: hide operational internals (queue scores, internal notes) from external agency Requesters.
- ✅ **DO** provide clear empty, error, and loading skeleton states for every data list.

### DON'T
- ❌ **DON'T** use saturated gradients or bright hero graphics that cause eye strain during 8-hour operator shifts.
- ❌ **DON'T** rely on color alone to indicate SLA breaches or risks.
- ❌ **DON'T** introduce heavy external component libraries or animation engines (e.g., framer-motion).
- ❌ **DON'T** let countdown ticks jiggle or shift table row widths.
- ❌ **DON'T** show internal operational diagnostics to external agency Requesters.
