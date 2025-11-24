"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Palette } from 'lucide-react'
import { toast } from 'sonner'
import { useBackground } from '@/contexts/background-context'

interface BackgroundSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const gradientPresets = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #4ca1af 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Sky', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Purple', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
]

const solidColors = [
  { name: 'White', value: '#ffffff' },
  { name: 'Light Gray', value: '#f3f4f6' },
  { name: 'Dark Gray', value: '#1f2937' },
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
]

export function BackgroundSettings({ isOpen, onClose }: BackgroundSettingsProps) {
  const { background, setBackground, setBackgroundColor, setBackgroundImage, setGradientBackground } = useBackground()
  const [localSettings, setLocalSettings] = useState({
    backgroundType: 'gradient' as 'gradient' | 'solid' | 'image' | 'video',
    backgroundStyle: gradientPresets[0].value,
    backgroundOpacity: 100,
  })

  // Initialize local settings from context
  useEffect(() => {
    setLocalSettings({
      backgroundType: background.type === 'none' ? 'gradient' : background.type as 'gradient' | 'solid' | 'image' | 'video',
      backgroundStyle: background.value || gradientPresets[0].value,
      backgroundOpacity: Math.round(background.opacity * 100),
    })
  }, [background])

  const saveSettings = () => {
    // Update the background context based on the local settings
    if (localSettings.backgroundType === 'solid') {
      setBackgroundColor(localSettings.backgroundStyle)
    } else if (localSettings.backgroundType === 'gradient') {
      setGradientBackground(localSettings.backgroundStyle, localSettings.backgroundOpacity / 100)
    } else if (localSettings.backgroundType === 'image') {
      setBackgroundImage(localSettings.backgroundStyle, localSettings.backgroundOpacity / 100, 0)
    }
    
    toast.success('Background settings saved successfully!')
    onClose()
  }

  const resetToDefaults = () => {
    const defaultSettings = {
      backgroundType: 'gradient' as const,
      backgroundStyle: gradientPresets[0].value,
      backgroundOpacity: 100,
    }
    setLocalSettings(defaultSettings)
    setGradientBackground(gradientPresets[0].value)
    toast.success('Background settings reset to defaults!')
  }

  const handleBackgroundTypeChange = (type: 'gradient' | 'solid' | 'image' | 'video') => {
    let newBackgroundStyle = localSettings.backgroundStyle
    
    if (type === 'gradient' && !localSettings.backgroundStyle.includes('gradient')) {
      newBackgroundStyle = gradientPresets[0].value
    } else if (type === 'solid' && !localSettings.backgroundStyle.startsWith('#')) {
      newBackgroundStyle = solidColors[0].value
    } else if (type === 'image') {
      newBackgroundStyle = 'url(/images/background-1.jpg)'
    } else if (type === 'video') {
      newBackgroundStyle = 'url(/videos/background-1.mp4)'
    }
    
    setLocalSettings({
      ...localSettings,
      backgroundType: type,
      backgroundStyle: newBackgroundStyle
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Background Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Gradient Backgrounds */}
          <div className="space-y-2">
            <Label>Gradient Backgrounds</Label>
            <div className="grid grid-cols-3 gap-2">
              {gradientPresets.map((preset) => (
                <div
                  key={preset.name}
                  className={`relative h-16 rounded cursor-pointer border-2 transition-all hover:scale-105 ${
                    localSettings.backgroundStyle === preset.value && localSettings.backgroundType === 'gradient'
                      ? 'border-primary'
                      : 'border-gray-200'
                  }`}
                  style={{ background: preset.value }}
                  onClick={() => setLocalSettings({...localSettings, backgroundStyle: preset.value, backgroundType: 'gradient'})}
                >
                  {localSettings.backgroundStyle === preset.value && localSettings.backgroundType === 'gradient' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b">
                    {preset.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Solid Colors */}
          <div className="space-y-2">
            <Label>Solid Colors</Label>
            <div className="grid grid-cols-4 gap-2">
              {solidColors.map((color) => (
                <div
                  key={color.name}
                  className={`relative h-16 rounded cursor-pointer border-2 transition-all hover:scale-105 ${
                    localSettings.backgroundStyle === color.value && localSettings.backgroundType === 'solid'
                      ? 'border-primary'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setLocalSettings({...localSettings, backgroundStyle: color.value, backgroundType: 'solid'})}
                >
                  {localSettings.backgroundStyle === color.value && localSettings.backgroundType === 'solid' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full border-2 border-black" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b text-center">
                    {color.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Internet Images */}
          <div className="space-y-2">
            <Label>Internet Images</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&h=1080&fit=crop'
              ].map((url, index) => (
                <div
                  key={url}
                  className={`relative h-20 rounded cursor-pointer border-2 transition-all hover:scale-105 bg-cover bg-center ${
                    localSettings.backgroundStyle === url && localSettings.backgroundType === 'image'
                      ? 'border-primary'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundImage: `url(${url})` }}
                  onClick={() => setLocalSettings({...localSettings, backgroundStyle: url, backgroundType: 'image'})}
                >
                  {localSettings.backgroundStyle === url && localSettings.backgroundType === 'image' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b text-center">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Custom Image URL */}
          <div className="space-y-2">
            <Label>Custom Image URL</Label>
            <Input
              type="text"
              value={localSettings.backgroundType === 'image' && !localSettings.backgroundStyle.includes('unsplash') ? localSettings.backgroundStyle : ''}
              onChange={(e) => setLocalSettings({ ...localSettings, backgroundStyle: e.target.value, backgroundType: 'image' })}
              placeholder="Enter image URL"
            />
            <div className="text-sm text-muted-foreground">
              Enter a URL for your background image.
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="background-opacity">Background Opacity: {localSettings.backgroundOpacity}%</Label>
            <Slider
              id="background-opacity"
              min={10}
              max={100}
              step={5}
              value={[localSettings.backgroundOpacity]}
              onValueChange={(value: number[]) => setLocalSettings({...localSettings, backgroundOpacity: value[0]})}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveSettings}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}