# Phase 3: Build Audio Sidebar Panel

## Context
- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 2 (store restructured)
- **Blocks**: Phase 4 (presets need the sidebar to mount into)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Priority | P1 |
| Effort | 5h |
| Implementation | pending |
| Review | pending |

Replace the 800px Dialog-based audio modal with a 350px right-side Sheet panel. Build the ambient mixer UI with "Now Playing" section, per-sound volume sliders, icon grid for sound selection, and master volume control.

## Key Insights
- shadcn Sheet component already installed at `src/components/ui/sheet.tsx` (140 LOC)
- shadcn Slider already installed at `src/components/ui/slider.tsx` (27 LOC)
- Sheet uses Radix Dialog under the hood -- portal-based, no z-index issues with timer
- Mobile: `w-full md:w-[350px]` -- fullscreen on mobile, fixed width on desktop
- Current modal is 524 LOC -- new sidebar will be split into 5-6 smaller components
- Timer dock button (`setAudioSettingsOpen(true)`) needs to trigger Sheet instead of Dialog

## Requirements
1. Create `audio-sidebar.tsx` -- main Sheet wrapper with 2 source tabs (Ambient/YouTube)
2. Create `ambient-mixer.tsx` -- "Now Playing" section + "All Sounds" section
3. Create `sound-icon-grid.tsx` -- compact icon grid per category, tap to toggle
4. Create `active-sound-card.tsx` -- per-sound volume slider + remove button
5. Master volume + mute toggle at bottom
6. Replace AudioSettingsModal usage in timer-settings-dock.tsx
7. Delete `audio-settings-modal.tsx` after replacement
8. Mobile responsive: fullscreen overlay on small screens

## Architecture

### Component Tree
```
<AudioSidebar>                    -- Sheet wrapper, source tabs
  <SheetContent side="right">
    <SheetHeader />               -- title + close
    <Tabs>                        -- [Ambient] [YouTube]
      <TabsContent="ambient">
        <AmbientMixer />          -- main ambient view
          <ActiveSoundsSection>   -- "Now Playing (N)"
            <ActiveSoundCard />   -- per-sound: icon + label + slider + remove
            <ActiveSoundCard />
          </ActiveSoundsSection>
          <AllSoundsSection>      -- "All Sounds"
            <SoundIconGrid        -- per-category collapsible
              category="nature" />
            <SoundIconGrid
              category="rain" />
            ...8 categories
          </AllSoundsSection>
        </AmbientMixer>
      </TabsContent>
      <TabsContent="youtube">
        <YouTubePane />           -- reuse existing (adapt width)
      </TabsContent>
    </Tabs>
    <SidebarFooter>               -- master volume + alarm (Phase 6)
      <MasterVolumeControl />
    </SidebarFooter>
  </SheetContent>
</AudioSidebar>
```

### Layout (350px)
```
[Header: "Audio" + close button]
[Tabs: Ambient | YouTube]
---scrollable---
[Now Playing (2)]
  [Rain        ====o==== 60%  x]
  [Campfire    ==o====== 30%  x]
[All Sounds]
  > Nature (6)
    [campfire] [droplets] [river] [waves] [wind-trees] [wind]
  > Rain (5)
    [heavy] [light] [leaves] [window] [thunder]
  ... (collapsible)
---fixed bottom---
[Master: mute-btn  ====o==== 70%]
```

## Related Code Files

### Create
| File | Purpose |
|------|---------|
| `src/components/audio/audio-sidebar.tsx` | Sheet wrapper, tab switching, header/footer |
| `src/components/audio/ambient-mixer.tsx` | Scrollable content: active sounds + all sounds |
| `src/components/audio/sound-icon-grid.tsx` | Category header + icon button grid |
| `src/components/audio/active-sound-card.tsx` | Single active sound: label + slider + remove |

### Modify
| File | Changes |
|------|---------|
| `src/app/(main)/timer/components/timer-settings-dock.tsx` | Replace `AudioSettingsModal` with `AudioSidebar`, change `audioSettingsOpen` to `audioSidebarOpen`, update Music button onClick |
| `src/components/audio/youtube/youtube-pane.tsx` | Adapt layout for 350px width (may need minor CSS tweaks) |

### Delete
| File | Reason |
|------|--------|
| `src/components/settings/audio-settings-modal.tsx` | Replaced by audio-sidebar.tsx |

## Implementation Steps

### Step 1: Create audio-sidebar.tsx
```typescript
// src/components/audio/audio-sidebar.tsx
'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AmbientMixer } from './ambient-mixer'
import YouTubePane from './youtube/youtube-pane'
import { useAudioStore } from '@/stores/audio-store'
import { Volume2, VolumeX } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

interface AudioSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AudioSidebar({ open, onOpenChange }: AudioSidebarProps) {
  // Store: masterVolume, isMuted, activeSource, updateVolume, toggleMute
  // Tabs: controlled by activeSource from store
  // SheetContent: side="right", className="w-full md:w-[350px] p-0"
  // Footer: fixed at bottom with master volume slider
}
```

### Step 2: Create ambient-mixer.tsx
```typescript
// src/components/audio/ambient-mixer.tsx
'use client'

import { ActiveSoundCard } from './active-sound-card'
import { SoundIconGrid } from './sound-icon-grid'
import { useAudioStore } from '@/stores/audio-store'
import { soundCatalog, SoundCategory } from '@/lib/audio/sound-catalog'

// Sections:
// 1. "Now Playing (N)" -- map activeAmbientSounds to ActiveSoundCard
// 2. "All Sounds" -- map categories to SoundIconGrid
// Categories order: nature, rain, noise, study, cozy, transport, city, machine
```

### Step 3: Create sound-icon-grid.tsx
```typescript
// src/components/audio/sound-icon-grid.tsx
'use client'

// Props: category: SoundCategory, sounds: SoundItem[]
// Collapsible section with category name header
// Grid of icon buttons: 5-6 per row (grid-cols-5 or grid-cols-6)
// Each button: emoji icon, toggles sound on/off
// Active state: highlighted background, border
// Tooltip on hover: sound label
// onClick: toggleAmbient(soundId) with default volume 50
```

### Step 4: Create active-sound-card.tsx
```typescript
// src/components/audio/active-sound-card.tsx
'use client'

// Props: soundState: AmbientSoundState, soundItem: SoundItem
// Layout: horizontal card
//   [icon] [label] [slider 0-100] [volume %] [x button]
// Slider: shadcn Slider, onValueChange -> setSoundVolume(id, value)
// X button: stopAmbient(id)
// Compact: h-10 per card to fit many in sidebar
```

### Step 5: Update timer-settings-dock.tsx
1. Replace `import { AudioSettingsModal }` with `import { AudioSidebar }`
2. Rename state: `audioSettingsOpen` -> `audioSidebarOpen`
3. Replace `<AudioSettingsModal>` with `<AudioSidebar open={audioSidebarOpen} onOpenChange={setAudioSidebarOpen} />`
4. Music button `onClick` unchanged: `() => setAudioSidebarOpen(true)`

### Step 6: Adapt YouTube pane for sidebar width
- Check `youtube-pane.tsx` (306 LOC) for any hardcoded widths
- YouTube iframe should be 100% width inside sidebar
- Suggestions grid may need `grid-cols-1` instead of multi-column
- Input section should be full-width

### Step 7: Delete audio-settings-modal.tsx
```bash
rm src/components/settings/audio-settings-modal.tsx
```
Grep for remaining imports and remove them.

### Step 8: Styling details
- Sheet overlay: `bg-black/20` (subtle, timer still visible)
- Scrollable content area: `overflow-y-auto flex-1`
- Fixed footer: `border-t p-4 shrink-0`
- Active sound cards: `space-y-2`
- Icon grid: `grid grid-cols-5 gap-2` (each icon ~48px button)
- Sound icon buttons: `h-10 w-10 rounded-lg` with emoji centered
- Category headers: `text-xs font-medium text-muted-foreground uppercase`
- Collapsible: use native `<details>/<summary>` or simple toggle state (KISS)

## Todo List
- [ ] Create audio-sidebar.tsx (Sheet + tabs + footer)
- [ ] Create ambient-mixer.tsx (active sounds + all sounds sections)
- [ ] Create sound-icon-grid.tsx (collapsible category grid)
- [ ] Create active-sound-card.tsx (slider + remove per sound)
- [ ] Update timer-settings-dock.tsx to use AudioSidebar
- [ ] Adapt youtube-pane.tsx for 350px width
- [ ] Delete audio-settings-modal.tsx
- [ ] Test mobile fullscreen overlay
- [ ] Test keyboard navigation (tab through sliders, Esc to close)
- [ ] Build verification

## Success Criteria
1. Sidebar opens from right on Music button click
2. Active sounds show with individual volume sliders that work
3. Icon grid shows all categories, tap toggles sound
4. Newly toggled sound appears in "Now Playing" section
5. Master volume slider at bottom affects all sounds
6. YouTube tab shows existing pane, adapted to 350px
7. Mobile: sidebar takes full width
8. `next build` passes

## Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| Sheet z-index conflicts with timer overlays | Low | Sheet is portal-based, isolated z-index |
| YouTube iframe sizing in narrow sidebar | Medium | Test iframe at 100% width; may need `aspect-ratio` wrapper |
| Many active sounds overflow sidebar | Low | Scrollable area handles overflow; max 6 sounds |
| Slider performance with many sliders | Low | shadcn Slider is lightweight; debounce volume updates at 50ms |

## Next Steps
After this phase, proceed to [Phase 4: Preset System](./phase-04-preset-system.md) which adds preset chips to the sidebar.
