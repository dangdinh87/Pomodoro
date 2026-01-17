"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Shield, Eye, EyeOff } from 'lucide-react'

interface BlockedSite {
  id: string
  url: string
  reason?: string
}

interface FocusModeSettings {
  isEnabled: boolean
  blockedSites: BlockedSite[]
  allowlistedSites: string[]
  showMotivationalQuotes: boolean
  strictMode: boolean
}

const motivationalQuotes = [
  "Focus on being productive instead of busy.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The way to get started is to quit talking and begin doing.",
  "You don't have to be great to start, but you have to start to be great.",
  "Focus on the journey, not the destination.",
  "The future depends on what you do today.",
  "Believe you can and you're halfway there.",
  "Your limitation—it's only your imagination."
]

export function FocusMode() {
  const [settings, setSettings] = useState<FocusModeSettings>({
    isEnabled: false,
    blockedSites: [],
    allowlistedSites: [],
    showMotivationalQuotes: true,
    strictMode: false,
  })
  
  const [newSiteUrl, setNewSiteUrl] = useState('')
  const [currentQuote, setCurrentQuote] = useState('')
  const [isBlockingActive, setIsBlockingActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (settings.showMotivationalQuotes) {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
      setCurrentQuote(randomQuote)
      
      // Change quote every 5 minutes
      intervalRef.current = setInterval(() => {
        const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
        setCurrentQuote(newQuote)
      }, 5 * 60 * 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [settings.showMotivationalQuotes])

  useEffect(() => {
    if (settings.isEnabled) {
      activateFocusMode()
    } else {
      deactivateFocusMode()
    }

    return () => {
      deactivateFocusMode()
    }
  }, [settings.isEnabled])

  const activateFocusMode = () => {
    setIsBlockingActive(true)
    
    // In a real implementation, this would:
    // 1. Install browser extension or use content scripts
    // 2. Block access to specified websites
    // 3. Monitor navigation attempts
    // 4. Show blocking page for blocked sites
    
    // For demo purposes, we'll just add a class to the body
    document.body.classList.add('focus-mode-active')
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const deactivateFocusMode = () => {
    setIsBlockingActive(false)
    document.body.classList.remove('focus-mode-active')
  }

  const addBlockedSite = () => {
    if (newSiteUrl.trim()) {
      const newSite: BlockedSite = {
        id: Date.now().toString(),
        url: newSiteUrl.trim().toLowerCase(),
        reason: 'Focus mode block'
      }
      
      setSettings(prev => ({
        ...prev,
        blockedSites: [...prev.blockedSites, newSite]
      }))
      
      setNewSiteUrl('')
    }
  }

  const removeBlockedSite = (id: string) => {
    setSettings(prev => ({
      ...prev,
      blockedSites: prev.blockedSites.filter(site => site.id !== id)
    }))
  }

  const toggleSetting = (key: keyof FocusModeSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="bg-background/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Focus Mode Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="focus-mode">Enable Focus Mode</Label>
              <p className="text-sm text-muted-foreground">
                Block distracting websites during work sessions
              </p>
            </div>
            <Switch
              id="focus-mode"
              checked={settings.isEnabled}
              onCheckedChange={() => toggleSetting('isEnabled')}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="strict-mode">Strict Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Prevent disabling focus mode during active sessions
                </p>
              </div>
              <Switch
                id="strict-mode"
                checked={settings.strictMode}
                onCheckedChange={() => toggleSetting('strictMode')}
                disabled={!settings.isEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="motivational-quotes">Show Motivational Quotes</Label>
                <p className="text-sm text-muted-foreground">
                  Display inspiring quotes during focus sessions
                </p>
              </div>
              <Switch
                id="motivational-quotes"
                checked={settings.showMotivationalQuotes}
                onCheckedChange={() => toggleSetting('showMotivationalQuotes')}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Blocked Websites</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter website URL (e.g., facebook.com)"
                value={newSiteUrl}
                onChange={(e) => setNewSiteUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBlockedSite()}
              />
              <Button onClick={addBlockedSite} size="icon" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {settings.blockedSites.map((site) => (
                <Badge key={site.id} variant="secondary" className="flex items-center gap-1">
                  {site.url}
                  <button
                    onClick={() => removeBlockedSite(site.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {settings.showMotivationalQuotes && currentQuote && (
            <>
              <Separator />
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-center italic text-muted-foreground">
                  "{currentQuote}"
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isBlockingActive && (
        <Card className="border-green-500 bg-green-50/80 dark:bg-green-950/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Focus Mode Active
                </span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {settings.blockedSites.length} sites blocked
              </Badge>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              Distractions are being blocked. Stay focused on your work!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}