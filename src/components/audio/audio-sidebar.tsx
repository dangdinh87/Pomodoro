'use client'

import { useEffect } from 'react'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/animate-ui/components/animate/tabs'
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
    role="img"
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'w-full sm:max-w-[450px] p-0 flex flex-col gap-0',
          'bg-background/95 backdrop-blur-md'
        )}
      >
        {/* Tabs with header in one row */}
        <Tabs
          value={currentTab}
          onValueChange={(v) => setActiveSource(v as 'ambient' | 'youtube')}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Header with label and TabsList */}
          <div className="px-4 pt-3 pb-2 shrink-0 flex items-center gap-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
              {t('audio.selectAudio')}
            </h2>
            <TabsList className="w-fit h-9">
              <TabsTrigger value="ambient" className="text-sm px-3 py-1.5">
                {t('audio.tabs.ambient')}
              </TabsTrigger>
              <TabsTrigger value="youtube" className="text-sm px-3 py-1.5 flex items-center gap-2">
                <YouTubeIcon className={cn(
                  "h-4 w-4 transition-colors",
                  currentTab === 'youtube' ? "text-red-500" : "text-muted-foreground"
                )} />
                {t('audio.tabs.youtube')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content area - NO scroll; only inner list scrolls. Use conditional render to avoid animate-ui height cycle (0) */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative">
            <div
              className={cn(
                "h-full min-h-0 flex flex-col transition-opacity duration-200 px-4 pb-2 pt-2",
                currentTab === 'ambient'
                  ? "relative z-10 opacity-100"
                  : "absolute inset-0 z-0 opacity-0 pointer-events-none"
              )}
            >
              <AmbientMixer />
            </div>
            <div
              className={cn(
                "h-full min-h-0 flex flex-col transition-opacity duration-200 px-4 pb-2 pt-2",
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

        {/* Fixed footer: master volume */}
        <div className="border-t px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={toggleMute}
            >
              {audioSettings.isMuted ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[audioSettings.isMuted ? 0 : audioSettings.masterVolume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => {
                if (audioSettings.isMuted && v[0] > 0) {
                  toggleMute()
                }
                updateVolume(v[0])
              }}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
              {audioSettings.isMuted ? 0 : audioSettings.masterVolume}%
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
