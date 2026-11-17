# OpsDesk Design System — "Control Tower, Udaan Palette"

**Concept:** *"Calm, authoritative mission control for high-velocity travel operations."*  
OpsDesk operators monitor this dispatch surface during continuous 8-hour dispatch shifts. The visual language evokes an airport control tower and flight departure boards: dark navy chrome framing a crisp, high-contrast operational surface, energized by warm Udaan orange accents and departure board amber indicators.

Both **Light Mode** and **Dark Mode** are first-class, fully supported environments with zero flash on load.

---

## 1. Color System & Semantic Tokens

All color values are defined as CSS variables on `:root` (Light mode) and `[data-theme="dark"]` / `.dark` (Dark mode) in `src/app/globals.css`, and mapped to Tailwind utilities in `tailwind.config.ts`.

### 1.1 Complete Color Palette Matrix

| Token | Light Mode Hex | Dark Mode Hex | Role / WCAG Notes |
| :--- | :--- | :--- | :--- |
| `--canvas` | `#F8FAFC` | `#0B1120` | Root application backdrop |
| `--surface` | `#FFFFFF` | `#0F172A` | Elevated cards, tables, drawers, modals, floating pill bars |
| `--surface-subtle` | `#F1F5F9` | `#1E293B` | Table row hover, tab rails, input disabled fills |
| `--border` | `#E2E8F0` | `#1E293B` | Container and divider borders |
| `--border-strong` | `#CBD5E1` | `#334155` | Active inputs, table headers, hover borders |
| `--text-primary` | `#0F172A` (Navy) | `#F1F5F9` | Page titles, ticket identifiers, primary values (Contrast >= 15:1) |
| `--text-secondary` | `#475569` | `#CBD5E1` | Body copy, form field labels, secondary metadata (Contrast >= 7:1) |
| `--text-tertiary` | `#64748B` | `#94A3B8` | Timestamps, column caps, breadcrumbs (Contrast >= 4.5:1) |
| `--text-disabled` | `#94A3B8` | `#64748B` | Disabled labels, placeholder text |
| `--brand-orange` | `#EA580C` | `#F97316` | Brand accent fills, icons, large text (>=24px or 18.66px bold) |
| `--brand-orange-text` | `#C2410C` | `#FB923C` | Small orange text on light (5.2:1 contrast against `#FFFFFF`) |
| `--brand-50` | `#FFF7ED` | `rgba(249, 115, 22, 0.14)` | Soft tint backgrounds for badges, active tabs |
| `--brand-100` | `#FFEDD5` | `rgba(249, 115, 22, 0.22)` | Subtle borders on orange chips |
| `--orange-tint` | `rgba(234, 88, 12, 0.08)` | `rgba(249, 115, 22, 0.14)` | Ambient highlights |
| `--chrome-navy-900` | `#0F172A` | `#0F172A` | Sidebar island, primary button fill, departure board panel |
| `--chrome-navy-800` | `#1E293B` | `#1E293B` | Active sidebar item fill, elevated dark panels |
| `--departure-amber` | `#FFB020` | `#FACC15` | Departure board split-flap characters, countdown beacons |

### 1.2 Contrast Rules (WCAG 2.2 AA Mandatory)
- **White text on `#EA580C` fails AA!** Never place white text on brand orange fills.
- **Orange fills ALWAYS carry navy `#0F172A` text** (`5:1` contrast ratio).
- **Small orange text on light backgrounds** must use `#C2410C` (`5.2:1` contrast ratio).
- In dark mode, `#F97316` fills carry `#0F172A` navy text, achieving `5:1` contrast.

---

## 2. SLA Semantic Matrix & Status Colors

> **CRITICAL RULE:** Never convey status with color alone. Status indicators must **always** include an explicit icon and text label.

| SLA Status | Icon | Light Mode (Text on BG) | Dark Mode (Text on BG) | Behavior |
| :--- | :---: | :--- | :--- | :--- |
| **On track** | `CheckCircle2` | `#15803D` on `#DCFCE7` | `#4ADE80` on `rgba(74,222,128,0.14)` | Calm green status indicator |
| **At risk** | `Clock` | `#A16207` on `#FEF9C3` | `#FACC15` on `rgba(250,204,21,0.14)` | **Yellow/amber (distinct from brand orange!)** |
| **Breached** | `AlertTriangle` | `#B91C1C` on `#FEE2E2` | `#F87171` on `rgba(248,113,113,0.14)` | **The ONLY red element in the entire system.** Subtle pulse animation (pauses on hover) |
| **Escalated** | `ArrowUpCircle` | `#6D28D9` on `#EDE9FE` | `#A78BFA` on `rgba(167,139,250,0.14)` | Deep violet indicator |
| **Stopped / Closed** | `PauseCircle` | `#64748B` on `#F1F5F9` | `#94A3B8` on `#1E293B` | Muted slate; **no countdown displayed** |

- **SlaBadge:** Must **always** render on ONE line (`whitespace-nowrap`, `min-width`), combining `icon + label + mono countdown`.
- **SlaRing:** 16-20px circular ring that fills as deadline nears; on hover, shows `%` and ticking seconds.

---

## 3. Priority Mark & Region System

### 3.1 PriorityMark (Slate Tones Only)
> **CRITICAL RULE:** **NO RED OR ORANGE PRIORITY CHIPS.** Red is reserved strictly for SLA Breached. Priority indicators use muted slate tones with directional chevron icons.

| Priority | Icon | Light Mode Tones | Dark Mode Tones |
| :--- | :---: | :--- | :--- |
| **Urgent** | `ChevronsUp` (double chevron up) | `text-slate-800 bg-slate-200/80 font-semibold` | `text-slate-100 bg-slate-800 font-semibold` |
| **High** | `ChevronUp` (chevron up) | `text-slate-700 bg-slate-100 font-medium` | `text-slate-300 bg-slate-800/80 font-medium` |
| **Medium** | `Minus` (dash) | `text-slate-600 bg-slate-100/70 font-medium` | `text-slate-400 bg-slate-800/60 font-medium` |
| **Low** | `ChevronDown` (chevron down) | `text-slate-500 bg-slate-100/50 font-normal` | `text-slate-500 bg-slate-800/40 font-normal` |

### 3.2 Region Tags (Four Muted Hues)
- **MEA (Middle East & Africa):** Muted ochre (`#B45309` on `#FEF3C7` / Dark: `#FBBF24` on `rgba(245,158,11,0.14)`)
- **APAC (Asia-Pacific):** Muted teal (`#0D9488` on `#CCFBF1` / Dark: `#2DD4BF` on `rgba(45,212,191,0.14)`)
- **EU (Europe):** Muted blue (`#2563EB` on `#DBEAFE` / Dark: `#60A5FA` on `rgba(96,165,250,0.14)`)
- **AMER (Americas):** Muted purple (`#7C3AED` on `#EDE9FE` / Dark: `#C084FC` on `rgba(192,132,252,0.14)`)

---

## 4. Theme Switching Architecture

- **Tokens:** Defined on `:root` and `[data-theme="dark"]` / `.dark`.
- **Zero Flash on Load:** An inline blocking script executes synchronously in `<head>` before first paint, evaluating `localStorage.getItem('opsdesk_theme')` with fallback to `window.matchMedia('(prefers-color-scheme: dark)')`.
- **ThemeToggle:** Segmented pill control in TopNav with three modes: **Light** (`Sun`), **Dark** (`Moon`), and **System** (`Monitor`). Default is **System**.
- **Persistence:** Persists choice to `localStorage` wrapped in a `try/catch` block.
- **Smooth Transition:** 200ms ease for color, border-color, and background-color. Disabled completely when `prefers-reduced-motion: reduce` is active.

---

## 5. Typography Scale & Headline Pattern

### 5.1 Next.js Font Optimization
- **Headings Font:** `Plus Jakarta Sans` (`--font-heading`, `font-heading`)
- **UI Font:** `Inter` (`--font-inter`, `font-sans`)
- **Monospace Font:** `JetBrains Mono` (`--font-mono`, `font-mono-numbers`, `tabular-nums`) for IDs, timestamps, countdowns, departure characters.

### 5.2 Signature Headline Pattern (Page H1)
Page headers must follow the signature two-tone headline pattern:
1. **Small Eyebrow Label Above:** 11px uppercase tracking-wider font in brand orange (`text-brand-orange-text dark:text-brand-orange`), e.g., `"LIVE OPERATIONS"`.
2. **Two-Tone H1 Title:** Main title word in navy primary text + emphasis word in **orange italic** (`text-brand-orange-text dark:text-brand-orange italic font-heading`), e.g., `"Operations "` + `italic("Queue")`.

---

## 6. Shape Language, Radii & Spacing

### 6.1 Pill Language
- **Buttons, chips, tabs, top bar, and tags are fully rounded pills** (`rounded-full`).
- **Chips:** 20-22px height, 12px text, soft tint background, no border.

### 6.2 Surface Radii Scale
- **Major Panels (24px):** Departure board, health bar panel, sidebar island (`rounded-[24px]` / `rounded-panel`).
- **Modals (24px):** Modal dialog cards (`rounded-[24px]` / `rounded-modal`).
- **Data Cards (12px):** Metric KPI cards, ticket preview drawer, table container (`rounded-[12px]` / `rounded-card`).
- **Inputs (8px):** Form input fields, textareas, selects (`rounded-[8px]` / `rounded-input`).

### 6.3 Focus Ring
- Strict **2px solid orange ring** (`#EA580C` in light / `#FB923C` in dark) with **2px offset** on all focusable elements.

---

## 7. Signature Components & Shell Architecture

### 7.1 Primary Button (Signature)
- **Light Mode:** Navy pill (`#0F172A`), white text, trailing `ArrowUpRight` icon. On hover, the fill wipes smoothly from left to right with brand orange (`#EA580C`), text flips to navy (`#0F172A`), and the arrow nudges up-right by 2px (`translate-x-0.5 -translate-y-0.5`).
- **Dark Mode:** Orange fill (`#F97316`) with navy text (`#0F172A`). On hover, background lightens to `#FB923C` and the arrow nudges up-right 2px.
- **Secondary Button:** Surface fill with standard border; on hover, border transitions to brand orange.

### 7.2 Floating Pill TopNav
- Sticky top with 12-16px margin from edges.
- Floating pill structure: `bg-surface/95 backdrop-blur-md rounded-full border border-border shadow-sm px-4 sm:px-6 h-14`.
- Geometric flight-path "O" logo mark SVG + "OpsDesk" wordmark.
- Global search pill with `Ctrl+K` hint badge.
- `ThemeToggle` segmented control.
- Role switcher with avatar, name, role, region tag, and hover card.
- Slim 32px demo-auth banner, dismissible per session.

### 7.3 Navy Sidebar Island
- Independent island with `rounded-[24px]` and 12px margin.
- Stays dark navy (`#0F172A`) in both light and dark modes.
- Width: 232px; collapsible to 64px rail.
- When collapsed, smoothly expands on hover with tooltips.

### 7.4 FlightPathTimeline
- Dotted track: `NOW` -> `LCD Gate` -> `Check-in` with moving small plane marker.
- Plane marker is brand orange (`#EA580C` / `#F97316`).
- Turns yellow-amber (`#A16207` / `#FACC15`) approaching gate (< 2h).
- Turns red (`#B91C1C` / `#F87171`) after passing gate.
- Controlling deadline clearly highlighted and labelled.
- Available in compact (table row, overflow-hidden) and full (ticket) variants.

### 7.5 DepartureBoard & SplitFlap
- Large 24px-rounded navy panel (`#0F172A` / `#0B1120`). Stays navy in both modes.
- Amber mono text (`#FFB020` / `#FACC15`) with 3D split-flap flip animation.

### 7.6 SegmentedTabs & Tabs
- `SegmentedTabs`: Pill container with sliding navy (light) / orange (dark) indicator gliding between items.
- `Tabs`: Underline variant with gliding orange underline indicator.

---

## 8. Interaction & Motion Rules (Hard Constraints)

1. **NO POINTER-POSITION EFFECTS:**
   - No cursor-following spotlight or glow.
   - No 3D tilt, no parallax, no magnetic snapping, no custom cursor.
   - Hover triggers strictly on enter/leave; never track mouse coordinates (`e.clientX`, `rect.left`).
   - `SpotlightGlow` is a clean static or subtle wrapper without mouse coordinate tracking.

2. **Motion Constraints:**
   - Animate `transform` and `opacity` only (plus color / background transitions).
   - **NO layout shifts on hover** (never expand padding, margins, or dimensions on hover).
   - Under `prefers-reduced-motion: reduce`, all animations and transitions are disabled (`duration: 0.01ms !important`).
   - Keyboard focus must receive the same visual feedback as hover.
   - No hover-only information on touch surfaces.

---

## 9. Do's and Don'ts Checklist

| Do | Don't |
| :--- | :--- |
| **DO** render SLA status on ONE line with an icon, label, and mono countdown. | **DON'T** wrap SLA badges across multiple lines or rely solely on color. |
| **DO** reserve red (`#B91C1C` / `#F87171`) strictly for Breached SLA. | **DON'T** use red for urgent priority chips, buttons, or error borders. |
| **DO** use PriorityMark in muted slate tones with chevron icons. | **DON'T** use red or orange chips for priority. |
| **DO** pair orange fills with navy `#0F172A` text to guarantee 5:1 contrast. | **DON'T** put white text on `#EA580C` (it fails AA contrast). |
| **DO** use 24px radius for major panels (departure board, health bar, sidebar island, modals). | **DON'T** mix arbitrary border radii; use the documented radii scale. |
| **DO** use `font-mono-numbers` with `tabular-nums` for all IDs, timestamps, and timers. | **DON'T** render numeric metrics in proportional fonts where characters jitter. |
| **DO** provide immediate zero-flash theme persistence using the inline blocking script. | **DON'T** allow a white flash when opening dark mode pages. |
| **DO** disable all animations under `prefers-reduced-motion: reduce`. | **DON'T** run blinking or continuous motion without respect for accessibility preferences. |
