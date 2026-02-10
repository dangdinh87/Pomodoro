'use client'

import { memo, useState } from 'react'
import { Plus, Trash2, Edit2, MoreVertical } from 'lucide-react'
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

export const PresetChips = memo(function PresetChips() {
  const activeAmbientSounds = useAudioStore((s) => s.activeAmbientSounds)
  const userPresets = useAudioStore((s) => s.presets.filter(p => !p.isBuiltIn))
  const loadPreset = useAudioStore((s) => s.loadPreset)
  const savePreset = useAudioStore((s) => s.savePreset)
  const deletePreset = useAudioStore((s) => s.deletePreset)
  const renamePreset = useAudioStore((s) => s.renamePreset)

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetIcon, setPresetIcon] = useState('🎵')

  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renamingPreset, setRenamingPreset] = useState<SoundPreset | null>(null)
  const [newPresetName, setNewPresetName] = useState('')

  // Combine built-in + user presets
  const allPresets = [...builtInPresets, ...userPresets]

  // Active preset detection: exact match of sounds + volumes
  const isPresetActive = (preset: SoundPreset): boolean => {
    if (activeAmbientSounds.length !== preset.sounds.length) return false
    return preset.sounds.every(ps =>
      activeAmbientSounds.some(as => as.id === ps.id && as.volume === ps.volume)
    )
  }

  const handleLoadPreset = async (preset: SoundPreset) => {
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

  return (
    <>
      {/* Horizontal scrollable preset chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {allPresets.map((preset) => {
          const isActive = isPresetActive(preset)
          const isUserPreset = !preset.isBuiltIn

          return (
            <div key={preset.id} className="snap-start flex-shrink-0 flex items-center gap-1">
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLoadPreset(preset)}
                className={cn(
                  'h-8 px-3 text-xs font-medium whitespace-nowrap transition-all',
                  isActive && 'shadow-md'
                )}
              >
                {preset.icon && <span className="mr-1.5">{preset.icon}</span>}
                {preset.name}
              </Button>

              {/* User preset actions dropdown */}
              {isUserPreset && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenRenameDialog(preset)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeletePreset(preset.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}

        {/* Save Mix button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          disabled={activeAmbientSounds.length === 0 || userPresets.length >= 10}
          className="h-8 px-3 text-xs whitespace-nowrap shrink-0 snap-start"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Save Mix
        </Button>
      </div>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
            <DialogDescription>
              Create a new preset from your current ambient mix ({activeAmbientSounds.length} sound
              {activeAmbientSounds.length !== 1 ? 's' : ''}).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="preset-icon">Icon</Label>
              <Input
                id="preset-icon"
                value={presetIcon}
                onChange={(e) => setPresetIcon(e.target.value)}
                placeholder="🎵"
                maxLength={2}
                className="text-2xl text-center w-20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="My Preset"
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Preset Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Preset</DialogTitle>
            <DialogDescription>
              Enter a new name for "{renamingPreset?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-preset-name">New Name</Label>
              <Input
                id="new-preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="New Preset Name"
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && handleRenamePreset()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenamePreset} disabled={!newPresetName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})
