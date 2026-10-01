"use client"

import { useEffect, useState } from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const MOBILE_TAB_BAR_OFFSET = 84

const Toaster = ({ ...props }: ToasterProps) => {
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
      theme="dark"
      className="toaster group"
      position={isMobile ? "bottom-center" : "bottom-right"}
      offset={isMobile ? MOBILE_TAB_BAR_OFFSET : 24}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-ink group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:rounded-md group-[.toaster]:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)] group-[.toaster]:font-body",
          title: "group-[.toast]:text-ink group-[.toast]:font-semibold",
          description: "group-[.toast]:text-ink-muted!",
          icon: "group-data-[type=success]:text-success group-data-[type=error]:text-danger group-data-[type=warning]:text-warning group-data-[type=info]:text-info",
          actionButton:
            "group-[.toast]:bg-primary! group-[.toast]:text-white!",
          cancelButton:
            "group-[.toast]:bg-surface-raised! group-[.toast]:text-ink-secondary!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
