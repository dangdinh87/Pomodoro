import type { Lang } from '@/contexts/i18n-context'

export const INTL_LOCALE: Record<Lang, string> = { en: 'en-US', vi: 'vi-VN', ja: 'ja-JP' }

// API dates are plain yyyy-MM-dd; parse as local so the weekday never shifts across time zones.
export function parseDayKey(key: string): Date {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export function toDayKey(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${m}-${d}`
}
