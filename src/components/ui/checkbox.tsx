"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from '@phosphor-icons/react/dist/ssr';

import { cn } from "@/lib/utils"

// 22px outlined box. Checked = accent-solid with a dark tick that pops in (still under reduced motion).
// The ::after widens the tap target to ~34px without changing layout.
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "focus-ring peer relative size-[22px] shrink-0 rounded-[7px] border-2 border-control-edge bg-surface text-on-accent shadow-[2px_2px_0_var(--outline)] transition-[background-color,transform,box-shadow] duration-100 after:absolute after:-inset-1.5 after:content-[''] hover:bg-surface-hover active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--outline)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:hover:bg-(--accent-solid-hover) data-[state=indeterminate]:bg-primary",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current motion-safe:animate-tick-pop")}
    >
      <Check size={14} weight="bold" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
