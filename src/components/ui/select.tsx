"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, CaretDown, CaretUp, X } from '@phosphor-icons/react/dist/ssr';

import { cn } from "@/lib/utils"
import { useFieldLabelId } from "@/components/ui/field-label"
import {
  ANCHORED_CARD,
  MENU_HEADING,
  MENU_ROW,
  MENU_SEPARATOR,
  MENU_TICK_SLOT,
  POP_IN_ANCHORED,
} from "@/components/ui/overlay-styles"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    onClear?: () => void
    showClear?: boolean
  }
>(({ className, children, onClear, showClear, ...props }, ref) => {
  // Named by the visible label of the row it sits in, unless the caller names it (aria-label / aria-labelledby)
  const rowLabelId = useFieldLabelId()
  const named = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined
  return (
  <SelectPrimitive.Trigger
    ref={ref}
    aria-labelledby={named ? undefined : rowLabelId}
    className={cn(
      // Outlined 42px control with a small hard shadow. Open or keyboard focus: the shadow turns accent
      // (2px 2px 0 --accent-solid, spec §5) and focus-visible adds the app-wide 3px ring.
      "flex h-[42px] w-full items-center justify-between gap-2 rounded-md border-[length:var(--outline-w)] border-outline bg-surface px-3 text-sm font-semibold text-ink shadow-sticker-sm transition-[box-shadow,background-color] duration-100 data-placeholder:text-ink-muted data-[state=open]:shadow-[2px_2px_0_var(--accent-solid)] focus-visible:shadow-[2px_2px_0_var(--accent-solid)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    {onClear && showClear ? (
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClear()
        }}
        className="h-4 w-4 shrink-0 text-ink-secondary hover:text-ink"
      >
        <X size={16} weight="bold" />
      </button>
    ) : (
      <SelectPrimitive.Icon asChild>
        <CaretDown size={16} weight="bold" className="shrink-0 text-ink-secondary" />
      </SelectPrimitive.Icon>
    )}
  </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1 text-ink-secondary",
      className
    )}
    {...props}
  >
    <CaretUp size={16} weight="bold" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1 text-ink-secondary",
      className
    )}
    {...props}
  >
    <CaretDown size={16} weight="bold" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // sticker card (outline, --shadow-sticker, --radius-lg) with the springy pop-in
        ANCHORED_CARD,
        "relative max-h-96 min-w-32 overflow-hidden origin-(--radix-select-content-transform-origin)",
        POP_IN_ANCHORED,
        position === "popper" &&
        "data-[side=bottom]:translate-y-2 data-[side=left]:-translate-x-2 data-[side=right]:translate-x-2 data-[side=top]:-translate-y-2",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1.5",
          position === "popper" &&
          "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(MENU_HEADING, className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(MENU_ROW, "pr-8", className)}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>

    <span className={MENU_TICK_SLOT}>
      <SelectPrimitive.ItemIndicator>
        <Check size={16} weight="bold" />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn(MENU_SEPARATOR, className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
