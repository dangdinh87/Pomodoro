"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

/**
 * Light / dark / system theme (next-themes). Only the theme: the scene background (BackgroundProvider)
 * belongs to the app and loads with it (AppProviders), so content pages never ship it.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
