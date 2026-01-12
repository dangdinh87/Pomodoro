"use client"

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Clock, Timer, Activity, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { addMinutes, format, startOfDay } from 'date-fns'
import { useI18n } from '@/contexts/i18n-context'

type ClockType = 'digital' | 'analog' | 'progress' | 'flip'

interface TimerSettingsData {
  workDuration: number // in minutes
  shortBreakDuration: number // in minutes
  longBreakDuration: number // in minutes
  longBreakInterval: number // number of work sessions before long break
  autoStartBreak: boolean
  autoStartWork: boolean
  clockType: ClockType
  showClock: boolean
}

interface TimerSettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: TimerSettingsData
  onSettingsChange: (settings: TimerSettingsData) => void
}

export function TimerSettings({ isOpen, onClose, settings, onSettingsChange }: TimerSettingsProps) {
  const { t } = useI18n();
  const [localSettings, setLocalSettings] = useState<TimerSettingsData>(settings)

  // Derived previews using date-fns
  const clockPreviewTime = useMemo(() => {
    const safeMinutes = Math.max(0, Number(localSettings.workDuration) || 0)
    // Render mm:ss from start of day plus selected minutes
    return format(addMinutes(startOfDay(new Date()), safeMinutes), 'mm:ss')
  }, [localSettings.workDuration])

  const endTimePreview = useMemo(() => {
    const safeMinutes = Math.max(0, Number(localSettings.workDuration) || 0)
    // If user starts now, when will the work session end?
    return format(addMinutes(new Date(), safeMinutes), 'HH:mm')
  }, [localSettings.workDuration])

  const saveSettings = () => {
    onSettingsChange(localSettings)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro-timer-settings', JSON.stringify(localSettings))
    }
    toast.success(t('timerSettings.toasts.saved'))
    onClose()
  }

  const resetToDefaults = () => {
    const defaultSettings: TimerSettingsData = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreak: false,
      autoStartWork: false,
      clockType: 'digital',
      showClock: false,
    }
    setLocalSettings(defaultSettings)
    toast.success(t('timerSettings.toasts.reset'))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            {t('timerSettings.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-duration">{t('timerSettings.labels.workDuration')}</Label>
              <input
                id="work-duration"
                type="number"
                min="1"
                max="60"
                value={localSettings.workDuration}
                onChange={(e) => setLocalSettings({...localSettings, workDuration: parseInt(e.target.value) || 25})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-break-duration">{t('timerSettings.labels.shortBreakDuration')}</Label>
              <input
                id="short-break-duration"
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreakDuration}
                onChange={(e) => setLocalSettings({...localSettings, shortBreakDuration: parseInt(e.target.value) || 5})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long-break-duration">{t('timerSettings.labels.longBreakDuration')}</Label>
              <input
                id="long-break-duration"
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakDuration}
                onChange={(e) => setLocalSettings({...localSettings, longBreakDuration: parseInt(e.target.value) || 15})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long-break-interval">{t('timerSettings.labels.longBreakInterval')}</Label>
              <input
                id="long-break-interval"
                type="number"
                min="2"
                max="10"
                value={localSettings.longBreakInterval}
                onChange={(e) => setLocalSettings({...localSettings, longBreakInterval: parseInt(e.target.value) || 4})}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-start-break"
                checked={localSettings.autoStartBreak}
                onCheckedChange={(checked) => setLocalSettings({...localSettings, autoStartBreak: checked})}
              />
              <Label htmlFor="auto-start-break">{t('timerSettings.labels.autoStartBreaks')}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-start-work"
                checked={localSettings.autoStartWork}
                onCheckedChange={(checked) => setLocalSettings({...localSettings, autoStartWork: checked})}
              />
              <Label htmlFor="auto-start-work">{t('timerSettings.labels.autoStartWork')}</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-clock"
              checked={localSettings.showClock}
              onCheckedChange={(checked) => setLocalSettings({...localSettings, showClock: checked})}
            />
            <Label htmlFor="show-clock">{t('timerSettings.labels.showClock')}</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clock-type">{t('timerSettings.labels.clockType')}</Label>
            <Select value={localSettings.clockType} onValueChange={(value: ClockType) => setLocalSettings({...localSettings, clockType: value})}>
              <SelectTrigger>
                <SelectValue placeholder={t('timerSettings.labels.selectClockType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('timerSettings.labels.digital')}
                  </div>
                </SelectItem>
                <SelectItem value="analog">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    {t('timerSettings.labels.analog')}
                  </div>
                </SelectItem>
                <SelectItem value="progress">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {t('timerSettings.labels.progress')}
                  </div>
                </SelectItem>
                <SelectItem value="flip">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {t('timerSettings.labels.flip')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Clock Preview Section */}
          {localSettings.showClock && (
            <div className="mt-6 pt-6 border-t">
              <Label className="text-base font-medium mb-4 block">{t('timerSettings.labels.clockPreview')}</Label>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border flex flex-col items-center gap-2">
                <div className="text-6xl font-bold text-center">
                  {clockPreviewTime}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('timerSettings.labels.endsAround', { time: endTimePreview })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={resetToDefaults}>
            {t('timerSettings.actions.resetDefaults')}
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t('timerSettings.actions.cancel')}
            </Button>
            <Button onClick={saveSettings}>
              {t('timerSettings.actions.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}