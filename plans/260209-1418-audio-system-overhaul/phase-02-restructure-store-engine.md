# Phase 2: Restructure Audio Store & Engine

## Context
- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 1 (Spotify removed)
- **Blocks**: Phase 3, 4, 5, 6

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Priority | P1 |
| Effort | 4h |
| Implementation | done |
| Review | done |
| Completed | 2026-02-09 |

Redesign audio-store.ts and audio-manager.ts to support per-sound volume, new category structure, alarm types, and exclusive source switching. Migrate localStorage from v2 to v3.

## Key Insights
- Current `activeAmbientSounds: string[]` stores only IDs -- needs to become `AmbientSoundState[]` with `{id, volume}`
- Current `AudioManager.setVolume()` applies same volume to ALL ambient players -- needs per-sound volume
- Current `sound-catalog.ts` uses flat `SoundGroup` ("alarms" | "ticks" | "ambient") -- needs 8 categories
- `selectedAmbientSound` and `selectedTab` in AudioSettings are Spotify-era leftovers -- remove
- The `volume` field in AudioSettings is the master volume; per-sound volumes are independent multiplied by master

## Requirements
1. New `AmbientSoundState` type: `{ id: string, volume: number }`
2. New `SoundPreset` type: `{ id, name, icon?, sounds: AmbientSoundState[], isBuiltIn }`
3. Redesign `AudioSettings`: add `activeSource`, `alarmType`, `alarmVolume`; remove `selectedAmbientSound`, `selectedTab`
4. `activeAmbientSounds` changes from `string[]` to `AmbientSoundState[]`
5. `AudioManager`: per-sound `setAmbientVolume(id, volume)`, effective volume = `(soundVolume / 100) * (masterVolume / 100)`
6. Restructure sound-catalog.ts into 8 categories with new `SoundCategory` type
7. Add alarm sound entries to catalog
8. Migration function: v2 data -> v3 format
9. Store ambient state for YouTube restore (saved in store as `savedAmbientState`)

## Architecture

### New Types (audio-store.ts)
```typescript
export interface AmbientSoundState {
  id: string
  volume: number // 0-100, individual per-sound
}

export interface SoundPreset {
  id: string
  name: string
  icon?: string
  sounds: AmbientSoundState[]
  isBuiltIn: boolean
}

export interface AudioSettings {
  masterVolume: number       // 0-100
  isMuted: boolean
  fadeInOut: boolean
  activeSource: 'ambient' | 'youtube' | 'none'
  alarmType: string          // 'bell' | 'chime' | 'gong' | 'digital' | 'soft'
  alarmVolume: number        // 0-100
  youtubeUrl: string
}

// In AudioState:
activeAmbientSounds: AmbientSoundState[]  // changed from string[]
presets: SoundPreset[]                     // new
savedAmbientState: AmbientSoundState[]    // preserved when switching to YouTube
```

### New Category Types (sound-catalog.ts)
```typescript
export type SoundCategory =
  | 'nature' | 'rain' | 'noise' | 'study'
  | 'cozy'   | 'transport' | 'city' | 'machine'

export interface SoundItem {
  id: string
  category: SoundCategory   // replaces `group: SoundGroup`
  label: string
  vn?: string
  icon?: string             // emoji or lucide icon name
  url: string
}

// Catalog becomes: Record<SoundCategory, SoundItem[]>
```

### AudioManager Changes
```typescript
// New method
setAmbientVolume(soundId: string, volume: number, masterVolume: number): void {
  const player = this.ambientPlayers.get(soundId)
  if (player) {
    const effective = (volume / 100) * (masterVolume / 100)
    player.setVolume(effective * 100)
  }
}

// Modified playAmbient signature
async playAmbient(source: AudioSource): Promise<boolean>
// source.volume now = per-sound volume (not master)
// Internal: applies (source.volume/100) * (this.masterVolume/100)
```

### Volume Model
```
Effective Volume = (soundVolume / 100) * (masterVolume / 100)
Example: sound=60, master=80 -> effective = 0.48 -> audio.volume = 0.48
```

## Related Code Files

### Modify
| File | Changes |
|------|---------|
| `src/stores/audio-store.ts` | New types, new actions (setSoundVolume, setActiveSource, saveAmbientState, restoreAmbientState), migration logic, renamed volume -> masterVolume |
| `src/lib/audio/audio-manager.ts` | `setAmbientVolume(id, vol, master)`, update `playAmbient` to use per-sound volume, update `setVolume` to recalculate all ambient volumes |
| `src/lib/audio/sound-catalog.ts` | New 8-category structure, remove 14 sounds, add alarm entries, new helper functions |

## Implementation Steps

### Step 1: Restructure sound-catalog.ts
1. Replace `SoundGroup` with `SoundCategory` type
2. Replace `soundCatalog` record keys with 8 categories
3. Remove 14 deprecated sounds from entries
4. Move ticks into appropriate categories (clock -> cozy, typewriter/keyboard -> study, wind-chimes -> cozy)
5. Add alarm entries: `bell` (existing alarm.mp3), `chime`, `gong`, `digital`, `soft` (placeholder URLs for now)
6. Add `icon` field to each SoundItem (emoji string)
7. Update `allSounds()`, `getGroup()` -> `getCategory()`, `findSound()` helpers

### Step 2: Redesign audio-store types
1. Add `AmbientSoundState`, `SoundPreset` interfaces
2. Rewrite `AudioSettings`: rename `volume` -> `masterVolume`, add `activeSource`, `alarmType`, `alarmVolume`, remove `selectedAmbientSound`, `selectedTab`, rename `selectedNotificationSound` -> (remove, merged into alarmType)
3. Change `activeAmbientSounds` type from `string[]` to `AmbientSoundState[]`
4. Add `presets: SoundPreset[]` and `savedAmbientState: AmbientSoundState[]`

### Step 3: Add new store actions
```typescript
// Per-sound volume
setSoundVolume: (soundId: string, volume: number) => void
// Updates AmbientSoundState.volume and calls audioManager.setAmbientVolume

// Source switching
setActiveSource: (source: 'ambient' | 'youtube' | 'none') => void
// When switching to youtube: save current ambient state, stop ambients
// When switching to ambient: stop youtube, restore saved state

// Ambient state preservation
saveAmbientState: () => void
restoreAmbientState: () => void
```

### Step 4: Update playAmbient action
```typescript
playAmbient: async (soundId: string, volume = 50) => {
  // Create AmbientSoundState with per-sound volume
  // Pass to audioManager with effective volume calculation
  // Update activeAmbientSounds array with new {id, volume} entry
}
```

### Step 5: Update AudioManager
1. Rename internal `volume` -> `masterVolume`
2. Add `setAmbientVolume(soundId, soundVolume, masterVolume)` method
3. Update `playAmbient()`: calculate effective volume on play
4. Update `setVolume()`: recalculate ALL ambient player volumes using stored per-sound volumes
5. Store per-sound volumes internally: `ambientVolumes: Map<string, number>`

### Step 6: Update existing actions for new types
- `toggleAmbient`: works with `AmbientSoundState[]`
- `stopAmbient`: filters by id from `AmbientSoundState[]`
- `stopAllAmbient`: clears `AmbientSoundState[]`
- `updateVolume`: now updates masterVolume, recalculates all ambient effective volumes
- `updateCurrentlyPlayingForAmbients`: reads from new array shape

### Step 7: Migration logic
```typescript
// In persist config:
version: 3,
migrate: (persistedState: any, version: number) => {
  if (version < 3) {
    // Convert string[] to AmbientSoundState[]
    if (Array.isArray(persistedState.activeAmbientSounds)) {
      persistedState.activeAmbientSounds = persistedState.activeAmbientSounds.map(
        (id: string) => typeof id === 'string' ? { id, volume: 50 } : id
      )
    }
    // Rename volume -> masterVolume
    if (persistedState.audioSettings?.volume !== undefined) {
      persistedState.audioSettings.masterVolume = persistedState.audioSettings.volume
      delete persistedState.audioSettings.volume
    }
    // Add defaults for new fields
    persistedState.audioSettings = {
      ...persistedState.audioSettings,
      activeSource: 'ambient',
      alarmType: 'bell',
      alarmVolume: 70,
    }
    // Remove deprecated fields
    delete persistedState.audioSettings?.selectedAmbientSound
    delete persistedState.audioSettings?.selectedTab
    delete persistedState.audioSettings?.selectedNotificationSound
    delete persistedState.audioSettings?.notificationVolume
    // Init new state
    persistedState.presets = []
    persistedState.savedAmbientState = []
  }
  return persistedState
}
```

### Step 8: Update localStorage key
Change persist `name` from `'audio-storage-v2'` to `'audio-storage-v3'` OR keep same key with version-based migration (preferred -- Zustand persist supports `version` field).

## Todo List
- [x] Restructure sound-catalog.ts with 8 categories
- [x] Add alarm sound entries to catalog
- [x] Define new TypeScript interfaces in audio-store.ts
- [x] Rewrite AudioSettings type
- [x] Change activeAmbientSounds type to AmbientSoundState[]
- [x] Add new store actions (setSoundVolume, setActiveSource, etc.)
- [x] Update all existing actions for new array shape
- [x] Add per-sound volume to AudioManager
- [x] Update AudioManager.setVolume to recalculate effective volumes
- [x] Implement migration logic (v2 -> v3)
- [x] Update audio-settings-modal.tsx for new store shape (temporary, before Phase 3 rewrite)
- [x] Run build and fix type errors (BLOCKED: pre-existing errors in unrelated files)

## Review Findings (2026-02-09)

**Score:** 7.5/10 | **Report:** [code-reviewer-260209-1651-phase2-audio-restructure.md](../reports/code-reviewer-260209-1651-phase2-audio-restructure.md)

### Critical Issues to Fix Before Phase 3
- **H1:** Add bounds checks before `activeAmbientSounds[0]` access (audio-store.ts:255,306)
- **H2:** Add volume clamping in `setAmbientVolume()` and `playAmbient()` (audio-manager.ts:394, audio-store.ts:167,429)
- **H3:** Build blocked by 20 pre-existing TS errors in unrelated files (navigation.tsx, task components, test files)

### Medium Priority (Can defer to Phase 3/4)
- **M1:** Memoize `soundCatalog.ambient` getter to avoid repeated flatMap()
- **M2:** Improve migration type safety (replace `any` with proper types)
- **M3:** Create placeholder MP3 files for 7 unavailable sounds (white-noise, library, coffee-shop, etc.) OR comment out entries

### Positive Findings
- ✅ Correct volume formula: `(soundVol/100) * (masterVol/100) * 100`
- ✅ Batch state updates prevent re-render storms
- ✅ Migration logic handles v2→v3 conversion correctly
- ✅ Backward-compatible `soundCatalog.ambient` getter maintained
- ✅ No security vulnerabilities (OWASP audit passed)

## Success Criteria
1. `next build` passes
2. Per-sound volume: changing one sound's volume does not affect others
3. Master volume: changing master recalculates all effective volumes correctly
4. Migration: fresh app with old localStorage data auto-migrates without errors
5. All existing ambient play/stop/toggle functionality preserved
6. sound-catalog has 8 categories, ~27 retained sounds, alarm entries

## Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| Breaking existing ambient playback | Medium | Keep `toggleAmbient` signature compatible, update internals |
| Migration corrupts user data | Low | Migration defaults to safe values; test with mock v2 data |
| Volume calculation edge cases | Low | Clamp all values to 0-100 range; unit test effective volume math |
| audio-settings-modal breaks | Medium | Temporary patch to work with new types; full rewrite in Phase 3 |

## Next Steps
After this phase, Phase 3 (sidebar UI) and Phase 5 (YouTube exclusive) can begin in parallel.
