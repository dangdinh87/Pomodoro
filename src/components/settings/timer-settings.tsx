"use client"

import { useRef, useState, type Ref } from 'react'
import { Button } from '@/components/ui/button'
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip'
import { IconTile } from '@/components/ui/icon-tile'
import { Switch } from '@/components/ui/switch'
import { ArrowsClockwise, Clock, Minus, Plus, Timer, X } from '@phosphor-icons/react/dist/ssr';
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
    // Outlined number field like Input and Select: control edge, small hard shadow, accent shadow and ring on focus.
    const stepBtn = 'flex w-11 shrink-0 items-center justify-center text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink focus-visible:bg-surface-hover focus-visible:text-ink focus-visible:outline-hidden'
    return (
        <div className="min-w-0 space-y-1.5">
            <label htmlFor={id} className="block text-[0.8125rem] font-semibold leading-snug text-ink">
                {label}
                <span className="ml-1 whitespace-nowrap font-normal text-ink-muted">· {unit}</span>
            </label>
            <div className="flex h-[42px] items-stretch divide-x-2 divide-control-edge overflow-hidden rounded-md border-[length:var(--outline-w)] border-control-edge bg-surface shadow-sticker-sm transition-shadow duration-100 focus-within:shadow-[2px_2px_0_var(--accent-solid)] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-ring">
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
                    className="min-w-0 flex-1 bg-transparent text-center font-heading text-lg font-bold tabular-nums text-ink outline-hidden"
                />
                <button type="button" className={stepBtn} onClick={() => onStep(1)} aria-label={incLabel}>
                    <Plus size={14} weight="bold" aria-hidden />
                </button>
            </div>
        </div>
    )
}

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
            <SettingsSection title={t('timerSettings.labels.timerDurations')} icon={Timer} tone="mint">
                <div className="space-y-3 px-4 py-4 sm:px-5">
                    <p className="text-[0.9375rem] font-bold text-ink">{t('timerSettings.presets.title')}</p>
                    <FilterChipGroup label={t('timerSettings.presets.title')} className="flex-wrap overflow-visible">
                        {DURATION_PRESETS.map((p, i) => (
                            <FilterChip
                                key={`${p.workDuration}-${p.shortBreakDuration}`}
                                active={activePreset === i}
                                aria-label={t('timerSettings.presets.label', { focus: p.workDuration, rest: p.shortBreakDuration })}
                                onClick={() => applyPreset(i)}
                                className="tabular-nums"
                            >
                                {p.workDuration} / {p.shortBreakDuration}
                            </FilterChip>
                        ))}
                        <FilterChip active={activePreset === -1} onClick={() => workInput.current?.focus()}>
                            {t('timerSettings.presets.custom')}
                        </FilterChip>
                    </FilterChipGroup>
                </div>
                <div className="grid grid-cols-2 items-end gap-x-4 gap-y-4 px-4 py-4 sm:px-5 lg:grid-cols-4">
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
                <p className="px-4 py-3 text-[0.8125rem] text-ink-muted sm:px-5">
                    {t('timerSettings.cycleSummary', { sessions: live.longBreakInterval, total: cycleMinutes(live) })}
                </p>
            </SettingsSection>

            <SettingsSection title={t('timerSettings.labels.behavior')} icon={ArrowsClockwise} tone="butter">
                {toggleRow('auto-start-break', t('timerSettings.labels.autoStartBreaks'), t('settingsUi.autoStartBreakHint'), 'autoStartBreak')}
                {toggleRow('auto-start-work', t('timerSettings.labels.autoStartWork'), t('settingsUi.autoStartWorkHint'), 'autoStartWork')}
                {toggleRow('low-time-warning', t('timerSettings.labels.lowTimeWarning'), t('settingsUi.lowTimeWarningHint'), 'lowTimeWarningEnabled')}
            </SettingsSection>

            <BellNotificationsSection onChange={flash} />

            <SettingsSection title={t('timerSettings.labels.clockDisplay')} icon={Clock} tone="lilac">
                <div className="space-y-3 px-4 py-4 sm:px-5">
                    <div className="space-y-0.5">
                        <p id="clock-style-label" className="text-[0.9375rem] font-bold text-ink">{t('timerSettings.labels.clockStyle')}</p>
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
                    {/* One choice of three: radios by role, chips by look (FilterChip's aria-pressed is dropped) */}
                    <div role="radiogroup" aria-label={t('timerSettings.labels.clockSize')} className="flex gap-2 sm:justify-end">
                        {SIZES.map((size) => (
                            <FilterChip
                                key={size}
                                role="radio"
                                aria-checked={settings.clockSize === size}
                                aria-pressed={undefined}
                                active={settings.clockSize === size}
                                onClick={() => save({ clockSize: size })}
                                className="flex-1 justify-center sm:flex-none"
                            >
                                {sizeLabels[size]}
                            </FilterChip>
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
                <div className="flex items-center justify-between border-t-2 border-border pt-4">
                    <Button variant="secondary" onClick={resetToDefaults}>{t('timerSettings.actions.resetDefaults')}</Button>
                    <SavedIndicator show={saved} />
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-border bg-surface px-4 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <IconTile icon={Timer} tone="mint" size="lg" className="max-sm:size-9" />
                    <h2 className="truncate font-heading text-xl font-extrabold tracking-[-0.01em] text-ink">{t('timerSettings.title')}</h2>
                    <SavedIndicator show={saved} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button variant="secondary" onClick={resetToDefaults} size="sm" className="hidden sm:inline-flex">{t('timerSettings.actions.resetDefaults')}</Button>
                    <Button variant="secondary" size="icon" onClick={onClose} className="size-9 rounded-full">
                        <X size={16} weight="bold" aria-hidden="true" />
                        <span className="sr-only">{t('common.close')}</span>
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                {body}
                <Button variant="secondary" onClick={resetToDefaults} className="mt-8 w-full sm:hidden">{t('timerSettings.actions.resetDefaults')}</Button>
            </div>
        </div>
    )
}
