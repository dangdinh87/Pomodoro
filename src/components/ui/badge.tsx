import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Tag / badge — docs/design-system.md §7.4. Pick a tone by meaning (§4.2); neutral by default.
const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-[9px] py-[3px] text-[0.6875rem] font-medium leading-[1.4]",
  {
    variants: {
      variant: {
        default: "bg-surface-raised text-ink-secondary",
        secondary: "bg-surface-raised text-ink-secondary",
        outline: "border border-border text-ink-secondary",
        brand: "bg-brand-soft text-brand-ink",
        success: "bg-success-bg text-success-ink",
        warning: "bg-warning-bg text-warning-ink",
        destructive: "bg-danger-bg text-danger-ink",
        info: "bg-info-bg text-info-ink",
        ai: "bg-ai-bg text-ai-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
