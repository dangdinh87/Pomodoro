"use client"

import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Check, X } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils'
import { useTimerStore } from '@/stores/timer-store'
import { toast } from 'sonner'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-section'
import { useI18n } from '@/contexts/i18n-context'
import { FlipClock } from '@/app/(main)/timer/components/clocks/flip-clock'

const PREVIEW_DIGITS = { small: 'text-3xl', medium: 'text-5xl', large: 'text-6xl' } as const
const PREVIEW_ANALOG = {
    small: { box: 'size-24', text: 'text-sm' },
    medium: { box: 'size-32', text: 'text-lg' },
    large: { box: 'size-40', text: 'text-xl' },
} as const

type ClockType = 'digital' | 'analog' | 'progress' | 'flip' | 'animated'

interface TimerSettingsData {
    workDuration: number
    shortBreakDuration: number
    longBreakDuration: number
    longBreakInterval: number
    autoStartBreak: boolean
    autoStartWork: boolean
    clockType: ClockType
    clockSize: 'small' | 'medium' | 'large'
    showClock: boolean
    lowTimeWarningEnabled: boolean
}

export function TimerSettings({ onClose }: { onClose?: () => void }) {
    const { t } = useI18n()
    const { settings, updateSettings } = useTimerStore()
    const [localSettings, setLocalSettings] = useState<TimerSettingsData>({
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreak: true,
        autoStartWork: true,
        clockType: 'digital',
        clockSize: 'medium',
        showClock: false,
        lowTimeWarningEnabled: true,
    })

    // form inputs as strings to allow free typing, then clamp on blur/save
    const [workStr, setWorkStr] = useState<string>('25')
    const [shortStr, setShortStr] = useState<string>('5')
    const [longStr, setLongStr] = useState<string>('15')
    const [intervalStr, setIntervalStr] = useState<string>('4')

    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
    const toInt = (v: string, def: number) => {
        const n = parseInt(v, 10)
        return isNaN(n) ? def : n
    }

    const normalizeSettings = (): TimerSettingsData => {
        const work = clamp(toInt(workStr, localSettings.workDuration), 1, 60)
        const shortB = clamp(toInt(shortStr, localSettings.shortBreakDuration), 1, 30)
        const longB = clamp(toInt(longStr, localSettings.longBreakDuration), 1, 60)
        const interval = clamp(toInt(intervalStr, localSettings.longBreakInterval), 2, 10)
        return {
            workDuration: work,
            shortBreakDuration: shortB,
            longBreakDuration: longB,
            longBreakInterval: interval,
            autoStartBreak: localSettings.autoStartBreak,
            autoStartWork: localSettings.autoStartWork,
            clockType: localSettings.clockType,
            clockSize: localSettings.clockSize,
            showClock: localSettings.showClock,
            lowTimeWarningEnabled: localSettings.lowTimeWarningEnabled,
        }
    }

    useEffect(() => {
        setLocalSettings((prev) => ({
            ...prev,
            workDuration: settings.workDuration ?? 25,
            shortBreakDuration: settings.shortBreakDuration ?? 5,
            longBreakDuration: settings.longBreakDuration ?? 15,
            longBreakInterval: settings.longBreakInterval ?? 4,
            autoStartBreak: settings.autoStartBreak ?? true,
            autoStartWork: settings.autoStartWork ?? true,
            clockType: settings.clockType ?? 'digital',
            clockSize: settings.clockSize ?? 'medium',
            showClock: settings.showClock ?? false,
            lowTimeWarningEnabled: settings.lowTimeWarningEnabled ?? true,
        }))
        setWorkStr(String(settings.workDuration ?? 25))
        setShortStr(String(settings.shortBreakDuration ?? 5))
        setLongStr(String(settings.longBreakDuration ?? 15))
        setIntervalStr(String(settings.longBreakInterval ?? 4))
    }, [settings])

    const saveSettings = () => {
        const normalized = normalizeSettings()
        setLocalSettings(normalized)
        setWorkStr(String(normalized.workDuration))
        setShortStr(String(normalized.shortBreakDuration))
        setLongStr(String(normalized.longBreakDuration))
        setIntervalStr(String(normalized.longBreakInterval))
        updateSettings(normalized)
        toast.success(t('timerSettings.toasts.saved'))
        onClose?.()
    }

    const resetToDefaults = () => {
        const defaults: TimerSettingsData = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreak: true,
            autoStartWork: true,
            clockType: 'digital',
            clockSize: 'medium',
            showClock: false,
            lowTimeWarningEnabled: true,
        }
        setLocalSettings(defaults)
        setWorkStr('25')
        setShortStr('5')
        setLongStr('15')
        setIntervalStr('4')
        toast.success(t('timerSettings.toasts.reset'))
    }

    const formatPreview = (mins: number) =>
        `${String(Math.max(0, Math.min(99, mins))).padStart(2, '0')}:00`;
    const previewTime = formatPreview(clamp(toInt(workStr, localSettings.workDuration), 0, 99));

    const commit = (str: string, fallback: number, min: number, max: number, set: (v: string) => void, key: keyof TimerSettingsData) => {
        const n = clamp(toInt(str, fallback), min, max)
        set(String(n))
        setLocalSettings({ ...localSettings, [key]: n })
    }

    const durationRow = (
        id: string,
        label: string,
        unit: string,
        str: string,
        setStr: (v: string) => void,
        fallback: number,
        min: number,
        max: number,
        key: keyof TimerSettingsData,
    ) => (
        <SettingsRow label={label}>
            <div className="relative ml-auto w-28">
                <Input
                    id={id}
                    type="number"
                    inputMode="numeric"
                    min={min}
                    max={max}
                    value={str}
                    onChange={(e) => {
                        const v = e.target.value
                        if (v === '' || /^[0-9]{0,2}$/.test(v)) setStr(v)
                    }}
                    onBlur={() => commit(str, fallback, min, max, setStr, key)}
                    className="pr-14 tabular-nums"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">{unit}</span>
            </div>
        </SettingsRow>
    )

    const toggleRow = (id: string, label: string, description: string, key: 'autoStartBreak' | 'autoStartWork' | 'lowTimeWarningEnabled') => (
        <SettingsRow label={label} description={description}>
            <div className="flex sm:justify-end">
                <Switch
                    id={id}
                    checked={localSettings[key]}
                    onCheckedChange={(checked) => setLocalSettings({ ...localSettings, [key]: checked })}
                />
            </div>
        </SettingsRow>
    )

    const clockOptions: { value: ClockType; label: string; glyph: ReactNode }[] = [
        { value: 'digital', label: t('timerSettings.labels.digital'), glyph: <span className="font-heading text-base font-bold tabular-nums">25:00</span> },
        {
            value: 'analog',
            label: t('timerSettings.labels.analog'),
            glyph: (
                <svg viewBox="0 0 40 40" className="size-9 -rotate-90" aria-hidden>
                    <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                    <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="100.5" strokeDashoffset="25" />
                </svg>
            ),
        },
        {
            value: 'flip',
            label: t('timerSettings.labels.flip'),
            glyph: (
                <span className="flex items-center gap-1 font-heading text-base font-bold tabular-nums">
                    <span className="rounded bg-surface-raised px-1.5 py-0.5">25</span>
                    <span className="rounded bg-surface-raised px-1.5 py-0.5">00</span>
                </span>
            ),
        },
        {
            value: 'progress',
            label: t('timerSettings.labels.progress'),
            glyph: (
                <span className="flex w-16 flex-col items-center gap-1.5">
                    <span className="font-heading text-sm font-bold tabular-nums">25:00</span>
                    <span className="h-1 w-full overflow-hidden rounded-full bg-surface-raised">
                        <span className="block h-full w-3/4 rounded-full bg-current" />
                    </span>
                </span>
            ),
        },
    ]

    const body = (
        <div className="space-y-8">
            <SettingsSection title={t('timerSettings.labels.timerDurations')}>
                {durationRow('work-duration', t('timerSettings.labels.workDuration'), t('settingsUi.unitMin'), workStr, setWorkStr, localSettings.workDuration, 1, 60, 'workDuration')}
                {durationRow('short-break-duration', t('timerSettings.labels.shortBreakDuration'), t('settingsUi.unitMin'), shortStr, setShortStr, localSettings.shortBreakDuration, 1, 30, 'shortBreakDuration')}
                {durationRow('long-break-duration', t('timerSettings.labels.longBreakDuration'), t('settingsUi.unitMin'), longStr, setLongStr, localSettings.longBreakDuration, 1, 60, 'longBreakDuration')}
                {durationRow('long-break-interval', t('timerSettings.labels.longBreakInterval'), t('settingsUi.unitSessions'), intervalStr, setIntervalStr, localSettings.longBreakInterval, 2, 10, 'longBreakInterval')}
            </SettingsSection>

            <SettingsSection title={t('timerSettings.labels.behavior')}>
                {toggleRow('auto-start-break', t('timerSettings.labels.autoStartBreaks'), t('settingsUi.autoStartBreakHint'), 'autoStartBreak')}
                {toggleRow('auto-start-work', t('timerSettings.labels.autoStartWork'), t('settingsUi.autoStartWorkHint'), 'autoStartWork')}
                {toggleRow('low-time-warning', t('timerSettings.labels.lowTimeWarning'), t('settingsUi.lowTimeWarningHint'), 'lowTimeWarningEnabled')}
            </SettingsSection>

            <SettingsSection title={t('timerSettings.labels.clockDisplay')}>
                <div className="space-y-3 px-5 py-4">
                    <div className="space-y-0.5">
                        <p id="clock-style-label" className="text-[0.9375rem] font-semibold text-ink">{t('timerSettings.labels.clockStyle')}</p>
                        <p className="text-[0.8125rem] text-ink-muted">{t('settingsUi.clockStyleHint')}</p>
                    </div>
                    <div role="radiogroup" aria-labelledby="clock-style-label" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {clockOptions.map(({ value, label, glyph }) => {
                            const selected = localSettings.clockType === value
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => setLocalSettings({ ...localSettings, clockType: value })}
                                    className={cn(
                                        'flex flex-col items-center gap-2 rounded-lg border bg-surface px-3 pb-2.5 pt-3 text-[0.8125rem] transition-[border-color,box-shadow] duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand',
                                        selected ? 'border-transparent ring-2 ring-brand' : 'border-border hover:border-border-strong',
                                    )}
                                >
                                    <span className="flex h-12 items-center justify-center text-timer">{glyph}</span>
                                    <span className={cn('flex items-center gap-1', selected ? 'font-semibold text-ink' : 'font-medium text-ink-secondary')}>
                                        {selected && <Check size={12} weight="bold" className="text-brand" aria-hidden />}
                                        {label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
                <SettingsRow label={t('timerSettings.labels.clockSize')} description={t('settingsUi.clockSizeHint')}>
                    <Select
                        value={localSettings.clockSize}
                        onValueChange={(value: 'small' | 'medium' | 'large') =>
                            setLocalSettings({ ...localSettings, clockSize: value })
                        }
                    >
                        <SelectTrigger id="clock-size">
                            <SelectValue placeholder={t('timerSettings.labels.selectSize')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="small">{t('timerSettings.labels.small')}</SelectItem>
                            <SelectItem value="medium">{t('timerSettings.labels.medium')}</SelectItem>
                            <SelectItem value="large">{t('timerSettings.labels.large')}</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingsRow>
            </SettingsSection>

            <section className="space-y-3">
                <h2 className="font-body text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">{t('settingsUi.livePreview')}</h2>
                <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border bg-surface-raised p-6">
                    {(localSettings.clockType === 'digital' || localSettings.clockType === 'progress') && (
                        <div className="flex flex-col items-center gap-4">
                            <div className={cn(PREVIEW_DIGITS[localSettings.clockSize], 'font-heading font-bold tabular-nums text-timer')}>
                                {previewTime}
                            </div>
                            {localSettings.clockType === 'progress' && (
                                <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface">
                                    <div className="h-full w-3/4 rounded-full bg-timer" />
                                </div>
                            )}
                        </div>
                    )}
                    {localSettings.clockType === 'analog' && (
                        <div className={cn('relative text-timer', PREVIEW_ANALOG[localSettings.clockSize].box)}>
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200" aria-label="Analog preview">
                                <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="8" fill="none" className="opacity-20" />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 90}`}
                                    strokeDashoffset={`${2 * Math.PI * 90 * 0.25}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className={cn('absolute inset-0 flex items-center justify-center font-heading font-bold tabular-nums', PREVIEW_ANALOG[localSettings.clockSize].text)}>
                                {previewTime}
                            </div>
                        </div>
                    )}
                    {localSettings.clockType === 'flip' && (
                        <div className="flex w-full origin-center scale-[0.6] justify-center">
                            <FlipClock
                                formattedTime={previewTime}
                                timeLeft={clamp(toInt(workStr, localSettings.workDuration), 0, 99) * 60}
                                isRunning={false}
                                clockSize={localSettings.clockSize}
                            />
                        </div>
                    )}
                </div>
            </section>
        </div>
    )

    if (!onClose) {
        return (
            <div className="space-y-6">
                {body}
                <div className="flex justify-between border-t border-border pt-4">
                    <Button variant="outline" onClick={resetToDefaults}>{t('timerSettings.actions.resetDefaults')}</Button>
                    <Button onClick={saveSettings}>{t('timerSettings.actions.saveChanges')}</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-4">
                <h2 className="font-heading text-lg font-semibold text-ink">{t('timerSettings.title')}</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={resetToDefaults} size="sm">{t('timerSettings.actions.resetDefaults')}</Button>
                    <Button onClick={saveSettings} size="sm">{t('timerSettings.actions.save')}</Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X size={16} />
                        <span className="sr-only">{t('common.close')}</span>
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">{body}</div>
        </div>
    )
}
