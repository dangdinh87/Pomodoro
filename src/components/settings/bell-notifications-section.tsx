"use client"

import { useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-section'
import { useI18n } from '@/contexts/i18n-context'
import { isWakeLockSupported } from '@/features/timer/hooks/use-screen-wake-lock'
import { ALARM_NONE, alarmSounds, resolveAlarmType } from '@/lib/audio/sound-catalog'
import { playAlarm } from '@/lib/timer/alarm'
import { useNotificationState } from '@/lib/timer/use-notification-state'
import { useAudioStore } from '@/stores/audio-store'
import { useTimerStore } from '@/stores/timer-store'

const subscribeNever = () => () => {}
const SOUND_IDS = [...alarmSounds.map((a) => a.id), ALARM_NONE]
// Alarm playback never goes below 10% (see alarm.ts), so the slider does not offer less
const MIN_VOLUME = 10

/**
 * Timer settings > Bell & notifications. Every control saves the moment it
 * changes; `onChange` lets the panel flash its "Saved" indicator.
 */
export function BellNotificationsSection({ onChange }: { onChange?: () => void }) {
    const { t } = useI18n()
    const { alarmType, alarmVolume } = useAudioStore((s) => s.audioSettings)
    const updateAudioSettings = useAudioStore((s) => s.updateAudioSettings)
    const keepScreenOn = useTimerStore((s) => s.settings.keepScreenOn)
    const updateSettings = useTimerStore((s) => s.updateSettings)
    const { state: notificationState, ask } = useNotificationState()

    // Wake Lock exists only in some browsers; the server snapshot keeps SSR markup identical
    const wakeLock = useSyncExternalStore(subscribeNever, isWakeLockSupported, () => false)

    // Older saves may hold a retired id (gong, soft); show what actually plays
    const sound = resolveAlarmType(alarmType)
    const silent = sound === ALARM_NONE
    const volume = Math.max(MIN_VOLUME, alarmVolume)

    const notificationStatus: Record<string, { status: string; hint: string }> = {
        default: { status: '', hint: t('timerSettings.bell.notificationsHint') },
        granted: { status: t('timerSettings.bell.notificationsOn'), hint: t('timerSettings.bell.notificationsOnHint') },
        denied: { status: t('timerSettings.bell.notificationsDenied'), hint: t('timerSettings.bell.notificationsDeniedHint') },
        unsupported: {
            status: t('timerSettings.bell.notificationsUnsupported'),
            hint: t('timerSettings.bell.notificationsUnsupportedHint'),
        },
    }
    const current = notificationStatus[notificationState]

    return (
        <SettingsSection title={t('timerSettings.bell.title')}>
            <SettingsRow label={t('timerSettings.bell.sound')} description={t('timerSettings.bell.soundHint')}>
                <Select
                    value={sound}
                    onValueChange={(next) => {
                        updateAudioSettings({ alarmType: next })
                        onChange?.()
                    }}
                >
                    <SelectTrigger aria-label={t('timerSettings.bell.sound')}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SOUND_IDS.map((id) => (
                            <SelectItem key={id} value={id}>
                                {t(`timerSettings.bell.sounds.${id}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </SettingsRow>

            <SettingsRow label={t('timerSettings.bell.volume')}>
                <div className="flex items-center gap-3">
                    <Slider
                        aria-label={t('timerSettings.bell.volume')}
                        min={MIN_VOLUME}
                        max={100}
                        step={5}
                        value={[volume]}
                        disabled={silent}
                        onValueChange={([next]) => updateAudioSettings({ alarmVolume: next })}
                        onValueCommit={() => onChange?.()}
                        className="py-1"
                    />
                    <span className="w-10 shrink-0 text-right text-[0.8125rem] tabular-nums text-ink-muted">{volume}%</span>
                </div>
            </SettingsRow>

            <SettingsRow label={t('timerSettings.bell.previewLabel')} description={t('timerSettings.bell.previewHint')}>
                <Button variant="outline" size="sm" onClick={playAlarm} disabled={silent} className="w-full sm:w-auto">
                    {t('timerSettings.bell.preview')}
                </Button>
            </SettingsRow>

            <SettingsRow label={t('timerSettings.bell.notifications')} description={current.hint}>
                {notificationState === 'default' ? (
                    <Button variant="outline" size="sm" onClick={() => void ask()} className="w-full sm:w-auto">
                        {t('timerSettings.bell.notificationsTurnOn')}
                    </Button>
                ) : (
                    <p
                        className={`text-[0.8125rem] font-semibold sm:text-right ${notificationState === 'granted' ? 'text-success-ink' : 'text-ink-muted'}`}
                    >
                        {current.status}
                    </p>
                )}
            </SettingsRow>

            {wakeLock && (
                <SettingsRow label={t('timerSettings.bell.keepScreenOn')} description={t('timerSettings.bell.keepScreenOnHint')}>
                    <div className="flex sm:justify-end">
                        <Switch
                            checked={Boolean(keepScreenOn)}
                            aria-label={t('timerSettings.bell.keepScreenOn')}
                            onCheckedChange={(checked) => {
                                updateSettings({ keepScreenOn: checked })
                                onChange?.()
                            }}
                        />
                    </div>
                </SettingsRow>
            )}
        </SettingsSection>
    )
}
