# OpsDesk Design System — "Airport Control Tower"

**Concept:** *"Calm, confident mission control for travel operations."*  
OpsDesk operators monitor this screen during continuous 8-hour dispatch shifts. The visual language evokes an airport control tower and flight departure boards: dark navy chrome framing a crisp, high-legibility light content area, energized by amber departure board accents and calm ocean teal highlights.

---

## 1. Color Tokens & CSS Variables

All colors are declared as CSS custom properties in `src/app/globals.css` and mapped to Tailwind utilities in `tailwind.config.ts`. All content colors are defined via variables so dark mode can be introduced seamlessly.

### 1.1 Control Tower Chrome (Top Bar & Sidebar)
| Token | Hex | Tailwind Utility | Role / Usage |
| :--- | :--- | :--- | :--- |
| `--chrome-navy-900` | `#0B1F2A` | `bg-chrome-navy-900` | Mission control top navigation bar and primary sidebar background |
| `--chrome-navy-800` | `#12303F` | `bg-chrome-navy-800` | Elevated chrome containers, active nav items, search input fill |
| `--chrome-text` | `#E6F1F5` | `text-chrome-text` | Primary readable label in chrome areas |
| `--chrome-muted` | `#8FB0BD` | `text-chrome-muted` | Secondary meta, unselected nav links, shortcut kbd cues in chrome |
| `--departure-amber` | `#FFB020` | `text-departure-amber` | Departure board accent, live split-flap characters, countdown beacons |

### 1.2 Canvas & Surfaces (Content Area)
| Token | Hex | Tailwind Utility | Role / Usage |
| :--- | :--- | :--- | :--- |
| `--canvas` | `#F5F7FA` | `bg-canvas` | Global application content backdrop |
| `--surface` | `#FFFFFF` | `bg-surface` | Elevated cards, tables, drawers, modals, dropdown menus |
| `--surface-subtle` | `#EEF2F6` | `bg-surface-subtle` | Table row hover, tab rails, subtle tracks, input disabled states |
| `--border` | `#E3E7ED` | `border-border` | Standard 1px container and table divider borders |
| `--border-strong` | `#CBD2DC` | `border-border-strong` | Active boundaries, focused dividers, input hover borders |

### 1.3 Text Hierarchy (WCAG 2.2 AA >= 4.5:1 on White)
| Token | Hex | Tailwind Utility | Contrast Ratio | Role / Usage |
| :--- | :--- | :--- | :---: | :--- |
| `--text-primary` | `#0F172A` | `text-content-primary` | 15.8:1 | Page titles, ticket titles, table identifiers, values |
| `--text-secondary` | `#475569` | `text-content-secondary` | 7.3:1 | Body copy, meta descriptions, form field labels, secondary items |
| `--text-tertiary` | `#64748B` | `text-content-tertiary` | 4.6:1 | Timestamps, table column labels, helper text, breadcrumbs |
| `--text-disabled` | `#94A3B8` | `text-content-disabled` | 2.9:1 | Disabled button labels, placeholders, inactive icons |

### 1.4 Brand Teal
Used strictly for primary buttons, active nav/tabs, hyperlinks, and keyboard focus rings:
| Token | Hex | Tailwind Utility | Role / Usage |
| :--- | :--- | :--- | :--- |
| `--brand-50` | `#ECFEFF` | `bg-brand-50` | Active tab count chip, selected row highlight, status open background |
| `--brand-100` | `#CFFAFE` | `bg-brand-100` | Subtle rings, hover states on brand items |
| `--brand-500` | `#0E9AA7` | `bg-brand-500` | Keyboard focus ring (`2px solid` with `2px offset`), key indicators |
| `--brand-600` | `#0B7F8B` | `bg-brand-600` | Primary action buttons (`Button variant="primary"`), active indicators |
| `--brand-700` | `#0A6772` | `bg-brand-700` | Primary button hover / active pressed states, dark accents |

### 1.5 SLA Semantic Matrix
> **Rule:** SLA status must **always** be rendered on a single line (`whitespace-nowrap`), paired with an icon and explicit text label. Color alone is never permitted.

| SLA Status | Icon | Text Hex | Background Hex | Tailwind Tokens | Countdown Behavior |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **On track** | `CheckCircle2` | `#15803D` | `#DCFCE7` | `text-sla-normal-text bg-sla-normal-bg` | "On track 3d 4h" or "On track 2h 14m" |
| **At risk** | `Clock` | `#B45309` | `#FEF3C7` | `text-sla-at_risk-text bg-sla-at_risk-bg` | "At risk 2h 14m" (urgent < 5m) |
| **Breached** | `AlertTriangle` | `#B91C1C` | `#FEE2E2` | `text-sla-breached-text bg-sla-breached-bg` | "Breached 10h 3m" (subtle pulse, pauses on hover) |
| **Escalated** | `ArrowUpCircle` | `#6D28D9` | `#EDE9FE` | `text-sla-escalated-text bg-sla-escalated-bg` | "Escalated 2h 14m" |
| **Stopped / Closed** | `PauseCircle` | `#64748B` | `#F1F3F6` | `text-sla-stopped-text bg-sla-stopped-bg` | "Stopped" or "Closed" (No countdown) |

- **Refresh Frequency:** Countdown updates every 30 seconds under normal conditions, accelerating to every 1 second when remaining time is less than 5 minutes.
- **Accessibility:** Emits `aria-live="polite"` only when the SLA status changes, avoiding repetitive screen reader chatter on ticks.

### 1.6 Region Tokens (Small Tags & Load Bars)
| Region | Code | Text Hex | Background Hex | Tailwind Class |
| :--- | :---: | :--- | :--- | :--- |
| **Middle East & Africa** | `MEA` | `#D97706` | `#FEF3C7` | `bg-region-mea-bg text-region-mea-text` |
| **Asia-Pacific** | `APAC` | `#0D9488` | `#CCFBF1` | `bg-region-apac-bg text-region-apac-text` |
| **Europe** | `EU` | `#2563EB` | `#DBEAFE` | `bg-region-eu-bg text-region-eu-text` |
| **Americas** | `AMER` | `#7C3AED` | `#EDE9FE` | `bg-region-amer-bg text-region-amer-text` |

### 1.7 Priority Marks & Chips (Neutral-to-Warm Tones)
> **Rule:** Pure alarm red is strictly reserved for Breached SLA. Priority chips use neutral-to-warm amber/ochre tones so they do not compete with critical SLA emergencies.

- **Urgent:** Ochre/warm amber dot (`#B45309` on `#FEF3C7`)
- **High:** Orange dot (`#C2410C` on `#FFEDD5`)
- **Medium:** Blue dot (`#1D4ED8` on `#DBEAFE`)
- **Low:** Slate dot (`#64748B` on `#F1F3F6`)

---

## 2. Typography Scale & Fonts

- **Headings Font:** `Plus Jakarta Sans` (`--font-heading`, sans-serif) for high-confidence operational headers.
- **UI Font:** `Inter` (`--font-inter`, sans-serif) with optical sizing and font feature settings `cv02`, `cv03`, `cv04`, `cv11`.
- **Data & Monospace Font:** `JetBrains Mono` (`--font-mono`, monospace) strictly paired with `font-variant-numeric: tabular-nums` for ticket IDs (`TCK-1001`), PNR/TBOH numbers, countdown timers, departure board characters, and metrics.

### Type Scale
| Scale Value | Font Size / Line Height | Tailwind Class | Usage |
| :---: | :---: | :--- | :--- |
| **11** | 11px / 14px (+0.05em tracking) | `text-11` / `text-micro-label` | Uppercase category tags, table header caps, metadata tags |
| **12** | 12px / 16px | `text-12` / `text-caption` | Chips, RegionTag, SlaBadge, helper text, Timeline labels |
| **13** | 13px / 20px | `text-13` / `text-table` | Table cells, queue rows, sidebar navigation labels |
| **14** | 14px / 20px | `text-14` / `text-body` | Standard body text, form inputs, notes, message threads |
| **16** | 16px / 24px | `text-16` / `text-section` | Card headers, section titles, modal headers |
| **20** | 20px / 28px | `text-20` / `text-page` | Primary page headers ("Operations Queue", "Insights & Themes") |
| **28** | 28px / 36px | `text-28` / `text-kpi` | High-impact metric numbers on KPI summary cards |

---

## 3. Spatial System, Radii & Shadows

- **Strict 4px Spatial Grid:** Layout and spacing dimensions must be exact multiples of 4px (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`).
- **Border Radii:**
  - `radius-input` / `radius-chip`: `6px` (form inputs, selects, chips, buttons)
  - `radius-card`: `10px` (KPI cards, content panels, table containers)
  - `radius-modal`: `14px` (modals, dialog cards, flyout drawers)
- **1px Crisp Borders:** All structural containers use 1px solid boundaries (`#E3E7ED` / `#CBD2DC`).
- **Elevation Shadows:**
  - `shadow-xs`: `0 1px 2px rgba(15, 23, 42, 0.04)` (Buttons, subtle interactive items)
  - `shadow-sm`: `0 1px 2px rgba(15, 23, 42, 0.06)` (Cards, input containers)
  - `shadow-md`: `0 4px 6px -1px rgba(15, 23, 42, 0.08)` (Dropdowns, popovers, toast alerts)
  - `shadow-lg`: `0 10px 15px -3px rgba(15, 23, 42, 0.08)` (Modals, flyout panels)
  - `shadow-glow`: `0 0 16px -2px var(--brand-500)` (Search bar focus state)

---

## 4. Interaction, Focus & Motion Rules

- **Motion Restraint:**
  - Animate `transform` and `opacity` only (never animate layout properties like width, height, margin, or padding).
  - **Zero layout shift on hover:** hovering an element must never move neighboring items.
  - Keyboard `:focus-visible` receives the identical visual cue as hover.
  - No hover-only information on touch devices.
- **Motion Durations:**
  - Micro-interactions & hover: `120ms` with `cubic-bezier(0, 0, 0.2, 1)`
  - Panel, Drawer, Dialog open/close: `180ms` with `cubic-bezier(0, 0, 0.2, 1)`
  - Tooltip reveal delay: `400ms`
- **Accessibility (`prefers-reduced-motion`):**
  - When reduced motion is preferred by the OS, all transition and animation durations collapse to `0.01ms`, button shines/wipes are disabled, and breached SLA pulses stop.
- **Keyboard Focus Ring:** Every interactive element displays a `2px solid var(--brand-500)` outline with `2px outline-offset` upon `:focus-visible`.

---

## 5. UI Primitives Inventory (`frontend/src/components/ui/`)

All primitives are exported from `frontend/src/components/ui/index.ts`:

1. **`Button`:**
   - Variants: `primary` (one-time shine sweep on hover, `active:scale-[0.98]`), `secondary`, `ghost`, `danger` (violet wipe hover), `outline`.
   - Sizes: `sm` (32px), `md` (36px).
   - Includes loading spinner slot and accessible disabled state with `disabledTooltip`.
2. **`IconButton`:**
   - Round bg fade-in, icon lifts 2px on hover (`hover:-translate-y-0.5`). Strictly enforces `aria-label`.
3. **`Input`, `Select`, `Textarea`:**
   - Unified 36px inputs with label, helperText, error state, and 2px brand focus rings.
4. **`Tabs`:**
   - Underline style with active indicator, count chip, and gliding underline indicator.
5. **`Chip`, `StatusChip`, `RegionTag`:**
   - Height 20-22px, 12px text, soft background, no borders.
   - RegionTag supports MEA, APAC, EU, AMER with regional color palettes.
6. **`PriorityMark`:**
   - Dot + label in neutral-to-warm tones (Urgent, High, Medium, Low).
7. **`SlaBadge`:**
   - Single line always (`whitespace-nowrap`), paired icon + label + mono countdown.
   - Breached pulses subtly (pauses on hover). Closed/Stopped muted slate without countdown.
8. **`SlaRing`:**
   - 16-20px circular SVG ring filling as deadline approaches; hover shows % elapsed and ticking seconds.
9. **`FlightPathTimeline` (Signature Graphic):**
   - Dotted arc/track NOW -> LCD Gate -> Check-in with a moving plane marker.
   - Plane turns amber approaching gate (< 2h) and red after gate breach.
   - Controlling deadline highlighted and labelled. Compact and full variants.
   - Re-exports `TravelTimeline` for complete backward compatibility.
10. **`DepartureBoard` & `SplitFlap`:**
    - Dark navy panel primitive with mechanical split-flap digit flip transition and amber mono text.
11. **`HealthBar`:**
    - Stacked SLA split bar with legend counts; segment hover thickens and dims others; click triggers filter callback.
12. **`SpotlightGlow`:**
    - Cursor-follow radial glow wrapper for cards.
13. **`KpiCard`:**
    - 28px numbers, hover lift 2px + "View" arrow, click filter callback.
14. **`Sparkline`:**
    - Inline SVG with hover guide line + value tooltip.
15. **`CommandPalette` (Ctrl/Cmd+K):**
    - Modal dialog to search tickets, jump to pages, or switch user identities.
16. **`BoardingPassCard`:**
    - Airport control tower themed card with perforated edge and barcode mono text.
17. **`Avatar`:**
    - Deterministic colors derived from user ID/name.
18. **`Card`, `Tooltip` (400ms delay), `Popover`, `Modal`, `Drawer`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `KeyValue` (TBOH copy with "Copied" tick), `Countdown`, `CountUp`:**
    - Complete suite of accessible operational components.

---

## 6. App Shell (`frontend/src/components/shell/`)

- **`TopNav`:**
  - 56px height (`h-14`), Navy-900 `#0B1F2A` dark chrome.
  - Geometric flight-path "O" logo mark with teal ring, flight arc, and departure amber beacon.
  - Center global search with Ctrl+K shortcut that glows with `shadow-glow` and widens slightly on focus.
  - Right role switcher with avatar, name, role, region, and a "can see" hint card explaining role permissions.
  - Dismissible 32px amber demo-auth banner.
  - Persistent API health check alert with retry countdown when backend is offline.
- **`Sidebar`:**
  - 232px width, Navy-900 `#0B1F2A` dark chrome, collapsible to 64px rail.
  - Expands on hover when collapsed (with tooltips on rail items).
  - Active item: `bg-chrome-navy-800` + 3px brand left bar (`border-l-[3px] border-brand-500`).
  - Hover: icon nudges 2px right (`group-hover:translate-x-0.5`).
  - Bottom: collapse toggle + "Region load" tiny bars (MEA, APAC, EU, AMER) showing regional operational load.
- **`Layout` (`frontend/src/app/layout.tsx`):**
  - Max-width 1440px container, accessible skip link to main content (`#main-content`), integrated shell components.

---

## 7. Design System Do & Don't Rules

### DO
- ✅ **DO** pair every SLA badge with an icon and explicit text label on a single line (`whitespace-nowrap`).
- ✅ **DO** use `font-mono-numbers` (`tabular-nums`) for all countdown timers, ticket IDs, and numeric metrics to prevent layout shifts.
- ✅ **DO** reserve pure alarm red exclusively for Breached SLA states.
- ✅ **DO** keep chips at 20-22px height with soft tinted backgrounds and zero borders.
- ✅ **DO** maintain strict 4px spacing alignment throughout all panels.
- ✅ **DO** respect role boundaries: hide operational internals (queue scores, internal notes) from external agency Requesters.
- ✅ **DO** provide clear empty, error, and loading skeleton states for every data list.

### DON'T
- ❌ **DON'T** use saturated gradients or bright hero graphics that cause eye strain during 8-hour operator shifts.
- ❌ **DON'T** rely on color alone to indicate SLA breaches or risks.
- ❌ **DON'T** introduce heavy external component libraries or animation engines (e.g., framer-motion).
- ❌ **DON'T** let countdown ticks jiggle or shift table row widths.
- ❌ **DON'T** animate layout properties (e.g. width/height) on hover — animate `transform` and `opacity` only.
- ❌ **DON'T** show internal operational diagnostics to external agency Requesters.
