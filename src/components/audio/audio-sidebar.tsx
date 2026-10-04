'use client'

import { useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { MusicNotes, SpeakerHigh, SpeakerX } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAudioStore } from '@/stores/audio-store'

import { AmbientMixer } from './ambient-mixer'
import YouTubePane from './youtube/youtube-pane'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/contexts/i18n-context'

interface AudioSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

export function AudioSidebar({ open, onOpenChange }: AudioSidebarProps) {
  const { t } = useTranslation()
  const audioSettings = useAudioStore((s) => s.audioSettings)
  const currentlyPlaying = useAudioStore((s) => s.currentlyPlaying)
  const updateVolume = useAudioStore((s) => s.updateVolume)
  const toggleMute = useAudioStore((s) => s.toggleMute)
  const setActiveSource = useAudioStore((s) => s.setActiveSource)

  // Auto-switch tab to match what's playing when sidebar opens
  useEffect(() => {
    if (open) {
      if (currentlyPlaying?.type === 'youtube') {
        setActiveSource('youtube')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const currentTab = audioSettings.activeSource === 'youtube' ? 'youtube' : 'ambient'
  const { isMuted, masterVolume } = audioSettings
  const shownVolume = isMuted ? 0 : masterVolume

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'w-full sm:max-w-[450px] p-0 flex flex-col gap-0',
          'bg-surface focus:outline-hidden'
        )}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).focus()
        }}
      >
        {/* Tabs with header in one row */}
        <Tabs
          value={currentTab}
          onValueChange={(v) => setActiveSource(v as 'ambient' | 'youtube')}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="shrink-0 px-4 pt-4">
            <SheetHeader icon={<MusicNotes weight="fill" />} iconTileClassName="bg-candy-sky" className="pe-12">
              <SheetTitle>{t('timerUi.dock.sounds')}</SheetTitle>
              <SheetDescription className="sr-only">{t('audio.selectAudio')}</SheetDescription>
            </SheetHeader>
            <TabsList className="mt-4">
              <TabsTrigger value="ambient">{t('audio.tabs.ambient')}</TabsTrigger>
              <TabsTrigger value="youtube">
                <YouTubeIcon className={cn(
                  "h-4 w-4 transition-colors",
                  currentTab === 'youtube' ? "text-danger-ink" : "text-ink-muted"
                )} />
                {t('audio.tabs.youtube')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content area - NO scroll; only inner list scrolls. Use conditional render to avoid animate-ui height cycle (0) */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative">
            <div
              className={cn(
                "h-full min-h-0 flex flex-col transition-opacity duration-200 px-4 pb-2 pt-3",
                currentTab === 'ambient'
                  ? "relative z-10 opacity-100"
                  : "absolute inset-0 z-0 opacity-0 pointer-events-none"
              )}
            >
              <AmbientMixer />
            </div>
            <div
              className={cn(
                "h-full min-h-0 flex flex-col transition-opacity duration-200 px-4 pb-2 pt-3",
                currentTab === 'youtube'
                  ? "relative z-10 opacity-100"
                  : "absolute inset-0 z-0 opacity-0 pointer-events-none h-full w-full"
              )}
            >
              <div className="h-full w-full flex flex-col pointer-events-auto">
                <YouTubePane />
              </div>
            </div>
          </div>
        </Tabs>

        {/* Fixed footer: mute + master volume, always in view */}
        <div className="shrink-0 border-t-[2.5px] border-outline bg-surface-raised px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              size="icon"
              className="shrink-0"
              onClick={toggleMute}
              aria-label={isMuted ? t('audio.unmute') : t('audio.mute')}
            >
              {isMuted ? <SpeakerX size={20} weight="fill" /> : <SpeakerHigh size={20} weight="fill" />}
            </Button>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-[0.9375rem] font-bold text-ink">{t('audio.master.label')}</span>
                <span
                  aria-hidden="true"
                  className="rounded-full border-2 border-outline bg-surface px-2 py-px text-xs font-bold tabular-nums text-ink"
                >
                  {shownVolume}%
                </span>
              </div>
              <Slider
                value={[shownVolume]}
                min={0}
                max={100}
                step={1}
                aria-label={t('audio.master.label')}
                aria-valuetext={isMuted ? t('audio.master.muted') : t('audio.master.valueText', { value: masterVolume })}
                onValueChange={(v) => {
                  if (isMuted && v[0] > 0) {
                    toggleMute()
                  }
                  updateVolume(v[0])
                }}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
