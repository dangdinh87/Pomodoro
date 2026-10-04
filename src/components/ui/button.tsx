import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Visuals live in globals.css (.btn*), the single source of truth (spec §5). Sticker pop: outline + hard
// shadow, hover lifts 1px, press sinks by the shadow depth. Labels are Baloo 2 700, sentence case.
// shadcn variant names are kept so existing call sites keep working; `fun` (butter) is additive.
const buttonVariants = cva("btn [&_svg]:size-4", {
  variants: {
    variant: {
      default: "btn--primary",
      destructive: "btn--danger",
      outline: "btn--secondary",
      secondary: "btn--secondary",
      fun: "btn--fun",
      ghost: "btn--ghost",
      link: "btn--link",
    },
    size: {
      default: "btn--md",
      sm: "btn--sm",
      lg: "btn--lg",
      icon: "btn--icon",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
