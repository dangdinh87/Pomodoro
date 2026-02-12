"use client"

import { cn } from "@/lib/utils"

interface BorderBeamProps {
  /** Controls the beam arc width. Higher = wider beam trail. */
  size?: number
  /** Animation duration in seconds. */
  duration?: number
  /** Animation delay in seconds (stagger multiple beams). */
  delay?: number
  colorFrom?: string
  colorTo?: string
  className?: string
  /** Reverse the animation direction. */
  reverse?: boolean
  /** Initial offset position (0-100), staggers the start point. */
  initialOffset?: number
  /** The border width of the beam. */
  borderWidth?: number
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  reverse = false,
  initialOffset = 0,
  borderWidth = 2,
}: BorderBeamProps) => {
  // Map size to gradient arc percentage (capped 8-30%)
  const arcSize = Math.max(8, Math.min(size / 4, 30))
  // Convert initialOffset (0-100) to negative delay for stagger
  const startDelay = delay + (initialOffset / 100) * duration

  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={
        {
          borderWidth,
          borderStyle: "solid",
          borderColor: "transparent",
          maskImage:
            "linear-gradient(transparent,transparent),linear-gradient(#000,#000)",
          maskComposite: "intersect",
          maskClip: "padding-box,border-box",
          WebkitMaskImage:
            "linear-gradient(transparent,transparent),linear-gradient(#000,#000)",
          WebkitMaskComposite: "source-in",
          WebkitMaskClip: "padding-box,border-box",
        } as React.CSSProperties
      }
    >
      <div
        className={cn("animate-border-beam", className)}
        style={
          {
            position: "absolute",
            inset: "-50%",
            background: `conic-gradient(from 0deg, transparent 0%, ${colorFrom} ${arcSize * 0.4}%, ${colorTo} ${arcSize * 0.8}%, transparent ${arcSize}%, transparent 100%)`,
            "--duration": `${duration}s`,
            "--delay": `${-startDelay}s`,
            "--direction": reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      />
    </div>
  )
}
