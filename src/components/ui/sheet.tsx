"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { OVERLAY_SCRIM, OverlayClose } from "@/components/ui/overlay-parts"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(OVERLAY_SCRIM, className)}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

// Sticker pop: only the edge facing the page gets the outline, the inner corners use --radius-lg and the
// hard shadow is cast toward the page (a right sheet casts left, and so on). Outer edges stay flush with the viewport.
const sheetVariants = cva(
  "fixed z-50 gap-4 border-outline bg-surface p-6 text-ink data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-300 data-[state=closed]:duration-200 data-[state=open]:ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:ease-in",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 rounded-b-lg border-b-[length:var(--outline-w)] shadow-[0_6px_0_var(--outline)] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        // Bottom sheet (mobile): keeps the home-indicator safe area under the content.
        bottom:
          "inset-x-0 bottom-0 rounded-t-lg border-t-[length:var(--outline-w)] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-6px_0_var(--outline)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 rounded-r-lg border-r-[length:var(--outline-w)] shadow-[6px_0_0_var(--outline)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 rounded-l-lg border-l-[length:var(--outline-w)] shadow-[-6px_0_0_var(--outline)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <OverlayClose />
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional icon shown in a small outlined tile before the title (e.g. a Phosphor icon, weight "fill"). */
  icon?: React.ReactNode
  /** Tile colour. Defaults to candy butter; pair with the panel's own candy colour. */
  iconTileClassName?: string
}

const SheetHeader = ({
  className,
  icon,
  iconTileClassName,
  children,
  ...props
}: SheetHeaderProps) => {
  if (!icon) {
    return (
      <div
        className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
  return (
    <div className={cn("flex items-center gap-3 text-left", className)} {...props}>
      <span
        aria-hidden="true"
        data-slot="sheet-icon-tile"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[12px] border-2 border-outline bg-candy-butter text-on-accent [&_svg]:size-5",
          iconTileClassName
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col space-y-1">{children}</div>
    </div>
  )
}
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("font-heading text-xl font-bold leading-tight text-ink", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-ink-muted", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
