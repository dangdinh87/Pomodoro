"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Volume2, VolumeX } from 'lucide-react'
import { toast } from 'sonner'

type SoundType = 'bell' | 'chime' | 'gong' | 'digital' | 'none'

interface SoundSettings {
  soundType: SoundType
  volume: number
  isMuted: boolean
}

interface SoundSettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: SoundSettings
  onSettingsChange: (settings: SoundSettings) => void
}

export function SoundSettings({ isOpen, onClose, settings, onSettingsChange }: SoundSettingsProps) {
  const [localSettings, setLocalSettings] = useState<SoundSettings>(settings)

  const saveSettings = () => {
    onSettingsChange(localSettings)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro-sound-settings', JSON.stringify(localSettings))
    }
    toast.success('Sound settings saved successfully!')
    onClose()
  }

  const resetToDefaults = () => {
    const defaultSettings: SoundSettings = {
      soundType: 'bell',
      volume: 50,
      isMuted: false,
    }
    setLocalSettings(defaultSettings)
    toast.success('Sound settings reset to defaults!')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Sound Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="mute"
              checked={localSettings.isMuted}
              onCheckedChange={(checked) => setLocalSettings({...localSettings, isMuted: checked})}
            />
            <Label htmlFor="mute">Mute all sounds</Label>
            {localSettings.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sound-type">Notification Sound</Label>
            <Select 
              value={localSettings.soundType} 
              onValueChange={(value: SoundType) => setLocalSettings({...localSettings, soundType: value})}
              disabled={localSettings.isMuted}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sound" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bell">Bell</SelectItem>
                <SelectItem value="chime">Chime</SelectItem>
                <SelectItem value="gong">Gong</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="volume">Volume: {localSettings.volume}%</Label>
            <Slider
              id="volume"
              min={0}
              max={100}
              step={5}
              value={[localSettings.volume]}
              onValueChange={(value) => setLocalSettings({...localSettings, volume: value[0]})}
              className="w-full"
              disabled={localSettings.isMuted}
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