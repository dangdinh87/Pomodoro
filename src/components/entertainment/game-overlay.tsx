import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface GameOverlayProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function GameOverlay({ title, description, children, className }: GameOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-surface-page/95 p-6 text-center backdrop-blur-sm",
        className
      )}
    >
      <h2 className="font-heading text-3xl font-bold text-white md:text-4xl" suppressHydrationWarning>
        {title}
      </h2>
      {description && (
        <p className="max-w-sm text-sm leading-relaxed text-white/70" suppressHydrationWarning>
          {description}
        </p>
      )}
      {children}
    </div>
  )
}

export function GameStat({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-[72px] rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-center", className)}>
      <div className="text-xs text-white/60" suppressHydrationWarning>{label}</div>
      <div className="font-heading text-lg font-bold tabular-nums text-white">{value}</div>
    </div>
  )
}
