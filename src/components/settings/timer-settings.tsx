"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Clock, Timer, Gauge, FlipHorizontal, X } from 'lucide-react'
import { useTimerStore } from '@/stores/timer-store'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/contexts/i18n-context'

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
        if (typeof window !== 'undefined') {
            localStorage.setItem('pomodoro-timer-settings', JSON.stringify(normalized))
        }
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
    const [previewMM, previewSS] = previewTime.split(':');

    return (
        <div className="flex flex-col h-full">
            {/* Fixed Header */}
            {onClose && (
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                    <h2 className="text-lg font-semibold">{t('timerSettings.title')}</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={resetToDefaults} size="sm">{t('timerSettings.actions.resetDefaults')}</Button>
                        <Button onClick={saveSettings} size="sm">{t('timerSettings.actions.save')}</Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 rounded-full"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">{t('common.close')}</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Scrollable Content */}
            <div className={onClose ? "flex-1 overflow-y-auto px-6 py-4" : "space-y-6"}>
                <div className="grid gap-8 md:grid-cols-[1fr_300px]">
                    <div className="space-y-8">
                        {/* Durations */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">{t('timerSettings.labels.timerDurations')}</h2>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="work-duration">{t('timerSettings.labels.workDuration')}</Label>
                                    <Input
                                        id="work-duration"
                                        type="number"
                                        min={1}
                                        max={60}
                                        value={workStr}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            if (v === '' || /^[0-9]{0,2}$/.test(v)) setWorkStr(v)
                                        }}
                                        onBlur={() => {
                                            const n = clamp(toInt(workStr, localSettings.workDuration), 1, 60)
                                            setWorkStr(String(n))
                                            setLocalSettings({ ...localSettings, workDuration: n })
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="short-break-duration">{t('timerSettings.labels.shortBreakDuration')}</Label>
                                    <Input
                                        id="short-break-duration"
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={shortStr}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            if (v === '' || /^[0-9]{0,2}$/.test(v)) setShortStr(v)
                                        }}
                                        onBlur={() => {
                                            const n = clamp(toInt(shortStr, localSettings.shortBreakDuration), 1, 30)
                                            setShortStr(String(n))
                                            setLocalSettings({ ...localSettings, shortBreakDuration: n })
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="long-break-duration">{t('timerSettings.labels.longBreakDuration')}</Label>
                                    <Input
                                        id="long-break-duration"
                                        type="number"
                                        min={1}
                                        max={60}
                                        value={longStr}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            if (v === '' || /^[0-9]{0,2}$/.test(v)) setLongStr(v)
                                        }}
                                        onBlur={() => {
                                            const n = clamp(toInt(longStr, localSettings.longBreakDuration), 1, 60)
                                            setLongStr(String(n))
                                            setLocalSettings({ ...localSettings, longBreakDuration: n })
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="long-break-interval">{t('timerSettings.labels.longBreakInterval')}</Label>
                                    <Input
                                        id="long-break-interval"
                                        type="number"
                                        min={2}
                                        max={10}
                                        value={intervalStr}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            if (v === '' || /^[0-9]{0,2}$/.test(v)) setIntervalStr(v)
                                        }}
                                        onBlur={() => {
                                            const n = clamp(toInt(intervalStr, localSettings.longBreakInterval), 2, 10)
                                            setIntervalStr(String(n))
                                            setLocalSettings({ ...localSettings, longBreakInterval: n })
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Behavior */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">{t('timerSettings.labels.behavior')}</h2>
                            <Separator />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="auto-start-break" className="flex-1">{t('timerSettings.labels.autoStartBreaks')}</Label>
                                    <Switch
                                        id="auto-start-break"
                                        checked={localSettings.autoStartBreak}
                                        onCheckedChange={(checked) =>
                                            setLocalSettings({ ...localSettings, autoStartBreak: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="auto-start-work" className="flex-1">{t('timerSettings.labels.autoStartWork')}</Label>
                                    <Switch
                                        id="auto-start-work"
                                        checked={localSettings.autoStartWork}
                                        onCheckedChange={(checked) =>
                                            setLocalSettings({ ...localSettings, autoStartWork: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="low-time-warning" className="flex-1">{t('timerSettings.labels.lowTimeWarning')}</Label>
                                    <Switch
                                        id="low-time-warning"
                                        checked={localSettings.lowTimeWarningEnabled}
                                        onCheckedChange={(checked) =>
                                            setLocalSettings({
                                                ...localSettings,
                                                lowTimeWarningEnabled: checked,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Clock Display + Preview */}
                    <div className="space-y-6">
                        {/* Clock Display */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">{t('timerSettings.labels.clockDisplay')}</h2>
                            <Separator />
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="clock-type">{t('timerSettings.labels.clockStyle')}</Label>
                                    <Select
                                        value={localSettings.clockType}
                                        onValueChange={(value: ClockType) =>
                                            setLocalSettings({ ...localSettings, clockType: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('timerSettings.labels.selectClockType')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="digital">
                                                <div className="flex items-center gap-2">
                                                    <Timer className="h-4 w-4" />
                                                    {t('timerSettings.labels.digital')}
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="analog">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {t('timerSettings.labels.analog')}
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="progress">
                                                <div className="flex items-center gap-2">
                                                    <Gauge className="h-4 w-4" />
                                                    {t('timerSettings.labels.progress')}
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="flip">
                                                <div className="flex items-center gap-2">
                                                    <FlipHorizontal className="h-4 w-4" />
                                                    {t('timerSettings.labels.flip')}
                                                </div>
                                            </SelectItem>

                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clock-size">{t('timerSettings.labels.clockSize')}</Label>
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
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">{t('timerSettings.labels.preview')}</h2>
                            <Separator />
                            <div className="rounded-lg border bg-card p-6 flex items-center justify-center min-h-[200px]">
                                {localSettings.clockType === 'digital' && (() => {
                                    const sizeClasses = {
                                        small: 'text-2xl',
                                        medium: 'text-4xl',
                                        large: 'text-5xl',
                                    };
                                    return (
                                        <div className="text-center">
                                            <div className={`${sizeClasses[localSettings.clockSize]} font-bold tabular-nums text-[hsl(var(--timer-foreground))]`}>
                                                {previewTime}
                                            </div>
                                        </div>
                                    );
                                })()}
                                {localSettings.clockType === 'progress' && (() => {
                                    const sizeClasses = {
                                        small: { time: 'text-xl', bar: 'h-2', width: 'max-w-[150px]' },
                                        medium: { time: 'text-2xl', bar: 'h-3', width: 'max-w-[200px]' },
                                        large: { time: 'text-3xl', bar: 'h-4', width: 'max-w-[250px]' },
                                    };
                                    const size = sizeClasses[localSettings.clockSize];
                                    return (
                                        <div className={`text-center w-full ${size.width}`}>
                                            <div className={`${size.time} font-bold tabular-nums text-[hsl(var(--timer-foreground))] mb-2`}>
                                                {previewTime}
                                            </div>
                                            <div className={`w-full bg-muted rounded-full ${size.bar}`}>
                                                <div
                                                    className={`${size.bar} rounded-full`}
                                                    style={{
                                                        width: '50%',
                                                        backgroundColor: 'hsl(var(--timer-foreground))',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}
                                {localSettings.clockType === 'analog' && (() => {
                                    const sizeClasses = {
                                        small: { container: 'w-24 h-24', text: 'text-sm' },
                                        medium: { container: 'w-32 h-32', text: 'text-lg' },
                                        large: { container: 'w-40 h-40', text: 'text-xl' },
                                    };
                                    const size = sizeClasses[localSettings.clockSize];
                                    return (
                                        <div className="text-center">
                                            <div
                                                className={`relative ${size.container} mx-auto`}
                                                style={{ color: 'hsl(var(--timer-foreground))' }}
                                            >
                                                <svg
                                                    className="w-full h-full transform -rotate-90"
                                                    viewBox="0 0 200 200"
                                                    aria-label="Analog preview"
                                                >
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="90"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        className="opacity-20"
                                                    />
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
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className={`${size.text} font-bold tabular-nums text-[hsl(var(--timer-foreground))]`}>
                                                        {previewTime}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {localSettings.clockType === 'flip' && (() => {
                                    const sizeClasses = {
                                        small: { digit: 'text-xl', padding: 'p-2' },
                                        medium: { digit: 'text-3xl', padding: 'p-3' },
                                        large: { digit: 'text-4xl', padding: 'p-4' },
                                    };
                                    const size = sizeClasses[localSettings.clockSize];
                                    return (
                                        <div className="text-center">
                                            <div className="inline-flex items-center space-x-2">
                                                <div
                                                    className={`bg-background border-2 ${size.padding} rounded`}
                                                    style={{ borderColor: 'hsl(var(--timer-foreground))' }}
                                                >
                                                    <div className={`${size.digit} font-bold tabular-nums text-[hsl(var(--timer-foreground))]`}>
                                                        {previewMM}
                                                    </div>
                                                </div>
                                                <div className={`${size.digit} font-bold tabular-nums text-[hsl(var(--timer-foreground))]`}>
                                                    :
                                                </div>
                                                <div
                                                    className={`bg-background border-2 ${size.padding} rounded`}
                                                    style={{ borderColor: 'hsl(var(--timer-foreground))' }}
                                                >
                                                    <div className={`${size.digit} font-bold tabular-nums text-[hsl(var(--timer-foreground))]`}>
                                                        {previewSS}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {!onClose && (
                        <div className="flex justify-between pt-4 border-t">
                            <Button variant="outline" onClick={resetToDefaults}>{t('timerSettings.actions.resetDefaults')}</Button>
                            <Button onClick={saveSettings}>{t('timerSettings.actions.saveChanges')}</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
