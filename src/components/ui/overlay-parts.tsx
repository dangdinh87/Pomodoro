"use client"

/**
 * Shared pieces of the Sticker pop overlays (spec §3.3, §3.6, §5): scrim, pop-in motion,
 * round close button and the menu-row look used by dropdown-menu, select and command.
 * Kept in one place so dialog, alert-dialog, sheet, popover and the menus cannot drift apart.
 */
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "@phosphor-icons/react/dist/ssr"

import { useI18n } from "@/contexts/i18n-context"
import { cn } from "@/lib/utils"

// The class strings live in overlay-styles (no Radix there); re-exported for the overlays that import them from here
export {
  OVERLAY_SCRIM,
  POP_IN_MODAL,
  POP_IN_ANCHORED,
  ANCHORED_CARD,
  MENU_ROW,
  COMMAND_ROW,
  MENU_HEADING,
  MENU_SEPARATOR,
  MENU_TICK_SLOT,
  focusContentOnOpen,
} from "./overlay-styles"

/**
 * Round, outlined close button for Dialog and Sheet. Its accessible name is translated
 * (`common.close`). It stays a direct child of the content so `[&>button]:hidden` keeps working.
 */
export const OverlayClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => {
  const { t } = useI18n()
  return (
    <DialogPrimitive.Close
      ref={ref}
      aria-label={t("common.close")}
      className={cn(
        "absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border-2 border-outline bg-surface text-ink shadow-sticker-sm transition-[transform,box-shadow,background-color] duration-100 hover:bg-surface-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:pointer-events-none",
        className,
      )}
      {...props}
    >
      <X size={14} weight="bold" aria-hidden="true" />
    </DialogPrimitive.Close>
  )
})
OverlayClose.displayName = "OverlayClose"
