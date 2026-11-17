# Beyond the Factory Floor: UI Design Rules & Implementation Guide

## 1. Overview & Precedence

This document codifies the design system for **Beyond the Factory Floor**, translating `SKILL.md` into concrete, implementable CSS, Tailwind v4 utility rules, and component patterns.

**Precedence Hierarchy:**
Explicit prompt requirements > `SKILL.md` (Part B visual system) > shadcn/ui and Tailwind defaults.

---

## 2. Typography System

### 2.1 Font Family Rules
- **Primary Interface Font:** **Geist** (`@fontsource-variable/geist`). Used for all navigation, headings, body text, buttons, and table labels.
- **Monospace Font:** **Geist Mono** (`@fontsource-variable/geist-mono`). Used strictly for numeric telemetry readings, machine IDs (`MCH001`), timestamps, and code identifiers.
- **Banned Fonts:** Inter, Roboto, Arial, Open Sans, Helvetica. All shadcn defaults referencing Inter are strictly removed.
- **Strictly No Italics:** Italic fonts are disallowed across the entire application. The following reset is enforced globally in `src/styles/index.css`:
  ```css
  em, i, cite, address {
    font-style: normal;
  }
  ```
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700) at most. Never black or 900.

### 2.2 Text Wrapping & Copy Guidelines
- Headings: `text-wrap: balance`
- Body copy: `text-wrap: pretty`
- **Zero Hyphens in User Facing Text:**
  - Write "Real time" instead of "Real-time"
  - Write "What if simulation" instead of "What-if simulation"
  - Write "Spare parts" instead of "Spare-parts"
  - Ranges written as "10 to 20" instead of "10-20"
  - Dates formatted as "17 Nov 2026, 14:32"
  - Identifiers contain no hyphens: `MCH001`, `TCH017`, `SP0042`
  *(Note: Code identifiers, API paths, and CSS classes are exempt)*
- **Sentence Case:** Enforced for all headings, cards, button labels, and table headers.

### 2.3 Named Text Styles
Every text element must use one of these exact named text styles defined once in `src/styles/index.css`. Loose arbitrary font size or weight classes are prohibited.

| Style Class | Scale Step | Size / Line Height | Font Weight | Dashboard Usage |
|---|---|---|---|---|
| `.heading-1` | `text-6xl` | 60px / 60px | Semibold (600) | Landing page hero only |
| `.heading-2` | `text-5xl` | 48px / 48px | Semibold (600) | Major landing section titles |
| `.heading-3` | `text-4xl` | 36px / 40px | Semibold (600) | Large KPI hero metrics (in Geist Mono) |
| `.heading-4` | `text-3xl` | 30px / 36px | Semibold (600) | Dashboard page titles, primary KPIs |
| `.heading-5` | `text-2xl` | 24px / 32px | Semibold (600) | Modal & panel headers |
| `.heading-6` | `text-xl` | 20px / 28px | Semibold (600) | Section headings, 3D overlays |
| `.title-1` | `text-xl` | 20px / 28px | Medium (500) | Feature titles |
| `.title-2` | `text-lg` | 18px / 28px | Medium (500) | Section lead titles |
| `.title-3` | `text-base` | 16px / 24px | Medium (500) | Card titles, navigation group titles |
| `.title-4` | `text-sm` | 14px / 20px | Medium (500) | Secondary card titles, list lead labels |
| `.title-5` | `text-xs` | 12px / 16px | Medium (500) | Small section tags |
| `.body-1` | `text-base` | 16px / 24px | Semibold (600) | Emphasized body text |
| `.body-2` | `text-base` | 16px / 24px | Medium (500) | Standard body text |
| `.body-3` | `text-base` | 16px / 24px | Regular (400) | Descriptive paragraphs |
| `.body-4` | `text-sm` | 14px / 20px | Semibold (600) | Table bold cells, list titles |
| `.body-5` | `text-sm` | 14px / 20px | Medium (500) | Primary table row text, input text |
| `.body-6` | `text-sm` | 14px / 20px | Regular (400) | Secondary table text, explanations |
| `.button-lg` | `text-lg` | 18px / 28px | Semibold (600) | Large call to action buttons |
| `.button-md` | `text-base` | 16px / 24px | Semibold (600) | Standard action buttons |
| `.button-sm` | `text-sm` | 14px / 20px | Semibold (600) | Compact toolbar and table buttons |
| `.button-xsm`| `text-xs` | 12px / 16px | Semibold (600) | Micro action tags |
| `.caption-1` | `text-sm` | 14px / 20px | Medium (500) | Prominent helper text |
| `.caption-2` | `text-sm` | 14px / 20px | Regular (400) | Subtle descriptions |
| `.caption-3` | `text-xs` | 12px / 16px | Semibold (600) | Status badges, sensor units |
| `.caption-4` | `text-xs` | 12px / 16px | Medium (500) | Timestamps, table headers |
| `.caption-5` | `text-xs` | 12px / 16px | Regular (400) | Chart axis ticks, fine metadata |

---

## 3. Spacing Scale

Only these specific values may be used for margin, padding, and gap. Arbitrary numbers (e.g. 5, 7, 9, 11, 14, 18) are strictly prohibited.

| Token | Exact Pixels | Tailwind Utility Class |
|---|---|---|
| `spacing-0` | 0px | `0` (`p-0`, `m-0`, `gap-0`) |
| `spacing-25` | 2px | `0.5` (`p-0.5`, `m-0.5`, `gap-0.5`) |
| `spacing-50` | 4px | `1` (`p-1`, `m-1`, `gap-1`) |
| `spacing-75` | 8px | `2` (`p-2`, `m-2`, `gap-2`) |
| `spacing-100` | 12px | `3` (`p-3`, `m-3`, `gap-3`) |
| `spacing-200` | 16px | `4` (`p-4`, `m-4`, `gap-4`) |
| `spacing-300` | 24px | `6` (`p-6`, `m-6`, `gap-6`) |
| `spacing-400` | 32px | `8` (`p-8`, `m-8`, `gap-8`) |
| `spacing-500` | 40px | `10` (`p-10`, `m-10`, `gap-10`) |
| `spacing-600` | 48px | `12` (`p-12`, `m-12`, `gap-12`) |
| `spacing-700` | 64px | `16` (`p-16`, `m-16`, `gap-16`) |
| `spacing-800` | 80px | `20` (`p-20`, `m-20`, `gap-20`) |
| `spacing-900` | 96px | `24` (`p-24`, `m-24`, `gap-24`) |

**Button Padding Rule:**
Main buttons strictly use `py-2 px-3` (8px top/bottom, 12px left/right).

---

## 4. Color Palette & Surfaces

All backgrounds are strictly **flat**. Background gradients are completely prohibited.

### 4.1 Surface Color Hierarchy

| Role | Hex Color | Tailwind Representation / Variable |
|---|---|---|
| Page Background | `#000000` | `bg-[#000000]` / `--background` |
| Sidebar, Top Bar, 3D Canvas Background | `#131209` | `bg-[#131209]` / `--sidebar-bg` |
| Primary Cards & Content Panels | `#181818` | `bg-[#181818]` / `--card` |
| Nested Panels, Form Inputs, Table Headers | `#1F1F1F` | `bg-[#1F1F1F]` / `--secondary` |
| Hover State, Selected Rows, Active Nav | `#272727` | `bg-[#272727]` / `--muted` |
| Borders, Dividers & Outlines | `#313131` | `border-[#313131]` / `--border` |
| Primary Text & Headings | `#FFFFFF` | `text-[#FFFFFF]` / `--foreground` |
| Secondary Text, Subtitles & Metadata | `#9B9B9B` | `text-[#9B9B9B]` / `--muted-foreground` |

### 4.2 Functional Status Colors
Status colors are strictly functional indicators (small badges, 3D lights, chart threshold lines). They are **never** used as full card backgrounds or glowing neons.

| Severity | Tailwind Fill | Icon Representation | Text Label |
|---|---|---|---|
| **Normal** | `bg-emerald-500` / `text-emerald-400` | `CheckCircle` | Normal |
| **Warning** | `bg-amber-500` / `text-amber-400` | `Warning` | Warning |
| **High** | `bg-orange-500` / `text-orange-400` | `WarningCircle` | High |
| **Critical** | `bg-rose-500` / `text-rose-400` | `WarningOctagon`| Critical |
| **Emergency** | `bg-red-600` / `text-red-400` | `ShieldWarning` | Emergency |

*Accessibility Rule:* Status colors are never presented alone; they must always be paired with an icon and explicit text.

---

## 5. Corner Radius & Border Rules

### 5.1 Corner Radius Scale
Standard Tailwind radius values only: `rounded-none`, `rounded-sm` (2px), `rounded` (4px), `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-full`.

### 5.2 Nested Radius Formula
When an inner element sits inside an outer card with padding $G < 32\text{px}$:
$$R_{\text{inner}} = R_{\text{outer}} - G$$
If $R_{\text{inner}} \le 2\text{px}$, the inner element remains square (`rounded-none`).
*Example:* Outer card at `rounded-2xl` (16px) with `p-2` (8px gap) yields inner element `rounded-lg` ($16 - 8 = 8\text{px}$).

### 5.3 Card Borders
- Single-sided borders (e.g. `border-b` only on a card) are strictly prohibited.
- Borders surround the complete perimeter (`border border-[#313131]`) or not at all.

---

## 6. Icons & Visual Assets

- **Library:** Phosphor icons (`@phosphor-icons/react`) exclusively.
- **Prohibited:** Material Icons, Material Symbols, Lucide, FontAwesome.
- **Icon Sizing:**
  - Toolbar / Navigation: 20px (`size-5`)
  - Badges / Inline text: 16px (`size-4`)
  - Hero / Empty states: 32px to 48px (`size-8` to `size-12`)

---

## 7. Motion & Animation Tokens

- **Base Easing Curve:** `ease-[cubic-bezier(0.22,1,0.36,1)]`
- **Duration Scale:**
  - Position and layout movements: `duration-500`
  - Hover color shifts and opacity fades: `duration-300` (never faster than 200ms)
- **DOM Animation Constraints:** Animate strictly `transform` and `opacity`. Never animate `top`, `left`, `width`, or `height`.
- **Streaming Charts:** Recharts telemetry lines must set `isAnimationActive={false}` to eliminate layout jitter.
- **Accessibility:** `@media (prefers-reduced-motion: reduce)` disables all spatial motion, replacing moves with instant opacity transitions.

---

## 8. Dashboard Navigation & Shell

### 8.1 App Shell Architecture
- **Left Sidebar:** Persistent navigation list for the 9 dashboard sections. Current section indicated by `bg-[#272727] text-white border-l-2 border-white`. Unbuilt sections flagged with `aria-disabled="true"` and muted styling.
- **Sticky Top Bar:** Contains:
  1. Selected machine indicator pill (`MCH001 Precision Milling`)
  2. Factory health summary ring badge
  3. Real-time WebSocket connection state pill (`Connected` / `Reconnecting`)
  4. Persistent `"Simulated data"` compliance badge
  5. Emergency procedural audio alarm toggle button (persisted in `localStorage`)
  6. Demo role switcher dropdown (`Viewer`, `Operator`, `Supervisor`)

### 8.2 Responsive Mobile Navigation
- On screens $< 1024\text{px}$, the sidebar collapses into a top bar menu button.
- Tapping menu opens a full-height sheet (`bg-[#131209]/95 backdrop-blur-md`).
- Nav links enter staggered: rising 24px, fading in 60ms apart, capped at 400ms total.

---

## 9. Interactive States & Component Patterns

1. **Hover State:** Background shifts to `#272727` with `duration-300`.
2. **Active State:** Physical tactile compression `scale-[0.98]` or `translate-y-[1px]`.
3. **Focus State:** Prominent accessible outline `focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none`.
4. **Loading State:** Skeleton loaders strictly matching the geometric shape of the eventual cards/tables (`bg-[#1F1F1F] animate-pulse`). Never circular spinners.
5. **Composed Empty State:** Structured box with Phosphor icon, Title 4, and calming descriptive Body 6 (e.g. "No active alerts. All three machines are inside their normal operating ranges.").
6. **Error State:** Inline specific error container with icon, error message, and retry button. Zero `window.alert()`.

---

## 10. Emergency Alarm & Sonner Toast Specification

### 10.1 Procedural Web Audio API Alarm
- Generates an industrial dual-tone acoustic pulse using native `AudioContext` oscillators (no external `.mp3` or `.wav` files).
- Plays when any unacknowledged Emergency alert is active.
- Top bar toggle allows muting; state stored in `localStorage.getItem("factory_alarm_enabled")`.

### 10.2 Sonner Toast Notifications
- Styled dark (`theme="dark"`, `bg-[#181818] border-[#313131] text-white`).
- High and Critical severity triggers transient toast (5s).
- Emergency severity triggers **persistent** toast with inline `Acknowledge` button.
- Deduplicated by alert ID so active alerts never flood the user.
