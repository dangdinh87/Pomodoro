"use client"

import { useEffect, useRef, useState, type Ref } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Minus, Plus, X } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils'
import { useTimerStore, type ClockType } from '@/stores/timer-store'
import { toast } from 'sonner'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-section'
import { useI18n } from '@/contexts/i18n-context'
import { ClockStylePicker } from '@/features/timer/components/clocks/clock-style-picker'
import { isThreeDClock, resolveClockType } from '@/features/timer/components/clocks/clock-registry'
import {
    DURATION_PRESETS,
    clampDuration,
    cycleMinutes,
    matchPreset,
    parseDuration,
    type DurationKey,
} from '@/components/settings/timer-presets'

type ClockSize = 'small' | 'medium' | 'large'

interface TimerSettingsData {
    workDuration: number
    shortBreakDuration: number
    longBreakDuration: number
    longBreakInterval: number
    autoStartBreak: boolean
    autoStartWork: boolean
    clockType: ClockType
    clockSize: ClockSize
    showClock: boolean
    lowTimeWarningEnabled: boolean
}

const DEFAULTS: TimerSettingsData = {
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

const toDraft = (s: TimerSettingsData): Record<DurationKey, string> => ({
    workDuration: String(s.workDuration),
    shortBreakDuration: String(s.shortBreakDuration),
    longBreakDuration: String(s.longBreakDuration),
    longBreakInterval: String(s.longBreakInterval),
})

const SIZES: ClockSize[] = ['small', 'medium', 'large']

function DurationStepper({
    id,
    label,
    unit,
    value,
    onType,
    onCommit,
    onStep,
    inputRef,
    decLabel,
    incLabel,
}: {
    id: string
    label: string
    unit: string
    value: string
    onType: (v: string) => void
    onCommit: () => void
    onStep: (delta: number) => void
    inputRef?: Ref<HTMLInputElement>
    decLabel: string
    incLabel: string
}) {
    const stepBtn = 'flex w-10 shrink-0 items-center justify-center text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-hidden focus-visible:bg-surface-hover'
    return (
        <div className="min-w-0 space-y-1.5">
            <label htmlFor={id} className="block truncate text-[0.8125rem] font-semibold text-ink">
                {label}
                <span className="ml-1 font-normal text-ink-muted">· {unit}</span>
            </label>
            <div className="flex h-11 items-stretch divide-x divide-border overflow-hidden rounded-md border border-border bg-surface focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand sm:h-10">
                <button type="button" className={stepBtn} onClick={() => onStep(-1)} aria-label={decLabel}>
                    <Minus size={14} weight="bold" aria-hidden />
                </button>
                <input
                    id={id}
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={value}
                    onChange={(e) => {
                        const v = e.target.value
                        if (v === '' || /^[0-9]{0,3}$/.test(v)) onType(v)
                    }}
                    onBlur={onCommit}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') { e.preventDefault(); onStep(1) }
                        if (e.key === 'ArrowDown') { e.preventDefault(); onStep(-1) }
                        if (e.key === 'Enter') onCommit()
                    }}
                    className="min-w-0 flex-1 bg-transparent text-center text-base font-semibold tabular-nums text-ink outline-hidden"
                />
                <button type="button" className={stepBtn} onClick={() => onStep(1)} aria-label={incLabel}>
                    <Plus size={14} weight="bold" aria-hidden />
                </button>
            </div>
        </div>
    )
}

const pillBase = 'inline-flex h-9 items-center justify-center rounded-full px-3.5 text-[0.8125rem] font-semibold tabular-nums transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
const pillOn = 'bg-primary text-primary-foreground'
const pillOff = 'bg-surface-raised text-ink-secondary hover:bg-surface-hover hover:text-ink'

export function TimerSettings({ onClose }: { onClose?: () => void }) {
    const { t } = useI18n()
    const { settings, updateSettings } = useTimerStore()
    const [local, setLocal] = useState<TimerSettingsData>(DEFAULTS)
    // Free typing happens in string drafts; they are clamped on blur / save.
    const [draft, setDraft] = useState<Record<DurationKey, string>>(toDraft(DEFAULTS))
    const workInput = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const next: TimerSettingsData = {
            workDuration: settings.workDuration ?? DEFAULTS.workDuration,
            shortBreakDuration: settings.shortBreakDuration ?? DEFAULTS.shortBreakDuration,
            longBreakDuration: settings.longBreakDuration ?? DEFAULTS.longBreakDuration,
            longBreakInterval: settings.longBreakInterval ?? DEFAULTS.longBreakInterval,
            autoStartBreak: settings.autoStartBreak ?? DEFAULTS.autoStartBreak,
            autoStartWork: settings.autoStartWork ?? DEFAULTS.autoStartWork,
            clockType: resolveClockType(settings.clockType),
            clockSize: settings.clockSize ?? DEFAULTS.clockSize,
            showClock: settings.showClock ?? DEFAULTS.showClock,
            lowTimeWarningEnabled: settings.lowTimeWarningEnabled ?? DEFAULTS.lowTimeWarningEnabled,
        }
        setLocal(next)
        setDraft(toDraft(next))
    }, [settings])

    const durationsFromDraft = (): Pick<TimerSettingsData, DurationKey> => ({
        workDuration: parseDuration('workDuration', draft.workDuration, local.workDuration),
        shortBreakDuration: parseDuration('shortBreakDuration', draft.shortBreakDuration, local.shortBreakDuration),
        longBreakDuration: parseDuration('longBreakDuration', draft.longBreakDuration, local.longBreakDuration),
        longBreakInterval: parseDuration('longBreakInterval', draft.longBreakInterval, local.longBreakInterval),
    })

    const commit = (key: DurationKey) => {
        const n = parseDuration(key, draft[key], local[key])
        setDraft((d) => ({ ...d, [key]: String(n) }))
        setLocal((l) => ({ ...l, [key]: n }))
    }

    const step = (key: DurationKey, delta: number) => {
        const n = clampDuration(key, parseDuration(key, draft[key], local[key]) + delta)
        setDraft((d) => ({ ...d, [key]: String(n) }))
        setLocal((l) => ({ ...l, [key]: n }))
    }

    const applyPreset = (index: number) => {
        const p = DURATION_PRESETS[index]
        setLocal((l) => ({ ...l, ...p }))
        setDraft((d) => ({
            ...d,
            workDuration: String(p.workDuration),
            shortBreakDuration: String(p.shortBreakDuration),
            longBreakDuration: String(p.longBreakDuration),
        }))
    }

    const saveSettings = () => {
        const normalized: TimerSettingsData = { ...local, ...durationsFromDraft() }
        setLocal(normalized)
        setDraft(toDraft(normalized))
        updateSettings(normalized)
        toast.success(t('timerSettings.toasts.saved'))
        onClose?.()
    }

    const resetToDefaults = () => {
        setLocal(DEFAULTS)
        setDraft(toDraft(DEFAULTS))
        toast.success(t('timerSettings.toasts.reset'))
    }

    const live = { ...local, ...durationsFromDraft() }
    const activePreset = matchPreset(live.workDuration, live.shortBreakDuration)
    const unitMin = t('settingsUi.unitMin')

    const durationFields: { key: DurationKey; id: string; label: string; unit: string }[] = [
        { key: 'workDuration', id: 'work-duration', label: t('timerSettings.labels.workDuration'), unit: unitMin },
        { key: 'shortBreakDuration', id: 'short-break-duration', label: t('timerSettings.labels.shortBreakDuration'), unit: unitMin },
        { key: 'longBreakDuration', id: 'long-break-duration', label: t('timerSettings.labels.longBreakDuration'), unit: unitMin },
        { key: 'longBreakInterval', id: 'long-break-interval', label: t('timerSettings.labels.longBreakInterval'), unit: t('settingsUi.unitSessions') },
    ]

    const toggleRow = (id: string, label: string, description: string, key: 'autoStartBreak' | 'autoStartWork' | 'lowTimeWarningEnabled') => (
        <SettingsRow label={label} description={description}>
            <div className="flex sm:justify-end">
                <Switch
                    id={id}
                    checked={local[key]}
                    aria-label={label}
                    onCheckedChange={(checked) => setLocal((l) => ({ ...l, [key]: checked }))}
                />
            </div>
        </SettingsRow>
    )

    const sizeLabels: Record<ClockSize, string> = {
        small: t('timerSettings.labels.small'),
        medium: t('timerSettings.labels.medium'),
        large: t('timerSettings.labels.large'),
    }

    const body = (
        <div className="space-y-8">
            <SettingsSection title={t('timerSettings.labels.timerDurations')}>
                <div className="space-y-3 px-5 py-4">
                    <p id="duration-presets-label" className="text-[0.9375rem] font-semibold text-ink">{t('timerSettings.presets.title')}</p>
                    <div role="group" aria-labelledby="duration-presets-label" className="flex flex-wrap gap-2">
                        {DURATION_PRESETS.map((p, i) => (
                            <button
                                key={`${p.workDuration}-${p.shortBreakDuration}`}
                                type="button"
                                aria-pressed={activePreset === i}
                                aria-label={t('timerSettings.presets.label', { focus: p.workDuration, rest: p.shortBreakDuration })}
                                onClick={() => applyPreset(i)}
                                className={cn(pillBase, activePreset === i ? pillOn : pillOff)}
                            >
                                {p.workDuration} / {p.shortBreakDuration}
                            </button>
                        ))}
                        <button
                            type="button"
                            aria-pressed={activePreset === -1}
                            onClick={() => workInput.current?.focus()}
                            className={cn(pillBase, activePreset === -1 ? pillOn : pillOff)}
                        >
                            {t('timerSettings.presets.custom')}
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-4 lg:grid-cols-4">
                    {durationFields.map((f) => (
                        <DurationStepper
                            key={f.key}
                            id={f.id}
                            label={f.label}
                            unit={f.unit}
                            value={draft[f.key]}
                            inputRef={f.key === 'workDuration' ? workInput : undefined}
                            onType={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                            onCommit={() => commit(f.key)}
                            onStep={(delta) => step(f.key, delta)}
                            decLabel={t('timerSettings.stepper.decrease', { label: f.label })}
                            incLabel={t('timerSettings.stepper.increase', { label: f.label })}
                        />
                    ))}
                </div>
                <p className="px-5 py-3 text-[0.8125rem] text-ink-muted">
                    {t('timerSettings.cycleSummary', { sessions: live.longBreakInterval, total: cycleMinutes(live) })}
                </p>
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
                    <ClockStylePicker
                        value={resolveClockType(local.clockType)}
                        onChange={(clockType) => setLocal((l) => ({ ...l, clockType }))}
                        workMinutes={live.workDuration}
                        warn={local.lowTimeWarningEnabled}
                        labelledBy="clock-style-label"
                    />
                    {isThreeDClock(local.clockType) && (
                        <p className="text-[0.8125rem] text-ink-muted">{t('clockStyles.webglNote')}</p>
                    )}
                </div>
                <SettingsRow label={t('timerSettings.labels.clockSize')} description={t('settingsUi.clockSizeHint')}>
                    <div role="radiogroup" aria-label={t('timerSettings.labels.clockSize')} className="flex gap-2 sm:justify-end">
                        {SIZES.map((size) => (
                            <button
                                key={size}
                                type="button"
                                role="radio"
                                aria-checked={local.clockSize === size}
                                onClick={() => setLocal((l) => ({ ...l, clockSize: size }))}
                                className={cn(pillBase, 'flex-1 sm:flex-none', local.clockSize === size ? pillOn : pillOff)}
                            >
                                {sizeLabels[size]}
                            </button>
                        ))}
                    </div>
                </SettingsRow>
            </SettingsSection>
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
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="truncate font-heading text-lg font-semibold text-ink">{t('timerSettings.title')}</h2>
                <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" onClick={resetToDefaults} size="sm" className="hidden sm:inline-flex">{t('timerSettings.actions.resetDefaults')}</Button>
                    <Button onClick={saveSettings} size="sm">{t('timerSettings.actions.save')}</Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X size={16} />
                        <span className="sr-only">{t('common.close')}</span>
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                {body}
                <Button variant="outline" onClick={resetToDefaults} className="mt-8 w-full sm:hidden">{t('timerSettings.actions.resetDefaults')}</Button>
            </div>
        </div>
    )
}
