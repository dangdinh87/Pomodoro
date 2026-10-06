'use client'

import { memo, useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Plus, Trash, PencilSimple, DotsThreeVertical, CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/filter-chip'
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
import { useTranslation } from '@/contexts/i18n-context'
import { getPresetIcon } from './sound-icons'

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

function PresetIcon({ preset }: { preset: SoundPreset }) {
  const Icon = getPresetIcon(preset.id)
  return <Icon size={16} aria-hidden="true" />
}

export const PresetChips = memo(function PresetChips() {
  const { t } = useTranslation()
  const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds)
  const presets = useAudioStore((s) => s.presets)
  const userPresets = useMemo(() => presets.filter((p) => !p.isBuiltIn), [presets])
  const loadPreset = useAudioStore((s) => s.loadPreset)
  const savePreset = useAudioStore((s) => s.savePreset)
  const deletePreset = useAudioStore((s) => s.deletePreset)
  const renamePreset = useAudioStore((s) => s.renamePreset)
  const stopAllAmbient = useAudioStore((s) => s.stopAllAmbient)

  const { scrollRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useScrollArrows()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState('')

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
    savePreset(presetName.trim())
    setPresetName('')
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
  const canSave = activeAmbientWithVolume.length > 0 && userPresets.length < 10 && !isAnyPresetActive

  return (
    <>
      {/* Library: built-in presets as chips, saved mixes as a list under them */}
      <section aria-label={t('audio.presets.library')} className="sticker-sm overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 pb-1 pt-3">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-[1.0625rem] font-bold text-ink">{t('audio.presets.library')}</h3>
            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs font-bold tabular-nums text-ink-secondary">
              {builtInPresets.length}
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSaveDialogOpen(true)}
            disabled={!canSave}
            className="gap-1"
          >
            <Plus size={14} weight="bold" aria-hidden="true" />
            {t('audio.presets.saveMix')}
          </Button>
        </div>

        {/* Scrollable chips with arrows */}
        <div className="relative">
          {canScrollLeft && (
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollLeft}
              aria-label={t('audio.scrollLeft')}
              className="absolute left-1 top-1/2 z-10 size-8 -translate-y-1/2"
            >
              <CaretLeft size={16} weight="bold" aria-hidden="true" />
            </Button>
          )}
          {canScrollRight && (
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollRight}
              aria-label={t('audio.scrollRight')}
              className="absolute right-1 top-1/2 z-10 size-8 -translate-y-1/2"
            >
              <CaretRight size={16} weight="bold" aria-hidden="true" />
            </Button>
          )}
          <div
            ref={scrollRef}
            role="group"
            aria-label={t('audio.presets.library')}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth px-3 py-2.5 scrollbar-hide"
          >
            {builtInPresets.map((preset) => (
              <FilterChip
                key={preset.id}
                active={isPresetActive(preset)}
                onClick={() => handleLoadPreset(preset)}
              >
                <PresetIcon preset={preset} />
                {t(`audio.presets.builtIn.${preset.id}`)}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-border px-3 py-3">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="font-heading text-[0.9375rem] font-bold text-ink">{t('audio.presets.savedMixes')}</h4>
            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs font-bold tabular-nums text-ink-secondary">
              {userPresets.length}/10
            </span>
          </div>
          {userPresets.length === 0 ? (
            <p className="text-[0.8125rem] leading-snug text-ink-muted">{t('audio.presets.savedEmpty')}</p>
          ) : (
            <ul className="space-y-2">
              {userPresets.map((preset) => (
                <li key={preset.id} className="flex items-center gap-2">
                  <FilterChip
                    active={isPresetActive(preset)}
                    onClick={() => handleLoadPreset(preset)}
                    className="min-w-0 flex-1 justify-start"
                  >
                    <PresetIcon preset={preset} />
                    <span className="truncate">{preset.name}</span>
                  </FilterChip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        aria-label={t('audio.presets.mixOptions', { name: preset.name })}
                      >
                        <DotsThreeVertical size={18} weight="bold" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenRenameDialog(preset)}>
                        <PencilSimple size={16} className="mr-2" aria-hidden="true" />
                        {t('audio.presets.rename')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeletePreset(preset.id)}
                        className="text-danger-ink focus:text-danger-ink"
                      >
                        <Trash size={16} className="mr-2" aria-hidden="true" />
                        {t('audio.presets.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('audio.presets.savePresetTitle')}</DialogTitle>
            <DialogDescription>
              {activeAmbientWithVolume.length === 1
                ? t('audio.presets.savePresetDescriptionOne')
                : t('audio.presets.savePresetDescription', { count: activeAmbientWithVolume.length })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              {t('audio.presets.renameDescription', { name: renamingPreset?.name ?? '' })}
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
