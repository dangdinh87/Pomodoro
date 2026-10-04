"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { Check, Info, Warning, X } from '@phosphor-icons/react/dist/ssr';

import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

const MOBILE_TAB_BAR_OFFSET = 84

/** Small outlined tile that carries the tone of a toast (spec §5): tone colour, outline, on-accent glyph. */
function ToneTile({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "flex size-7 items-center justify-center rounded-[9px] border-2 border-outline text-on-accent",
        tone
      )}
    >
      {children}
    </span>
  )
}

const TONE_ICONS: ToasterProps["icons"] = {
  success: (
    <ToneTile tone="bg-success">
      <Check size={16} weight="bold" aria-hidden="true" />
    </ToneTile>
  ),
  error: (
    <ToneTile tone="bg-danger">
      <X size={16} weight="bold" aria-hidden="true" />
    </ToneTile>
  ),
  warning: (
    <ToneTile tone="bg-warning">
      <Warning size={16} weight="bold" aria-hidden="true" />
    </ToneTile>
  ),
  info: (
    <ToneTile tone="bg-info">
      <Info size={16} weight="bold" aria-hidden="true" />
    </ToneTile>
  ),
}

// Sonner reads these for its own default look; pointing them at tokens keeps toasts correct in both themes.
const TOAST_VARS = {
  "--normal-bg": "var(--surface)",
  "--normal-text": "var(--ink)",
  "--normal-border": "var(--outline)",
  "--border-radius": "var(--radius-lg)",
} as React.CSSProperties

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      className="toaster group"
      position={isMobile ? "bottom-center" : "bottom-right"}
      offset={isMobile ? MOBILE_TAB_BAR_OFFSET : 24}
      icons={TONE_ICONS}
      style={TOAST_VARS}
      toastOptions={{
        classNames: {
          // Sticker card, tilted a little (`tilt-l`: individual `rotate`, so it composes with sonner's own transform).
          // `!` wins over sonner's injected stylesheet, which loads after ours.
          toast:
            "group toast tilt-l bg-surface! text-ink! border-[length:var(--outline-w)]! border-outline! rounded-lg! shadow-sticker! font-body",
          title: "group-[.toast]:font-heading group-[.toast]:font-bold group-[.toast]:text-ink",
          description: "group-[.toast]:text-ink-muted!",
          icon: "size-7! ml-0! mr-2.5!",
          actionButton:
            "group-[.toast]:bg-primary! group-[.toast]:text-on-accent! group-[.toast]:border-2! group-[.toast]:border-outline! group-[.toast]:rounded-md! group-[.toast]:font-heading group-[.toast]:font-bold group-[.toast]:h-7! group-[.toast]:shadow-[2px_2px_0_var(--outline)]",
          cancelButton:
            "group-[.toast]:bg-surface-raised! group-[.toast]:text-ink-secondary! group-[.toast]:border-2! group-[.toast]:border-outline! group-[.toast]:rounded-md! group-[.toast]:font-heading group-[.toast]:font-bold group-[.toast]:h-7!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
