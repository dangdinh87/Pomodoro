'use client'

import { memo, useState, useRef, useCallback, useEffect } from 'react'
import { Plus, Trash2, Edit2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAudioStore } from '@/stores/audio-store'
import { builtInPresets } from '@/data/sound-presets'
import type { SoundPreset } from '@/stores/audio-store'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/contexts/i18n-context'

function useScrollArrows() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }, [])

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })
  }, [])

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  return { scrollRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight }
}

export const PresetChips = memo(function PresetChips() {
  const { t } = useTranslation()
  const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds)
  const userPresets = useAudioStore((s) => s.presets.filter(p => !p.isBuiltIn))
  const loadPreset = useAudioStore((s) => s.loadPreset)
  const savePreset = useAudioStore((s) => s.savePreset)
  const deletePreset = useAudioStore((s) => s.deletePreset)
  const renamePreset = useAudioStore((s) => s.renamePreset)
  const stopAllAmbient = useAudioStore((s) => s.stopAllAmbient)

  const builtInScroll = useScrollArrows()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetIcon, setPresetIcon] = useState('🎵')

  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renamingPreset, setRenamingPreset] = useState<SoundPreset | null>(null)
  const [newPresetName, setNewPresetName] = useState('')

  // Combine built-in + user presets


  // Filter only sounds with volume > 0 for comparison
  const activeAmbientWithVolume = activeAmbientSounds.filter(s => s.volume > 0)

  // Active preset detection: exact match of sounds + volumes
  const isPresetActive = (preset: SoundPreset): boolean => {
    if (activeAmbientWithVolume.length !== preset.sounds.length) return false
    return preset.sounds.every(ps =>
      activeAmbientWithVolume.some(as => as.id === ps.id && as.volume === ps.volume)
    )
  }

  const handleLoadPreset = async (preset: SoundPreset) => {
    if (isPresetActive(preset)) {
      // Toggle off: stop all sounds if clicking the active preset
      await stopAllAmbient()
      return
    }
    await loadPreset(preset)
  }

  const handleSavePreset = () => {
    if (!presetName.trim()) return
    savePreset(presetName.trim(), presetIcon)
    setPresetName('')
    setPresetIcon('🎵')
    setSaveDialogOpen(false)
  }

  const handleOpenRenameDialog = (preset: SoundPreset) => {
    setRenamingPreset(preset)
    setNewPresetName(preset.name)
    setRenameDialogOpen(true)
  }

  const handleRenamePreset = () => {
    if (renamingPreset && newPresetName.trim()) {
      renamePreset(renamingPreset.id, newPresetName.trim())
      setRenameDialogOpen(false)
      setRenamingPreset(null)
      setNewPresetName('')
    }
  }

  const handleDeletePreset = (presetId: string) => {
    deletePreset(presetId)
  }

  const allPresets = [...builtInPresets, ...userPresets]
  const isAnyPresetActive = allPresets.some(isPresetActive)

  return (
    <>
      {/* Unified presets card */}
      <div className="bg-background/40 border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b bg-background/60">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground/90">{t('audio.presets.library')}</h3>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {allPresets.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSaveDialogOpen(true)}
            disabled={activeAmbientWithVolume.length === 0 || userPresets.length >= 10 || isAnyPresetActive}
            className="h-6 gap-1 text-[10px] font-semibold hover:bg-primary/10 hover:text-primary px-2"
          >
            <Plus className="h-3 w-3" />
            {t('audio.presets.saveMix')}
          </Button>
        </div>
        {/* Scrollable chips with arrows */}
        <div className="relative">
          {builtInScroll.canScrollLeft && (
            <Button variant="ghost" size="icon" onClick={builtInScroll.scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 hover:bg-background shadow-sm" aria-label={t('audio.presets.scrollLeft') || "Scroll left"}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {builtInScroll.canScrollRight && (
            <Button variant="ghost" size="icon" onClick={builtInScroll.scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 hover:bg-background shadow-sm" aria-label={t('audio.presets.scrollRight') || "Scroll right"}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <div ref={builtInScroll.scrollRef} className="flex gap-2 overflow-x-auto p-1.5 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {allPresets.map((preset) => {
              const isActive = isPresetActive(preset)
              const isUserPreset = !preset.isBuiltIn
              // Use translation for built-in presets, original name for user presets
              const displayName = preset.isBuiltIn
                ? t(`audio.presets.builtIn.${preset.id}`)
                : preset.name

              return (
                <div key={preset.id} className="flex-shrink-0 flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadPreset(preset)}
                    className={cn(
                      'h-8 px-3 text-sm font-medium whitespace-nowrap transition-all border',
                      isActive
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-md'
                        : 'hover:bg-accent hover:text-accent-foreground border-input',
                      isUserPreset && !isActive && 'border-dashed border-primary/30'
                    )}
                  >
                    {preset.icon && <span>{preset.icon}</span>}
                    {displayName}
                    {isUserPreset && (
                      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    )}
                  </Button>

                  {/* User preset actions dropdown */}
                  {isUserPreset && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label={`${t('audio.presets.moreOptions')} for ${displayName}`}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenRenameDialog(preset)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          {t('audio.presets.rename')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePreset(preset.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('audio.presets.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('audio.presets.savePresetTitle')}</DialogTitle>
            <DialogDescription>
              {t('audio.presets.savePresetDescription', {
                count: activeAmbientWithVolume.length,
                plural: activeAmbientWithVolume.length !== 1 ? 's' : ''
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="preset-icon">{t('audio.presets.icon')}</Label>
              <Input
                id="preset-icon"
                value={presetIcon}
                onChange={(e) => setPresetIcon(e.target.value)}
                placeholder={t('audio.presets.iconPlaceholder')}
                maxLength={10}
                className="text-base w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preset-name">{t('audio.presets.name')}</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder={t('audio.presets.namePlaceholder')}
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              {t('audio.presets.cancel')}
            </Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              {t('audio.presets.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Preset Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('audio.presets.renameTitle')}</DialogTitle>
            <DialogDescription>
              Enter a new name for &quot;{renamingPreset?.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-preset-name">{t('audio.presets.newName')}</Label>
              <Input
                id="new-preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder={t('audio.presets.newNamePlaceholder')}
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && handleRenamePreset()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              {t('audio.presets.cancel')}
            </Button>
            <Button onClick={handleRenamePreset} disabled={!newPresetName.trim()}>
              {t('audio.presets.rename')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})
