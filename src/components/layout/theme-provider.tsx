"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { BackgroundProvider } from "@/contexts/background-context"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <BackgroundProvider>
        {children}
      </BackgroundProvider>
    </NextThemesProvider>
  )
}