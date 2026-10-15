---
name: TasKeep
description: A warm, local-first command center for everyday planning and personal records.
colors:
  canvas: "#141413"
  surface: "#1f1e1d"
  surface-hover: "#262624"
  surface-elevated: "#2b2a27"
  text-primary: "#faf9f5"
  text-secondary: "#b0aea5"
  text-muted: "#8a887f"
  border-subtle: "rgba(255, 255, 255, 0.08)"
  border-strong: "rgba(255, 255, 255, 0.14)"
  clay: "#d97757"
  clay-hover: "#c16b4f"
  clay-soft: "rgba(217, 119, 87, 0.14)"
  clay-soft-border: "rgba(217, 119, 87, 0.3)"
  on-accent: "#141413"
  blue: "#6a9bcc"
  green: "#788c5d"
  amber: "#d9a441"
  error: "#e07856"
  error-hover: "#c86c4e"
typography:
  display:
    fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  chip: "8px"
  control: "10px"
  card: "12px"
  panel: "16px"
  dialog: "20px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.clay-hover}"
    textColor: "{colors.on-accent}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "12px 14px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "12px"
  chip:
    backgroundColor: "{colors.clay-soft}"
    textColor: "{colors.clay}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    height: "18px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  nav-item-active:
    backgroundColor: "{colors.clay-soft}"
    textColor: "{colors.clay}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
---

# Design System: TasKeep

## Overview

**Creative North Star: "The Warm Personal Ledger"**

TasKeep is a compact, warm-dark workspace: calm enough for daily reflection, structured enough for operational task work, and restrained enough to keep mixed personal data legible. Near-black planes establish continuity across tasks, habits, journals, statistics, and finances; warm cream type and a sparing clay accent supply hierarchy without turning the interface into a dashboard spectacle.

The system is dense but not cramped. Flat panels, hairline borders, serif headings, small sans-serif labels, and rounded controls create the feeling of a carefully kept personal ledger translated into a responsive application. Product privacy is expressed through quietness and containment rather than security theater.

**Key Characteristics:**
- Warm near-black canvas with layered charcoal surfaces
- Clay accent reserved for selection, primary action, and progress
- Editorial serif headings paired with compact sans-serif controls
- Flat-at-rest containers with soft, state-driven elevation
- Desktop rail and column layouts that collapse into touch-sized mobile navigation and accordions

## Colors

The palette is warm and low-chroma: charcoal neutrals carry the interface, warm cream carries content, and clay marks the current action or state. The frontmatter values are the normative color source.

### Primary
- **Ledger Clay:** Used for primary actions, active navigation, checked controls, progress, and links.
- **Pressed Clay:** Used only for hover and pressed treatment on clay controls. It stays light enough that Warm Ink on the fill still meets 4.5:1.
- **Stamp Ink:** Warm Ink used as the only text and icon color on filled clay, sage, amber, and error stamps. Cream and white never sit on those fills.
- **Clay Wash:** Used behind selected navigation, count badges, and gentle state emphasis; its bordered companion clarifies selected or drop-target states.

### Secondary
- **Quiet Blue:** Distinguishes secondary data series and category identity.
- **Sage Green:** Communicates completion, positive results, low priority, and healthy progress.

### Tertiary
- **Warm Amber:** Communicates warning, medium priority, and selected category identity.
- **Soft Error Clay:** Communicates overdue and destructive states without introducing a cold, saturated red.

### Neutral
- **Warm Ink:** The uninterrupted application canvas.
- **Ledger Surface:** The default panel, rail, card, and mobile navigation plane.
- **Raised Charcoal:** The hover plane for interactive cards and containers.
- **Dialog Charcoal:** The strongest tonal lift, reserved for dialogs and popovers.
- **Warm Cream:** Primary text and high-emphasis values.
- **Stone Text:** Secondary copy and standard inactive navigation.
- **Muted Stone:** Captions, metadata, placeholders, and inactive icons.
- **Subtle / Strong Hairlines:** White-alpha borders separate surfaces without bright outlines.

### Named Rules
**The Clay Signal Rule.** Clay identifies an action, selection, or meaningful progress state; it does not become a decorative field.

**The Stamp Ink Rule.** Filled clay, sage, amber, and error controls use Warm Ink for labels and icons. Cream stays on charcoal planes; white is not a fill foreground.

**The Warm Neutral Rule.** New surfaces stay within the established warm-charcoal and cream family instead of introducing blue-black backgrounds or pure white panels.

## Typography

**Display Font:** Fraunces (with Georgia and Times New Roman fallbacks)
**Body Font:** Inter (with platform sans-serif fallbacks)

**Character:** Serif headings bring a reflective, editorial note to an otherwise practical interface. Sans-serif body copy stays compact and direct for scanning controls, records, labels, and metadata.

### Hierarchy
- **Display** (600, 2rem, 1.1): Product identity and the largest authentication heading.
- **Headline** (600, 1.25rem–1.75rem, 1.2): Responsive view titles and prominent screen headings.
- **Title** (600, 1.25rem, 1.1): Brand lockup and sectional titles.
- **Body** (400–500, 0.8rem–0.9rem, approximately 1.43): Task titles, form values, navigation, descriptions, and operational copy.
- **Label** (500–600, 0.65rem–0.78rem, normal or 0.08em when uppercase): Counts, chips, metadata, helper labels, and small actions.

### Named Rules
**The Editorial Header Rule.** Serif type belongs to product and view hierarchy; controls, records, navigation, and metadata remain sans-serif.

**The Compact Label Rule.** Uppercase is limited to tiny orienting labels such as “Overview” and “More views,” with restrained tracking rather than used for actions.

## Layout

The desktop shell is a fixed-height workspace with a 248px navigation rail and a flexible, overflow-contained content region. Headers and toolbars use 32px horizontal padding at desktop sizes and 16px on mobile. Primary content follows an 8px-derived rhythm, with 8px card gaps, 16px column gaps, and 16–32px panel padding.

The principal breakpoint is 768px. At and above it, navigation lives in the left rail and task categories appear as horizontally scrollable columns with a 280px minimum. Below it, the rail becomes a fixed 64px bottom navigation, secondary destinations move into a bottom sheet, Kanban columns become independent accordions, and persistent actions remain at least 44px touch targets. Dense toolbars wrap and search expands to a full row where needed.

**The Contained Workspace Rule.** The application frame stays fixed to the viewport; individual boards, lists, and panels own scrolling so global navigation remains stable.

## Elevation & Depth

TasKeep is flat by default. Tonal layering and subtle white-alpha borders establish most depth; cards have no resting shadow. A soft low shadow appears on card hover and floating controls, while the stronger ambient shadow is reserved for dialogs, authentication panels, and elevated overlays.

### Shadow Vocabulary
- **Responsive Lift** (`0 2px 12px rgba(0, 0, 0, 0.25)`): Hovered cards and floating actions.
- **Overlay Lift** (`0 8px 32px rgba(0, 0, 0, 0.35)`): Dialogs, popovers, and the authentication panel.

### Named Rules
**The Flat-at-Rest Rule.** Cards and working surfaces use tone and border at rest; shadows indicate interaction or true overlay elevation.

## Shapes

The form language is softly rectangular. Small chips use 8px corners, buttons and navigation items use 10px, cards and inputs center on 12px, large panels use 16px, and dialogs use 20px. Circular geometry is limited to avatars, status dots, check controls, and floating actions. Borders are one-pixel, low-contrast separators; dashed borders are reserved for additive empty controls such as “Add Column.”

**The Nested Radius Rule.** Radius increases with container scale: controls sit inside cards, cards inside panels, and dialogs receive the largest corners.

## Components

Components are quiet at rest, then reveal state through clay color, a slight tonal lift, or a stronger hairline.

### Buttons
- **Shape:** Soft rectangular controls (10px); floating action buttons are circular.
- **Primary:** Ledger Clay with Warm Ink text, medium-to-semibold sans-serif copy, and compact vertical padding.
- **Hover / Focus:** Primary controls darken to Pressed Clay; keyboard focus uses a visible clay outline. Standard transitions complete in 200ms with ease timing.
- **Secondary / Ghost:** Text actions use Stone Text over transparent backgrounds and gain a faint white wash on hover; outlined actions use a subtle hairline that shifts to clay.

### Chips
- **Style:** Compact 18–20px labels with 8px corners, 0.65rem type, and no hard border by default.
- **State:** Category chips tint the category hue; selected and overdue chips use a clay wash. Count chips use a restrained white-alpha fill.

### Cards / Containers
- **Corner Style:** Task cards use 12px corners; major panels use 16px.
- **Background:** Ledger Surface at rest and Raised Charcoal on hover.
- **Shadow Strategy:** Flat at rest; Responsive Lift on actionable hover.
- **Border:** One-pixel Subtle Hairline, strengthening on hover.
- **Internal Padding:** 12px for task cards and 16px for column or panel headers.

### Inputs / Fields
- **Style:** Warm Ink fill, 12px corners, subtle outline, and compact 0.875rem text.
- **Focus:** Outline shifts to Ledger Clay; hover strengthens the neutral hairline.
- **Error / Disabled:** Error text uses Soft Error Clay; disabled actions fall back to Muted Stone.

### Navigation
- **Desktop:** A 248px Ledger Surface rail with icon-and-label rows, 10px corners, and a Clay Wash active state. Inactive rows use Stone Text and muted icons.
- **Mobile:** A fixed 64px bottom bar exposes three primary destinations plus “More.” Active icon and label become clay; remaining destinations live in a rounded-top bottom sheet.

### Task Card
Task cards combine a compact checkbox, an open control on the title and metadata, and a drag handle as sibling controls. Optional two-line notes, a thin progress track, status dot, category chip, and due-date metadata sit in the open control. Completion reduces opacity and strikes the title; dragging reduces opacity and adds a slight 2-degree rotation.

### Kanban Column
Desktop columns are flexible working panels with a 280px minimum width. Their headers pair a category color dot with title and count. A valid drop target exchanges its neutral border and surface for the clay wash and clay-tinted hairline.

## Do's and Don'ts

### Do:
- **Do** use Ledger Clay to communicate selection, primary action, or progress.
- **Do** preserve the warm-charcoal surface sequence from canvas through dialog elevation.
- **Do** keep operational copy and metadata compact while reserving serif type for headings.
- **Do** preserve 44px minimum touch targets and the 768px desktop/mobile behavior.
- **Do** use borders and tonal changes before adding shadows.

### Don't:
- **Don't** spread the clay accent across large decorative areas or routine body copy.
- **Don't** add cool blue-black canvases, pure-white panels, or high-chroma neon status colors.
- **Don't** place resting shadows on every card or panel.
- **Don't** use uppercase tracking for primary actions or ordinary navigation.
- **Don't** flatten desktop and mobile into the same navigation or Kanban composition.
