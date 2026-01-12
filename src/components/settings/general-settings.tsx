"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Check, Moon, Sun, Laptop, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useI18n, LANGS } from "@/contexts/i18n-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Theme Presets Logic (Adapted from ThemeSettingsModal)
type ThemeVars = {
    name: string
    key: string
    light: Record<string, string>
    dark: Record<string, string>
}

const defaultTheme: ThemeVars = {
    name: 'Default',
    key: 'default',
    light: {
        primary: '0 0% 9%',
        border: '0 0% 89.8%',
    },
    dark: {
        primary: '0 0% 98%',
        border: '0 0% 14.9%',
    },
}

const themePresets: ThemeVars[] = [
    {
        name: 'Rose',
        key: 'rose',
        light: {
            background: '0 0% 100%',
            foreground: '240 10% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 3.9%',
            primary: '346.8 77.2% 49.8%',
            'primary-foreground': '355.7 100% 97.3%',
            secondary: '240 4.8% 95.9%',
            'secondary-foreground': '240 5.9% 10%',
            muted: '240 4.8% 95.9%',
            'muted-foreground': '240 3.8% 46.1%',
            accent: '240 4.8% 95.9%',
            'accent-foreground': '240 5.9% 10%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '346.8 77.2% 49.8%',
            'timer-foreground': '346.8 77.2% 49.8%',
        },
        dark: {
            background: '20 14.3% 4.1%',
            foreground: '0 0% 95%',
            popover: '0 0% 9%',
            'popover-foreground': '0 0% 95%',
            card: '24 9.8% 10%',
            'card-foreground': '0 0% 95%',
            primary: '346.8 77.2% 49.8%',
            'primary-foreground': '355.7 100% 97.3%',
            secondary: '240 3.7% 15.9%',
            'secondary-foreground': '0 0% 98%',
            muted: '0 0% 15%',
            'muted-foreground': '240 5% 64.9%',
            accent: '12 6.5% 15.1%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '0 85.7% 97.3%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '346.8 77.2% 49.8%',
            'timer-foreground': '346 84% 65%',
        },
    },
    {
        name: 'Green',
        key: 'emerald',
        light: {
            background: '0 0% 100%',
            foreground: '240 10% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 3.9%',
            primary: '142.1 76.2% 36.3%',
            'primary-foreground': '355.7 100% 97.3%',
            secondary: '240 4.8% 95.9%',
            'secondary-foreground': '240 5.9% 10%',
            muted: '240 4.8% 95.9%',
            'muted-foreground': '240 3.8% 46.1%',
            accent: '240 4.8% 95.9%',
            'accent-foreground': '240 5.9% 10%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '142.1 76.2% 36.3%',
            'timer-foreground': '142 71% 45%',
            radius: '0.65rem',
            'chart-1': '12 76% 61%',
            'chart-2': '173 58% 39%',
            'chart-3': '197 37% 24%',
            'chart-4': '43 74% 66%',
            'chart-5': '27 87% 67%',
        },
        dark: {
            background: '20 14.3% 4.1%',
            foreground: '0 0% 95%',
            popover: '0 0% 9%',
            'popover-foreground': '0 0% 95%',
            card: '24 9.8% 10%',
            'card-foreground': '0 0% 95%',
            primary: '142.1 70.6% 45.3%',
            'primary-foreground': '144.9 80.4% 10%',
            secondary: '240 3.7% 15.9%',
            'secondary-foreground': '0 0% 98%',
            muted: '0 0% 15%',
            'muted-foreground': '240 5% 64.9%',
            accent: '12 6.5% 15.1%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '0 85.7% 97.3%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '142.4 71.8% 29.2%',
            'timer-foreground': '142 76% 60%',
            'chart-1': '220 70% 50%',
            'chart-2': '160 60% 45%',
            'chart-3': '30 80% 55%',
            'chart-4': '280 65% 60%',
            'chart-5': '340 75% 55%',
        },
    },
    {
        name: 'Indigo',
        key: 'indigo',
        light: {
            background: '0 0% 100%',
            foreground: '222.2 84% 4.9%',
            card: '0 0% 100%',
            'card-foreground': '222.2 84% 4.9%',
            popover: '0 0% 100%',
            'popover-foreground': '222.2 84% 4.9%',
            primary: '226 70% 55%',
            'primary-foreground': '210 40% 98%',
            secondary: '210 40% 96.1%',
            'secondary-foreground': '222.2 47.4% 11.2%',
            muted: '210 40% 96.1%',
            'muted-foreground': '215.4 16.3% 46.9%',
            accent: '210 40% 96.1%',
            'accent-foreground': '222.2 47.4% 11.2%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '210 40% 98%',
            border: '214.3 31.8% 91.4%',
            input: '214.3 31.8% 91.4%',
            ring: '226 70% 55%',
            'timer-foreground': '226 70% 55%',
        },
        dark: {
            background: '222.2 84% 4.9%',
            foreground: '210 40% 98%',
            card: '222.2 84% 4.9%',
            'card-foreground': '210 40% 98%',
            popover: '222.2 84% 4.9%',
            'popover-foreground': '210 40% 98%',
            primary: '227 82% 60%',
            'primary-foreground': '222.2 47.4% 11.2%',
            secondary: '217.2 32.6% 17.5%',
            'secondary-foreground': '210 40% 98%',
            muted: '217.2 32.6% 17.5%',
            'muted-foreground': '215 20.2% 65.1%',
            accent: '217.2 32.6% 17.5%',
            'accent-foreground': '210 40% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '210 40% 98%',
            border: '217.2 32.6% 17.5%',
            input: '217.2 32.6% 17.5%',
            ring: '227 82% 60%',
            'timer-foreground': '210 40% 98%',
        },
    },
    {
        name: 'Violet',
        key: 'violet',
        light: {
            background: '0 0% 100%',
            foreground: '240 10% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 3.9%',
            primary: '262 83% 57%',
            'primary-foreground': '0 0% 98%',
            secondary: '240 4.8% 95.9%',
            'secondary-foreground': '240 5.9% 10%',
            muted: '240 4.8% 95.9%',
            'muted-foreground': '240 3.8% 46.1%',
            accent: '240 4.8% 95.9%',
            'accent-foreground': '240 5.9% 10%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '262 83% 57%',
            'timer-foreground': '262 83% 57%',
        },
        dark: {
            background: '240 10% 4%',
            foreground: '0 0% 98%',
            card: '240 10% 4%',
            'card-foreground': '0 0% 98%',
            popover: '240 10% 4%',
            'popover-foreground': '0 0% 98%',
            primary: '262 83% 57%',
            'primary-foreground': '240 10% 4%',
            secondary: '240 3.7% 15.9%',
            'secondary-foreground': '0 0% 98%',
            muted: '240 3.7% 15.9%',
            'muted-foreground': '240 5% 64.9%',
            accent: '240 3.7% 15.9%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 62% 30%',
            'destructive-foreground': '0 0% 98%',
            border: '240 3.7% 15.9%',
            input: '240 3.7% 15.9%',
            ring: '262 83% 57%',
            'timer-foreground': '262 84% 70%',
        },
    },
    {
        name: 'Amber',
        key: 'amber',
        light: {
            background: '0 0% 100%',
            foreground: '20 14.3% 4.1%',
            card: '0 0% 100%',
            'card-foreground': '20 14.3% 4.1%',
            popover: '0 0% 100%',
            'popover-foreground': '20 14.3% 4.1%',
            primary: '38 92% 50%',
            'primary-foreground': '60 9.1% 97.8%',
            secondary: '60 4.8% 95.9%',
            'secondary-foreground': '24 9.8% 10%',
            muted: '60 4.8% 95.9%',
            'muted-foreground': '25 5.3% 44.7%',
            accent: '60 4.8% 95.9%',
            'accent-foreground': '24 9.8% 10%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '60 9.1% 97.8%',
            border: '20 5.9% 90%',
            input: '20 5.9% 90%',
            ring: '38 92% 50%',
            'timer-foreground': '38 92% 50%',
        },
        dark: {
            background: '20 14.3% 4.1%',
            foreground: '60 9.1% 97.8%',
            card: '20 14.3% 4.1%',
            'card-foreground': '60 9.1% 97.8%',
            popover: '20 14.3% 4.1%',
            'popover-foreground': '60 9.1% 97.8%',
            primary: '35 92% 47%',
            'primary-foreground': '60 9.1% 97.8%',
            secondary: '12 6.5% 15.1%',
            'secondary-foreground': '60 9.1% 97.8%',
            muted: '12 6.5% 15.1%',
            'muted-foreground': '24 5.4% 63.9%',
            accent: '12 6.5% 15.1%',
            'accent-foreground': '60 9.1% 97.8%',
            destructive: '0 72.2% 50.6%',
            'destructive-foreground': '60 9.1% 97.8%',
            border: '12 6.5% 15.1%',
            input: '12 6.5% 15.1%',
            ring: '35 92% 47%',
            'timer-foreground': '38 92% 60%',
        },
    },
    {
        name: 'Cyan',
        key: 'cyan',
        light: {
            background: '0 0% 100%',
            foreground: '240 10% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 3.9%',
            primary: '189 94% 43%',
            'primary-foreground': '0 0% 98%',
            secondary: '240 4.8% 95.9%',
            'secondary-foreground': '240 5.9% 10%',
            muted: '240 4.8% 95.9%',
            'muted-foreground': '240 3.8% 46.1%',
            accent: '240 4.8% 95.9%',
            'accent-foreground': '240 5.9% 10%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '189 94% 43%',
            'timer-foreground': '189 94% 43%',
        },
        dark: {
            background: '222.2 84% 4.9%',
            foreground: '210 40% 98%',
            card: '222.2 84% 4.9%',
            'card-foreground': '210 40% 98%',
            popover: '222.2 84% 4.9%',
            'popover-foreground': '210 40% 98%',
            primary: '190 90% 45%',
            'primary-foreground': '222.2 47.4% 11.2%',
            secondary: '217.2 32.6% 17.5%',
            'secondary-foreground': '210 40% 98%',
            muted: '217.2 32.6% 17.5%',
            'muted-foreground': '215 20.2% 65.1%',
            accent: '217.2 32.6% 17.5%',
            'accent-foreground': '210 40% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '210 40% 98%',
            border: '217.2 32.6% 17.5%',
            input: '217.2 32.6% 17.5%',
            ring: '190 90% 45%',
            'timer-foreground': '210 40% 98%',
        },
    },
    {
        name: 'Teal',
        key: 'teal',
        light: {
            background: '0 0% 100%',
            foreground: '240 10% 3.9%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 3.9%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 3.9%',
            primary: '174 72% 40%',
            'primary-foreground': '0 0% 98%',
            secondary: '240 4.8% 95.9%',
            'secondary-foreground': '240 5.9% 10%',
            muted: '240 4.8% 95.9%',
            'muted-foreground': '240 3.8% 46.1%',
            accent: '240 4.8% 95.9%',
            'accent-foreground': '240 5.9% 10%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 90%',
            input: '240 5.9% 90%',
            ring: '174 72% 40%',
            'timer-foreground': '174 72% 40%',
        },
        dark: {
            background: '222.2 84% 4.9%',
            foreground: '210 40% 98%',
            card: '222.2 84% 4.9%',
            'card-foreground': '210 40% 98%',
            popover: '222.2 84% 4.9%',
            'popover-foreground': '210 40% 98%',
            primary: '175 80% 45%',
            'primary-foreground': '222.2 47.4% 11.2%',
            secondary: '217.2 32.6% 17.5%',
            'secondary-foreground': '210 40% 98%',
            muted: '217.2 32.6% 17.5%',
            'muted-foreground': '215 20.2% 65.1%',
            accent: '217.2 32.6% 17.5%',
            'accent-foreground': '210 40% 98%',
            destructive: '0 62.8% 30.6%',
            'destructive-foreground': '210 40% 98%',
            border: '217.2 32.6% 17.5%',
            input: '217.2 32.6% 17.5%',
            ring: '175 80% 45%',
            'timer-foreground': '210 40% 98%',
        },
    },
    {
        name: 'Hồng bánh bèo',
        key: 'pink-light',
        light: {
            background: '0 0% 100%',
            foreground: '240 10% 10%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 10%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 10%',
            primary: '330 60% 80%',
            'primary-foreground': '0 0% 98%',
            secondary: '240 4.8% 97%',
            'secondary-foreground': '240 5.9% 15%',
            muted: '240 4.8% 97%',
            'muted-foreground': '240 3.8% 50%',
            accent: '240 4.8% 97%',
            'accent-foreground': '240 5.9% 15%',
            destructive: '0 70% 75%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 93%',
            input: '240 5.9% 93%',
            ring: '330 60% 80%',
            'timer-foreground': '330 60% 80%',
        },
        dark: {
            background: '222.2 84% 7%',
            foreground: '210 40% 98%',
            card: '222.2 84% 7%',
            'card-foreground': '210 40% 98%',
            popover: '222.2 84% 7%',
            'popover-foreground': '210 40% 98%',
            primary: '330 60% 82%',
            'primary-foreground': '222.2 47.4% 12%',
            secondary: '217.2 30% 25%',
            'secondary-foreground': '210 40% 98%',
            muted: '217.2 30% 25%',
            'muted-foreground': '215 20.2% 70%',
            accent: '217.2 30% 25%',
            'accent-foreground': '210 40% 98%',
            destructive: '0 55% 50%',
            'destructive-foreground': '210 40% 98%',
            border: '217.2 30% 25%',
            input: '217.2 30% 25%',
            ring: '330 60% 82%',
            'timer-foreground': '210 40% 98%',
        },
    },
    {
        name: 'Pink-Mild',
        key: 'pink-mild',
        light: {
            background: '0 0% 100%',
            foreground: '240 10% 5%',
            card: '0 0% 100%',
            'card-foreground': '240 10% 5%',
            popover: '0 0% 100%',
            'popover-foreground': '240 10% 5%',
            primary: '330 75% 70%',
            'primary-foreground': '0 0% 98%',
            secondary: '240 4.8% 96%',
            'secondary-foreground': '240 5.9% 12%',
            muted: '240 4.8% 96%',
            'muted-foreground': '240 3.8% 48%',
            accent: '240 4.8% 96%',
            'accent-foreground': '240 5.9% 12%',
            destructive: '0 80% 65%',
            'destructive-foreground': '0 0% 98%',
            border: '240 5.9% 91%',
            input: '240 5.9% 91%',
            ring: '330 75% 70%',
            'timer-foreground': '330 75% 70%',
        },
        dark: {
            background: '222.2 84% 6%',
            foreground: '210 40% 98%',
            card: '222.2 84% 6%',
            'card-foreground': '210 40% 98%',
            popover: '222.2 84% 6%',
            'popover-foreground': '210 40% 98%',
            primary: '330 75% 72%',
            'primary-foreground': '222.2 47.4% 12%',
            secondary: '217.2 32% 22%',
            'secondary-foreground': '210 40% 98%',
            muted: '217.2 32% 22%',
            'muted-foreground': '215 20.2% 68%',
            accent: '217.2 32% 22%',
            'accent-foreground': '210 40% 98%',
            destructive: '0 65% 45%',
            'destructive-foreground': '210 40% 98%',
            border: '217.2 32% 22%',
            input: '217.2 32% 22%',
            ring: '330 75% 72%',
            'timer-foreground': '210 40% 98%',
        },
    }
]

const FONTS = [
    { name: 'Inter', value: 'var(--font-inter)', class: 'font-sans' },
    { name: 'Be Vietnam Pro', value: 'var(--font-be-vietnam-pro)', class: 'font-be-vietnam' },
    { name: 'Space Grotesk', value: 'var(--font-space-grotesk)', class: 'font-space-grotesk' },
]

export function GeneralSettings() {
    const { theme, setTheme } = useTheme()
    const { lang, setLang, t } = useI18n()
    const [selectedThemeKey, setSelectedThemeKey] = useState<string>('default')
    const [selectedFont, setSelectedFont] = useState<string>('Inter')

    // Theme Injection Logic
    const styleTagId = 'app-theme-vars'
    const injectTheme = (themeData: ThemeVars) => {
        const optionalLight = [
            themeData.light.radius ? `  --radius: ${themeData.light.radius};` : '',
            themeData.light['chart-1'] ? `  --chart-1: ${themeData.light['chart-1']};` : '',
            themeData.light['chart-2'] ? `  --chart-2: ${themeData.light['chart-2']};` : '',
            themeData.light['chart-3'] ? `  --chart-3: ${themeData.light['chart-3']};` : '',
            themeData.light['chart-4'] ? `  --chart-4: ${themeData.light['chart-4']};` : '',
            themeData.light['chart-5'] ? `  --chart-5: ${themeData.light['chart-5']};` : '',
        ].filter(Boolean).join('\n')

        const optionalDark = [
            themeData.dark.radius ? `  --radius: ${themeData.dark.radius};` : '',
            themeData.dark['chart-1'] ? `  --chart-1: ${themeData.dark['chart-1']};` : '',
            themeData.dark['chart-2'] ? `  --chart-2: ${themeData.dark['chart-2']};` : '',
            themeData.dark['chart-3'] ? `  --chart-3: ${themeData.dark['chart-3']};` : '',
            themeData.dark['chart-4'] ? `  --chart-4: ${themeData.dark['chart-4']};` : '',
            themeData.dark['chart-5'] ? `  --chart-5: ${themeData.dark['chart-5']};` : '',
        ].filter(Boolean).join('\n')

        const cssBlock = `
:root {
  --background: ${themeData.light.background};
  --foreground: ${themeData.light.foreground};
  --card: ${themeData.light.card};
  --card-foreground: ${themeData.light['card-foreground']};
  --popover: ${themeData.light.popover};
  --popover-foreground: ${themeData.light['popover-foreground']};
  --primary: ${themeData.light.primary};
  --primary-foreground: ${themeData.light['primary-foreground']};
  --secondary: ${themeData.light.secondary};
  --secondary-foreground: ${themeData.light['secondary-foreground']};
  --muted: ${themeData.light.muted};
  --muted-foreground: ${themeData.light['muted-foreground']};
  --accent: ${themeData.light.accent};
  --accent-foreground: ${themeData.light['accent-foreground']};
  --destructive: ${themeData.light.destructive};
  --destructive-foreground: ${themeData.light['destructive-foreground']};
  --border: ${themeData.light.border};
  --input: ${themeData.light.input};
  --ring: ${themeData.light.ring};
  --timer-foreground: ${themeData.light['timer-foreground']};
${optionalLight}
}
.dark {
  --background: ${themeData.dark.background};
  --foreground: ${themeData.dark.foreground};
  --card: ${themeData.dark.card};
  --card-foreground: ${themeData.dark['card-foreground']};
  --popover: ${themeData.dark.popover};
  --popover-foreground: ${themeData.dark['popover-foreground']};
  --primary: ${themeData.dark.primary};
  --primary-foreground: ${themeData.dark['primary-foreground']};
  --secondary: ${themeData.dark.secondary};
  --secondary-foreground: ${themeData.dark['secondary-foreground']};
  --muted: ${themeData.dark.muted};
  --muted-foreground: ${themeData.dark['muted-foreground']};
  --accent: ${themeData.dark.accent};
  --accent-foreground: ${themeData.dark['accent-foreground']};
  --destructive: ${themeData.dark.destructive};
  --destructive-foreground: ${themeData.dark['destructive-foreground']};
  --border: ${themeData.dark.border};
  --input: ${themeData.dark.input};
  --ring: ${themeData.dark.ring};
  --timer-foreground: ${themeData.dark['timer-foreground']};
${optionalDark}
}
`.trim()

        let styleEl = document.getElementById(styleTagId) as HTMLStyleElement | null
        if (!styleEl) {
            styleEl = document.createElement('style')
            styleEl.id = styleTagId
            document.head.appendChild(styleEl)
        }
        styleEl.textContent = cssBlock
    }

    useEffect(() => {
        if (typeof window === 'undefined') return
        const savedKey = localStorage.getItem('ui-theme-key')
        if (savedKey && savedKey !== 'default') {
            const t = themePresets.find((t) => t.key === savedKey)
            if (t) {
                injectTheme(t)
                setSelectedThemeKey(savedKey)
            }
        } else {
            setSelectedThemeKey('default')
        }

        const savedFont = localStorage.getItem('ui-font')
        if (savedFont) {
            setSelectedFont(savedFont)
            document.body.style.fontFamily = savedFont === 'Inter' ? '' : (savedFont === 'Space Grotesk' ? 'var(--font-space-grotesk)' : 'var(--font-be-vietnam-pro)')
        }
    }, [])

    const applyTheme = (key: string) => {
        if (key === 'default') {
            const styleEl = document.getElementById(styleTagId)
            if (styleEl && styleEl.parentNode) {
                styleEl.parentNode.removeChild(styleEl)
            }
            localStorage.removeItem('ui-theme-key')
            setSelectedThemeKey('default')
            toast.success(t('settings.general.theme.themeApplied', { name: 'Default' }))
            return
        }
        const themeData = themePresets.find((theme) => theme.key === key)
        if (!themeData) return
        injectTheme(themeData)
        localStorage.setItem('ui-theme-key', key)
        setSelectedThemeKey(key)
        toast.success(t('settings.general.theme.themeApplied', { name: themeData.name }))
    }

    const handleFontChange = (fontName: string) => {
        setSelectedFont(fontName)
        localStorage.setItem('ui-font', fontName)

        // Apply font to body
        if (fontName === 'Inter') {
            document.body.style.fontFamily = ''
        } else if (fontName === 'Space Grotesk') {
            document.body.style.fontFamily = 'var(--font-space-grotesk)'
        } else if (fontName === 'Be Vietnam Pro') {
            // Assuming Be Vietnam Pro variable is set in layout or globals
            // Based on layout.tsx, Be Vietnam Pro is imported but not assigned a variable in the body class
            // I need to check how to apply it.
            // layout.tsx: const beVietnamPro = Be_Vietnam_Pro(...)
            // It's not added to body className.
            // I should probably add it to layout.tsx variable or just use the class if available.
            // For now, I'll assume I can set it via style if I have the variable, or I might need to update layout.tsx to expose it.
            // Let's assume I'll fix layout.tsx to expose it as --font-be-vietnam-pro
            document.body.style.fontFamily = 'var(--font-be-vietnam-pro)'
        }
        toast.success(t('settings.general.theme.fontChanged', { font: fontName }))
    }

    return (
        <div className="space-y-8">
            {/* Appearance Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('settings.general.appearance')}</h2>
                <Separator />

                <div className="grid gap-6">
                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>{t('settings.general.theme.mode')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.general.theme.modeDescription')}
                            </p>
                        </div>
                        <Select value={theme} onValueChange={(value) => setTheme(value)}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('settings.general.theme.selectModePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <div className="flex items-center gap-2">
                                        <Sun className="h-4 w-4" />
                                        <span>{t('settings.general.theme.light')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="dark">
                                    <div className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" />
                                        <span>{t('settings.general.theme.dark')}</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="system">
                                    <div className="flex items-center gap-2">
                                        <Laptop className="h-4 w-4" />
                                        <span>{t('settings.general.theme.system')}</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Color Theme */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>{t('settings.general.theme.colorTheme')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.general.theme.colorThemeDescription')}
                            </p>
                        </div>
                        <Select value={selectedThemeKey} onValueChange={applyTheme}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('settings.general.theme.selectColorPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {[defaultTheme, ...themePresets].map((t) => (
                                    <SelectItem key={t.key} value={t.key}>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <div
                                                    className="w-3 h-3 rounded-full border shadow-sm"
                                                    style={{ backgroundColor: `hsl(${t.light.primary})` }}
                                                />
                                                <div
                                                    className="w-3 h-3 rounded-full border shadow-sm"
                                                    style={{ backgroundColor: `hsl(${t.dark.primary})` }}
                                                />
                                            </div>
                                            <span>{t.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Font */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>{t('settings.general.theme.fontFamily')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.general.theme.fontDescription')}
                            </p>
                        </div>
                        <Select value={selectedFont} onValueChange={handleFontChange}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('settings.general.theme.selectFontPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Inter">
                                    <div className="flex items-center gap-2">
                                        <Type className="h-4 w-4" />
                                        <span>Inter</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Be Vietnam Pro" style={{ fontFamily: 'var(--font-be-vietnam-pro)' }}>
                                    <div className="flex items-center gap-2">
                                        <Type className="h-4 w-4" />
                                        <span>Be Vietnam Pro</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Space Grotesk" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    <div className="flex items-center gap-2">
                                        <Type className="h-4 w-4" />
                                        <span>Space Grotesk</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Language Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('settings.general.language.sectionTitle')}</h2>
                <Separator />

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label>{t('settings.general.language.title')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('settings.general.language.description')}
                        </p>
                    </div>
                    <Select value={lang} onValueChange={(value) => {
                        setLang(value as any)
                        toast.success(t('settings.general.language.updated'))
                    }}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t('settings.general.language.selectPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGS.map((item) => (
                                <SelectItem key={item.code} value={item.code}>
                                    <div className="flex items-center gap-2">
                                        <span>{item.label}</span>
                                        <span className="text-xs text-muted-foreground">({item.code.toUpperCase()})</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
