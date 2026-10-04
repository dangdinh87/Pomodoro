"use client"

import { useRef, useState, type Ref } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Minus, Plus, X } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils'
import { defaultSettings, useTimerStore, type TimerSettings as TimerSettingsData } from '@/stores/timer-store'
import { useAudioStore } from '@/stores/audio-store'
import { toast } from 'sonner'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-section'
import { BellNotificationsSection } from '@/components/settings/bell-notifications-section'
import { SavedIndicator } from '@/features/settings/saved-indicator'
import { useSavedFlash } from '@/features/settings/use-saved-flash'
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

type ClockSize = TimerSettingsData['clockSize']

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
    const settings = useTimerStore((s) => s.settings)
    const updateSettings = useTimerStore((s) => s.updateSettings)
    const [saved, flash] = useSavedFlash()
    // Free typing happens in string drafts (only while a field is being edited);
    // they are clamped and applied on blur / Enter. Otherwise the field shows the store.
    const [typing, setTyping] = useState<Partial<Record<DurationKey, string>>>({})
    const workInput = useRef<HTMLInputElement>(null)
    const fieldValue = (key: DurationKey) => typing[key] ?? String(settings[key])
    const endTyping = (...keys: DurationKey[]) =>
        setTyping((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !keys.includes(k as DurationKey))))

    // Every change is applied (and persisted by the store) the moment it is made
    const save = (patch: Partial<TimerSettingsData>) => {
        updateSettings(patch)
        flash()
    }

    const durationsFromDraft = (): Pick<TimerSettingsData, DurationKey> => ({
        workDuration: parseDuration('workDuration', fieldValue('workDuration'), settings.workDuration),
        shortBreakDuration: parseDuration('shortBreakDuration', fieldValue('shortBreakDuration'), settings.shortBreakDuration),
        longBreakDuration: parseDuration('longBreakDuration', fieldValue('longBreakDuration'), settings.longBreakDuration),
        longBreakInterval: parseDuration('longBreakInterval', fieldValue('longBreakInterval'), settings.longBreakInterval),
    })

    const applyDuration = (key: DurationKey, n: number) => {
        endTyping(key)
        if (n !== settings[key]) save({ [key]: n })
    }

    const commit = (key: DurationKey) => applyDuration(key, parseDuration(key, fieldValue(key), settings[key]))

    const step = (key: DurationKey, delta: number) =>
        applyDuration(key, clampDuration(key, parseDuration(key, fieldValue(key), settings[key]) + delta))

    const applyPreset = (index: number) => {
        endTyping('workDuration', 'shortBreakDuration', 'longBreakDuration')
        save({ ...DURATION_PRESETS[index] })
    }

    const resetToDefaults = () => {
        updateSettings(defaultSettings)
        useAudioStore.getState().updateAudioSettings({ alarmType: 'bell', alarmVolume: 70 })
        setTyping({})
        flash()
        toast.success(t('timerSettings.toasts.reset'))
    }

    const live = { ...settings, ...durationsFromDraft() }
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
                    checked={settings[key]}
                    aria-label={label}
                    onCheckedChange={(checked) => save({ [key]: checked })}
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
                            value={fieldValue(f.key)}
                            inputRef={f.key === 'workDuration' ? workInput : undefined}
                            onType={(v) => setTyping((d) => ({ ...d, [f.key]: v }))}
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

            <BellNotificationsSection onChange={flash} />

            <SettingsSection title={t('timerSettings.labels.clockDisplay')}>
                <div className="space-y-3 px-5 py-4">
                    <div className="space-y-0.5">
                        <p id="clock-style-label" className="text-[0.9375rem] font-semibold text-ink">{t('timerSettings.labels.clockStyle')}</p>
                        <p className="text-[0.8125rem] text-ink-muted">{t('settingsUi.clockStyleHint')}</p>
                    </div>
                    <ClockStylePicker
                        value={resolveClockType(settings.clockType)}
                        onChange={(clockType) => save({ clockType })}
                        workMinutes={live.workDuration}
                        warn={settings.lowTimeWarningEnabled}
                        labelledBy="clock-style-label"
                    />
                    {isThreeDClock(settings.clockType) && (
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
                                aria-checked={settings.clockSize === size}
                                onClick={() => save({ clockSize: size })}
                                className={cn(pillBase, 'flex-1 sm:flex-none', settings.clockSize === size ? pillOn : pillOff)}
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
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <Button variant="outline" onClick={resetToDefaults}>{t('timerSettings.actions.resetDefaults')}</Button>
                    <SavedIndicator show={saved} />
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <h2 className="truncate font-heading text-lg font-semibold text-ink">{t('timerSettings.title')}</h2>
                    <SavedIndicator show={saved} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" onClick={resetToDefaults} size="sm" className="hidden sm:inline-flex">{t('timerSettings.actions.resetDefaults')}</Button>
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
