'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAudioStore } from '@/stores/audio-store'
import { AmbientMixer } from './ambient-mixer'
import YouTubePane from './youtube/youtube-pane'
import { cn } from '@/lib/utils'

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
  const audioSettings = useAudioStore((s) => s.audioSettings)
  const updateVolume = useAudioStore((s) => s.updateVolume)
  const toggleMute = useAudioStore((s) => s.toggleMute)
  const setActiveSource = useAudioStore((s) => s.setActiveSource)

  // Controlled by activeSource from store
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
        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
          <SheetTitle className="text-base font-semibold">Audio</SheetTitle>
        </SheetHeader>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onValueChange={(v) => setActiveSource(v as 'ambient' | 'youtube')}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-4 pb-2 shrink-0">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="ambient" className="text-xs">
                Ambient
              </TabsTrigger>
              <TabsTrigger value="youtube" className="text-xs flex items-center gap-1.5">
                <YouTubeIcon className="h-3.5 w-3.5" />
                YouTube
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
            <TabsContent value="ambient" className="mt-0">
              <AmbientMixer />
            </TabsContent>
            <TabsContent value="youtube" className="mt-0">
              <YouTubePane />
            </TabsContent>
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
