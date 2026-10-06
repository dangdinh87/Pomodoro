"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

// Segmented control: a raised, outlined pill tray; the active tab floats on it as a small sticker.
// p-1.5 leaves room inside the scroll box for the active tab's shadow and the focus ring.
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex w-full items-center gap-1 overflow-x-auto rounded-full border-sticker bg-surface-raised p-1.5 scrollbar-hide",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "focus-ring relative inline-flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-transparent px-4 font-heading text-[0.9375rem] font-bold leading-none text-ink-secondary transition-[background-color,color,box-shadow,transform] duration-100 hover:text-ink focus-visible:outline-offset-0 disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:border-outline data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-[2px_2px_0_var(--outline)]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-hidden",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
