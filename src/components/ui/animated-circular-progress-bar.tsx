"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface AnimatedCircularProgressBarProps {
  max?: number
  value?: number
  min?: number
  gaugePrimaryColor?: string
  gaugeSecondaryColor?: string
  className?: string
  children?: React.ReactNode
}

export default function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
  children,
}: AnimatedCircularProgressBarProps) {
  const [currentValue, setCurrentValue] = useState(min)
  const ref = useRef<SVGSVGElement>(null)
  const circumference = 2 * Math.PI * 45
  const percentPx = circumference / 100

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurrentValue(value)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [value])

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
    >
      <svg
        className="transform -rotate-90"
        width="120"
        height="120"
        viewBox="0 0 120 120"
        ref={ref}
      >
        <circle
          cx="60"
          cy="60"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          className="text-muted-foreground/20"
        />
        <circle
          cx="60"
          cy="60"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference -
            ((currentValue - min) / (max - min)) * 100 * percentPx
          }
          className="transition-all duration-1000 ease-out text-primary"
          style={{
            color: gaugePrimaryColor || "hsl(var(--primary))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}