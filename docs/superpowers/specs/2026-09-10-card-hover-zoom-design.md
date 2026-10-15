# Card hover zoom

Date: 2026-09-10  
Status: approved approach (CSS scale); awaiting spec review before implementation

## Goal

When a pointer hovers a card, or a keyboard user focuses it, that card zooms in slightly so the current target is obvious. Color, hairline, and shadow hover treatment already on the ledger stay.

## Surfaces in scope

- Board task cards (`src/components/TaskCard.jsx`)
- Habit cards (`src/components/HabitView.jsx` `Paper` cards)
- Finance summary, add-transaction, and history panels (`src/components/FinanceView.jsx`)
- Statistics metric cards and chart cards (`src/components/StatsDashboard.jsx`)

## Surfaces out of scope

- Kanban columns
- Journal calendar cells and note panels
- Login paper
- Dialogs and overlays
- Sidebar, toolbar, and navigation

## Interaction

**Triggers:** `:hover` and `:focus-visible` on the card surface. “Selected” means the card under the pointer or keyboard focus, not the task currently open in the dialog.

**Effect:** `transform: scale(1.02)` from the center. Raise `z-index` while scaled so the card can overlap neighbors without clipping. Keep existing hover styles: Raised Charcoal fill, stronger hairline, Responsive Lift shadow.

**Timing:** 200ms ease, matching the rest of the UI. Do not add a new motion library for this.

**Touch:** Do not apply hover zoom on coarse pointers (`pointer: coarse`). Sticky hover on tap would leave cards enlarged.

**Reduced motion:** Skip scale. Keep fill, border, and shadow changes so state is still visible.

## Task cards and drag

dnd-kit already writes `transform` on the task card for drag. CSS scale must not share that node.

Scale an inner wrapper. The outer card keeps the sortable transform and the 2° drag rotation. While dragging, the inner wrapper stays at scale 1.

## Implementation notes

- Add `transform` only on these cards’ hover/focus transitions. Do not add `transform` to the global `*` transition list.
- Prefer a small shared sx snippet or helper in one place (constants or a tiny `cardHoverZoom` style object) so the four surfaces stay consistent.
- Do not dim sibling cards.
- Do not bounce or spring.

## Success

- Hovering or keyboard-focusing an in-scope card scales it to 1.02 and keeps the existing lift.
- Dragging a task still works; the card does not jump or fight the drag transform.
- Mobile tap does not leave a card zoomed.
- `prefers-reduced-motion: reduce` does not scale.
- Out-of-scope surfaces are unchanged.
