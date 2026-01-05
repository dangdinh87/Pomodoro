"use client"


import { cn } from "@/lib/utils"

interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number
  /**
   * The duration of the border beam.
   */
  duration?: number
  /**
   * The delay of the border beam.
   */
  delay?: number
  /**
   * The color of the border beam from.
   */
  colorFrom?: string
  /**
   * The color of the border beam to.
   */
  colorTo?: string
  /**
   */
  className?: string
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number
  /**
   * The border width of the beam.
   */
  borderWidth?: number
  /**
   * The corner radius of the beam path. Should match the container's border radius.
   */
  radius?: number
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
  radius = 8,
}: BorderBeamProps) => {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-[length:var(--border-beam-width)] border-transparent [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [mask-composite:intersect] [mask-clip:padding-box,border-box]"
      style={
        {
          "--border-beam-width": `${borderWidth}px`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "absolute aspect-square",
          "bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent",
          "animate-border-beam",
          className
        )}
        style={
          {
            width: size,
            offsetPath: `inset(0 round ${radius}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            "--duration": `${duration}s`,
            "--delay": `${-delay}s`,
            "--initial-offset": `${initialOffset}%`,
            "--direction": reverse ? "reverse" : "normal",
            willChange: "offset-distance",
          } as React.CSSProperties
        }
      />
    </div>
  )
}
