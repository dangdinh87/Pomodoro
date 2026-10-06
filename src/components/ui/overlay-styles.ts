/**
 * Class strings and helpers shared by the Sticker pop overlays (spec §3.3, §3.6, §5). Plain module, no
 * Radix: the select (which every page's language switcher uses) imports its row and card looks from here
 * without pulling the dialog primitive that `OverlayClose` needs.
 */
import { cn } from "@/lib/utils"

/**
 * Scrim: --ink at 40% (spec). In dark mode --ink is cream, which would wash the page out,
 * so the scrim reads --outline instead: identical to --ink in light mode, near-black in dark.
 */
export const OVERLAY_SCRIM =
  "fixed inset-0 z-50 bg-outline/40 dark:bg-outline/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:duration-200 data-[state=closed]:duration-150"

/**
 * Pop-in for modals: scale .92 -> 1 with a springy overshoot. The cubic-bezier is the CSS stand-in
 * for the spec's spring (stiffness 420, damping 22; roughly 13% overshoot). It runs on the Radix
 * data-state so Presence waits for the exit animation. globals.css already collapses animation
 * durations to ~0 under prefers-reduced-motion, so no scale is seen there.
 */
export const POP_IN_MODAL =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-92 data-[state=closed]:zoom-out-95 data-[state=open]:duration-300 data-[state=closed]:duration-150 data-[state=open]:ease-[cubic-bezier(0.34,1.56,0.64,1)] data-[state=closed]:ease-in"

/** Same pop for anchored surfaces (popover, menus, select), a little quicker, plus a short slide from the trigger. */
export const POP_IN_ANCHORED =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-92 data-[state=open]:duration-200 data-[state=closed]:duration-120 data-[state=open]:ease-[cubic-bezier(0.34,1.56,0.64,1)] data-[state=closed]:ease-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"

/** Sticker card for anchored surfaces: outline, hard shadow, --radius-lg (all from the `.sticker` utility). */
export const ANCHORED_CARD = "sticker z-50 text-ink"

/** Focus / keyboard-highlight look shared by every menu row: tomato ring inside the row on a warm tint. */
const ROW_HIGHLIGHT =
  "data-highlighted:bg-surface-hover data-highlighted:outline-2 data-highlighted:-outline-offset-2 data-highlighted:outline-ring"

/** Row the user picked (select value, checked menu item): soft sky tint + outline; the tick sits on the right. */
const ROW_CHECKED = "data-[state=checked]:border-outline data-[state=checked]:bg-candy-sky/40"

/** Row used by dropdown-menu and select items. */
export const MENU_ROW = cn(
  "relative flex w-full cursor-default select-none items-center gap-2 rounded-md border-2 border-transparent px-2.5 py-2 text-sm font-semibold text-ink outline-0 transition-colors data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  ROW_HIGHLIGHT,
  ROW_CHECKED,
)

/** Row used by cmdk (it flags the active row with data-selected="true" instead of data-highlighted). */
export const COMMAND_ROW =
  "relative flex cursor-pointer select-none items-center gap-3 rounded-md border-2 border-transparent px-2.5 py-2 text-sm font-semibold text-ink-secondary outline-0 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-surface-hover data-[selected=true]:text-ink data-[selected=true]:outline-2 data-[selected=true]:-outline-offset-2 data-[selected=true]:outline-ring [&_svg]:shrink-0 [&_svg]:text-ink-muted"

/** Heading above a group of rows (menu label, select label): Baloo 2, quiet colour. */
export const MENU_HEADING = "px-2.5 py-1.5 font-heading text-sm font-bold text-ink-secondary"

/** Hairline between groups of rows. */
export const MENU_SEPARATOR = "-mx-1.5 my-1.5 h-0.5 bg-border"

/** Where the tick of a checked row sits. */
export const MENU_TICK_SLOT = "absolute right-2.5 flex size-4 items-center justify-center"

/**
 * `onOpenAutoFocus` for a panel whose first tabbable control does something on Space/Enter (a header "Reset to
 * defaults", "Save changes"): Radix would focus it on open, and Space is also the timer's Start key. Focus lands on
 * the content itself instead (it is the named dialog, so screen readers announce it) and Tab walks the panel from
 * the top. Pair it with `focus:outline-hidden` on the content.
 */
export function focusContentOnOpen(event: Event) {
  event.preventDefault()
  ;(event.currentTarget as HTMLElement | null)?.focus()
}
