"use client"

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Check } from 'lucide-react'
import { useBackground } from '@/contexts/background-context'
import { toast } from 'sonner'

export default function BackgroundSettings() {
  const { background, setBackgroundImage, setBackgroundColor, setShowDottedMap, setBackgroundTemp } = useBackground()
  const [styleValue, setStyleValue] = useState<string>('lofi:auto')
  const [opacity, setOpacity] = useState<number>(Math.round((background.opacity ?? 1) * 100))
  const [dotted, setDotted] = useState<boolean>(background.showDottedMap)

  useEffect(() => {
    setStyleValue(background.value || 'lofi:auto')
    setOpacity(Math.round((background.opacity ?? 1) * 100))
    setDotted(background.showDottedMap)
  }, [background])

  const presets: { name: string; value: string; kind: 'system' | 'auto' | 'video' | 'image' }[] = [
    { name: 'System Color (Auto)', value: 'system:auto-color', kind: 'system' },
    { name: 'Lofi Chill (Auto)', value: 'lofi:auto', kind: 'auto' },
    { name: 'Day Chill', value: '/backgrounds/day.mp4', kind: 'video' },
    { name: 'Night Chill', value: '/backgrounds/night.mp4', kind: 'video' },
    // More curated images
    { name: 'Travelling 1', value: '/backgrounds/travelling.jpg', kind: 'image' },
    { name: 'Travelling 2', value: '/backgrounds/travelling2.jpg', kind: 'image' },
    { name: 'Travelling 3', value: '/backgrounds/travelling3.jpg', kind: 'image' },
    { name: 'Travelling 4', value: '/backgrounds/travelling4.jpg', kind: 'image' },
    { name: 'Travelling 5', value: '/backgrounds/travelling5.jpg', kind: 'image' },
    { name: 'Travelling 6', value: '/backgrounds/travelling6.jpg', kind: 'image' },
    { name: 'Travelling 7', value: '/backgrounds/travelling7.jpg', kind: 'image' },
    { name: 'Travelling 8', value: '/backgrounds/travelling8.jpg', kind: 'image' },
    { name: 'Travelling 9', value: '/backgrounds/travelling9.jpg', kind: 'image' },
  ]

  const buildBackground = () => {
    // System auto color uses CSS var from theme
    if (styleValue.startsWith('system:')) {
      return {
        ...background,
        type: 'solid' as const,
        value: 'hsl(var(--background))',
        opacity: 1,
        blur: 0,
        showDottedMap: dotted,
      }
    }
    // Image/video including lofi:auto sentinel
    return {
      ...background,
      type: 'image' as const,
      value: styleValue,
      opacity: opacity / 100,
      blur: 0,
      showDottedMap: dotted,
    }
  }

  const apply = () => {
    if (styleValue.startsWith('system:')) {
      setBackgroundColor('hsl(var(--background))')
      setShowDottedMap(dotted)
      toast.success('Applied system auto color background')
      return
    }
    setBackgroundImage(styleValue, opacity / 100, 0)
    setShowDottedMap(dotted)
    toast.success('Background saved')
  }


  const reset = () => {
    setStyleValue('lofi:auto')
    setOpacity(100)
    setDotted(false)
    toast.success('Defaults loaded, click Save to apply')
  }

  return (
    <div className="space-y-6">
      {/* System Auto Color */}
      <div className="space-y-2">
        <Label>System Color (Auto)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {presets.filter(p => p.kind === 'system').map((p) => {
            const selected = styleValue === p.value
            return (
              <button
                key={p.value}
                type="button"
                className={`relative h-20 rounded overflow-hidden border-2 transition-all hover:scale-105 ${selected ? 'border-primary' : 'border-border'}`}
                onClick={() => {
                  setStyleValue(p.value)
                }}
                title={p.name}
                aria-label={`Chọn ${p.name}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-8 h-8 rounded-full border-2 shadow-sm"
                    style={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                  />
                </div>
                {selected && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-[2px] shadow">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center">{p.name}</div>
              </button>
            )
          })}
        </div>
      </div>
  
      {/* Video Presets */}
      <div className="space-y-2">
        <Label>Video</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {presets.filter(p => p.kind === 'video' || p.kind === 'auto').map((p) => {
            const selected = styleValue === p.value
            return (
              <button
                key={p.value}
                type="button"
                className={`relative h-20 rounded overflow-hidden border-2 transition-all hover:scale-105 ${selected ? 'border-primary' : 'border-border'}`}
                onClick={() => {
                  setStyleValue(p.value)
                }}
                title={p.name}
                aria-label={`Chọn ${p.name}`}
              >
                {p.kind === 'auto' ? (
                  <div className="absolute inset-0 flex">
                    <video
                      className="w-1/2 h-full object-cover"
                      src="/backgrounds/day.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <video
                      className="w-1/2 h-full object-cover"
                      src="/backgrounds/night.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  </div>
                ) : (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={p.value}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}
                {selected && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-[2px] shadow">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center">{p.name}</div>
              </button>
            )
          })}
        </div>
      </div>
  
      {/* Image Presets */}
      <div className="space-y-2">
        <Label>Image</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {presets.filter(p => p.kind === 'image').map((p) => {
            const selected = styleValue === p.value
            return (
              <button
                key={p.value}
                type="button"
                className={`relative h-20 rounded overflow-hidden border-2 transition-all hover:scale-105 ${selected ? 'border-primary' : 'border-border'}`}
                onClick={() => {
                  setStyleValue(p.value)
                }}
                title={p.name}
                aria-label={`Chọn ${p.name}`}
              >
                <img src={p.value} alt={p.name} className="h-full w-full object-cover" />
                {selected && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-[2px] shadow">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center">{p.name}</div>
              </button>
            )
          })}
        </div>
      </div>



      <div className="space-y-2">
        <Label htmlFor="bg-opacity">Background Opacity: {opacity}%</Label>
        <Slider
          id="bg-opacity"
          min={10}
          max={100}
          step={5}
          value={[opacity]}
          disabled={styleValue.startsWith('system:')}
          onValueChange={(v) => {
            const vol = v[0]
            setOpacity(vol)
            // Live preview opacity (non-persistent) while editing, but require Save to persist
            if (!styleValue.startsWith('system:')) {
              setBackgroundTemp({
                ...background,
                type: 'image',
                value: styleValue,
                opacity: vol / 100,
                blur: 0,
                showDottedMap: dotted,
              })
            }
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="dotted"
          checked={dotted}
          onCheckedChange={(checked) => {
            setDotted(checked)
            // Live preview dotted overlay without persisting; Save will persist
            setBackgroundTemp({
              ...background,
              showDottedMap: checked,
            })
          }}
        />
        <Label htmlFor="dotted">Show dotted map overlay</Label>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>Reset to Defaults</Button>
        </div>
        <Button onClick={apply}>Save</Button>
      </div>
    </div>
  )
}


