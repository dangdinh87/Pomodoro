# Phase 4: Preset System

## Context
- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 3 (sidebar exists to mount presets into)
- **Blocks**: None (independent after this)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Priority | P2 |
| Effort | 3h |
| Implementation | ✅ complete |
| Review | ✅ approved |
| Review Date | 2026-02-10 |
| Review Score | 8.5/10 |

Add horizontal scrollable preset chips to the ambient mixer. 9 built-in presets + user-created custom presets with save/rename/delete.

## Key Insights
- Presets are combinations of `AmbientSoundState[]` (sound IDs + volumes)
- Built-in presets are read-only, defined in code
- User presets stored in Zustand persist (localStorage)
- Loading a preset: stop all current sounds, play preset sounds at preset volumes
- Active preset highlighted visually
- "Save current mix" = create user preset from current `activeAmbientSounds`
- Max user presets: 10 (prevent localStorage bloat)

## Requirements
1. Create `preset-chips.tsx` -- horizontal scrollable row of preset chips
2. Define 9 built-in presets in `src/data/sound-presets.ts`
3. Add preset CRUD actions to audio-store: loadPreset, savePreset, deletePreset, renamePreset
4. "Save Mix" button creates a user preset from current active sounds
5. Long-press or context menu on user presets for rename/delete
6. Active preset detection: highlight chip if current mix matches a preset exactly

## Architecture

### Preset Data Structure (defined in Phase 2)
```typescript
interface SoundPreset {
  id: string
  name: string
  icon?: string          // emoji
  sounds: AmbientSoundState[]  // [{id, volume}, ...]
  isBuiltIn: boolean
}
```

### Built-in Presets (src/data/sound-presets.ts)
```typescript
export const builtInPresets: SoundPreset[] = [
  { id: 'cafe',       name: 'Cafe',       icon: 'coffee',    sounds: [{id:'coffee-shop', volume:50}, {id:'keyboard', volume:25}], isBuiltIn: true },
  { id: 'rain',       name: 'Rain',       icon: 'cloud-rain',sounds: [{id:'light-rain', volume:60}, {id:'thunder', volume:20}], isBuiltIn: true },
  { id: 'forest',     name: 'Forest',     icon: 'trees',     sounds: [{id:'wind-in-trees', volume:45}, {id:'river', volume:35}, {id:'birds', volume:25}], isBuiltIn: true },
  { id: 'ocean',      name: 'Ocean',      icon: 'waves',     sounds: [{id:'waves', volume:55}, {id:'wind', volume:30}], isBuiltIn: true },
  { id: 'train-ride', name: 'Train Ride', icon: 'train',     sounds: [{id:'inside-a-train', volume:50}, {id:'light-rain', volume:25}], isBuiltIn: true },
  { id: 'night',      name: 'Night',      icon: 'moon',      sounds: [{id:'campfire', volume:45}, {id:'night-crickets', volume:30}, {id:'wind', volume:15}], isBuiltIn: true },
  { id: 'library',    name: 'Library',    icon: 'book-open', sounds: [{id:'library', volume:50}, {id:'clock', volume:15}], isBuiltIn: true },
  { id: 'cozy',       name: 'Cozy',       icon: 'cat',       sounds: [{id:'cat-purring', volume:40}, {id:'fireplace', volume:35}, {id:'vinyl-effect', volume:20}], isBuiltIn: true },
  { id: 'deep-focus', name: 'Deep Focus', icon: 'brain',     sounds: [{id:'brown-noise', volume:60}], isBuiltIn: true },
]
```

> Note: Presets referencing new sounds (birds, night-crickets, coffee-shop, etc.) depend on Phase 7 adding those sound files. Use placeholder/existing sounds if assets not ready yet.

### Component Layout in Sidebar
```
[Ambient tab content]
  [Preset chips: horizontal scroll]
    [Cafe] [Rain] [Forest] ... [+ Save Mix]
  [Now Playing (N)]
    ...
  [All Sounds]
    ...
```

## Related Code Files

### Create
| File | Purpose |
|------|---------|
| `src/components/audio/preset-chips.tsx` | Horizontal scrollable preset row |
| `src/data/sound-presets.ts` | Built-in preset definitions |

### Modify
| File | Changes |
|------|---------|
| `src/stores/audio-store.ts` | Add loadPreset, savePreset, deletePreset, renamePreset actions |
| `src/components/audio/ambient-mixer.tsx` | Mount `<PresetChips />` above "Now Playing" section |

## Implementation Steps

### Step 1: Create sound-presets.ts
```typescript
// src/data/sound-presets.ts
import { SoundPreset } from '@/stores/audio-store'

export const builtInPresets: SoundPreset[] = [
  // 9 presets as defined above
]
```

### Step 2: Add preset actions to audio-store
```typescript
// New actions:
loadPreset: async (preset: SoundPreset) => {
  // 1. Stop all current ambient sounds
  await get().stopAllAmbient()
  // 2. Play each sound in preset at its volume
  for (const sound of preset.sounds) {
    await get().playAmbient(sound.id, sound.volume)
  }
}

savePreset: (name: string) => {
  const { activeAmbientSounds, presets } = get()
  if (activeAmbientSounds.length === 0) return
  if (presets.filter(p => !p.isBuiltIn).length >= 10) return // max limit

  const newPreset: SoundPreset = {
    id: `user-${Date.now()}`,
    name,
    sounds: [...activeAmbientSounds],
    isBuiltIn: false,
  }
  set({ presets: [...presets, newPreset] })
}

deletePreset: (presetId: string) => {
  set(state => ({
    presets: state.presets.filter(p => p.id !== presetId || p.isBuiltIn)
  }))
}

renamePreset: (presetId: string, newName: string) => {
  set(state => ({
    presets: state.presets.map(p =>
      p.id === presetId && !p.isBuiltIn ? { ...p, name: newName } : p
    )
  }))
}
```

### Step 3: Create preset-chips.tsx
```typescript
// src/components/audio/preset-chips.tsx
'use client'

// Props: none (reads from store)
// Layout: horizontal flex with overflow-x-auto, gap-2, snap scrolling
// Each chip: Button variant="outline", compact (h-8 px-3 text-sm)
//   - Icon (lucide) + name
//   - Active state: variant="default" if current mix matches preset
//   - onClick: loadPreset(preset)
//   - User presets: right-click or long-press -> popover with rename/delete
// Last item: [+ Save Mix] button (disabled if no active sounds)
//   - onClick: prompt for name (simple Dialog or inline input), then savePreset(name)

// Active detection:
const isPresetActive = (preset: SoundPreset) => {
  const active = activeAmbientSounds
  if (active.length !== preset.sounds.length) return false
  return preset.sounds.every(ps =>
    active.some(as => as.id === ps.id && as.volume === ps.volume)
  )
}
```

### Step 4: Mount in ambient-mixer.tsx
Insert `<PresetChips />` as first child inside the ambient tab content, before the "Now Playing" section. Add a small `mb-4` margin below.

### Step 5: Persist user presets
Already handled by audio-store persist. Ensure `presets` is included in `partialize`:
```typescript
partialize: (state) => ({
  // ...existing
  presets: state.presets,
})
```
Built-in presets are merged on load (not persisted, always from code).

### Step 6: Merge built-in + user presets
On store init, combine `builtInPresets` with persisted user presets:
```typescript
// In store init or a computed getter:
getAllPresets: () => {
  return [...builtInPresets, ...get().presets.filter(p => !p.isBuiltIn)]
}
```

## Todo List
- [x] Create src/data/sound-presets.ts with 9 built-in presets ✅
- [x] Add loadPreset, savePreset, deletePreset, renamePreset to audio-store ✅
- [x] Add presets to persist partialize ✅
- [x] Create preset-chips.tsx component ✅
- [x] Mount PresetChips in ambient-mixer.tsx ✅
- [x] Active preset detection logic ✅
- [x] "Save Mix" flow (name prompt + save) ✅
- [x] User preset rename/delete UI ✅
- [x] Test preset load/save/delete cycle ✅
- [x] Build verification ✅

## Success Criteria
1. Preset chips render horizontally with scroll
2. Tapping built-in preset loads correct sounds at correct volumes
3. "Save Mix" creates user preset visible in chips
4. User presets persist across page reload
5. Delete removes user preset; built-in presets cannot be deleted
6. Active preset highlighted when current mix matches exactly
7. Max 10 user presets enforced

## Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| Preset references sounds not yet added (Phase 7) | Medium | Use existing sound IDs for now; presets with missing sounds gracefully skip |
| Active detection false negatives from float rounding | Low | Volume is integer 0-100, exact match is reliable |
| User creates many presets, localStorage bloat | Low | Cap at 10 user presets; each preset is ~200 bytes |

## Review Summary
**Status**: ✅ APPROVED (Score: 8.5/10)
**Report**: [code-reviewer-260210-1124-phase4-preset-system.md](../reports/code-reviewer-260210-1124-phase4-preset-system.md)

**Key Findings**:
- ✅ All requirements met, no critical issues
- ✅ TypeScript types correct, build passing
- ✅ Excellent error handling with graceful skip for missing sounds
- ✅ Built-in preset protection and max 10 user presets enforced
- 🟡 Minor improvements recommended (see report M1-M4):
  - Memoize active preset detection for performance
  - Add user feedback for save validation errors
  - Add preset name duplicate validation
  - Consider emoji picker for icons

**Files Changed**:
- `src/data/sound-presets.ts` (NEW, 103 lines)
- `src/components/audio/preset-chips.tsx` (NEW, 232 lines)
- `src/stores/audio-store.ts` (+64 lines)
- `src/components/audio/ambient-mixer.tsx` (+6 lines)

## Next Steps
✅ Phase 4 complete. Proceed to Phase 5+ per parent plan.
Optional: Address medium-priority improvements from review report.
