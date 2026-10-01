"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { BackgroundProvider } from "@/contexts/background-context"

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <BackgroundProvider>
        {children}
      </BackgroundProvider>
    </NextThemesProvider>
  )
}