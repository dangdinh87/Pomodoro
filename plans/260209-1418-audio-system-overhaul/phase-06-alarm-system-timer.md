# Phase 6: Alarm System & Timer Integration

## Context
- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 2 (alarmType/alarmVolume in store), Phase 3 (sidebar footer area)
- **Blocks**: None

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Priority | P2 |
| Effort | 3h |
| Implementation | pending |
| Review | pending |

Replace hardcoded alarm in use-timer-engine.ts with configurable alarm type + volume from audio store. Add alarm settings UI to sidebar footer. Add new alarm sound files.

## Key Insights
- Current hardcode in `use-timer-engine.ts` (L112-116):
  ```typescript
  const audio = new Audio('/sounds/alarm.mp3')
  audio.volume = 0.5
  audio.play().catch(() => {})
  ```
- This ignores all user settings -- always plays `alarm.mp3` at 50% volume
- `system-store.ts` has `SoundSettings.soundType` but it's NEVER read by the timer engine
- Phase 1 removes the legacy `SoundSettings`; Phase 2 adds `alarmType` + `alarmVolume` to AudioSettings
- Need 4 new alarm sound files (chime, gong, digital, soft) -- existing: alarm.mp3, silence.mp3
- Alarm settings in sidebar footer: dropdown + volume slider, always visible regardless of active tab

## Requirements
1. Create `alarm-settings.tsx` component for sidebar footer
2. Source/create 4 new alarm sounds and add to `public/sounds/alarms/`
3. Add alarm entries to sound-catalog.ts (done partially in Phase 2)
4. Fix `use-timer-engine.ts` to read `alarmType` and `alarmVolume` from audio store
5. Add preview button to test alarm sound in settings
6. Alarm plays regardless of mute state (important: timer completion must always alert)

## Architecture

### Alarm Settings UI (sidebar footer)
```
[fixed bottom section of sidebar]
---border-t---
[Master: mute  ====o==== 70%]
[Alarm:  [Bell v]  ====o==== 50%  [preview]]
```

### Alarm Sound Files
| ID | Label | File | Source |
|----|-------|------|--------|
| bell | Bell | `/sounds/alarms/alarm.mp3` | existing (rename path) |
| chime | Chime | `/sounds/alarms/chime.mp3` | freesound.org or generate |
| gong | Gong | `/sounds/alarms/gong.mp3` | freesound.org |
| digital | Digital | `/sounds/alarms/digital.mp3` | freesound.org |
| soft | Soft | `/sounds/alarms/soft.mp3` | freesound.org |

### Timer Engine Fix
```typescript
// In handleLoopComplete():
const { alarmType, alarmVolume } = useAudioStore.getState().audioSettings
const alarmSound = soundCatalog.alarms.find(s => s.id === alarmType)
if (alarmSound) {
  const audio = new Audio(alarmSound.url)
  audio.volume = alarmVolume / 100
  audio.play().catch(() => {})
}
```

## Related Code Files

### Create
| File | Purpose |
|------|---------|
| `src/components/audio/alarm-settings.tsx` | Alarm type dropdown + volume slider + preview |
| `public/sounds/alarms/chime.mp3` | New alarm sound |
| `public/sounds/alarms/gong.mp3` | New alarm sound |
| `public/sounds/alarms/digital.mp3` | New alarm sound |
| `public/sounds/alarms/soft.mp3` | New alarm sound |

### Modify
| File | Changes |
|------|---------|
| `src/app/(main)/timer/hooks/use-timer-engine.ts` | Replace hardcoded alarm with store-driven alarm |
| `src/components/audio/audio-sidebar.tsx` | Mount AlarmSettings in footer section |
| `src/lib/audio/sound-catalog.ts` | Update alarm entries with correct paths |

### Move
| From | To | Reason |
|------|-----|--------|
| `public/sounds/alarm.mp3` | `public/sounds/alarms/alarm.mp3` | Organize into alarms subfolder |

## Implementation Steps

### Step 1: Organize alarm sound files
1. Create `public/sounds/alarms/` directory
2. Move `public/sounds/alarm.mp3` -> `public/sounds/alarms/bell.mp3` (rename to match ID)
3. Keep `public/sounds/silence.mp3` in place (or move to alarms/)
4. Source and add 4 new alarm MP3 files (chime, gong, digital, soft)
   - Requirements: 2-5 seconds duration, clear distinct sound, non-looping
   - Sources: freesound.org (CC0 license), or generate with audio tools

### Step 2: Update sound-catalog.ts alarm entries
```typescript
alarms: [
  { id: 'bell',    category: 'alarm', label: 'Bell',    vn: 'Chuong', url: '/sounds/alarms/bell.mp3' },
  { id: 'chime',   category: 'alarm', label: 'Chime',   vn: 'Chuong nhe', url: '/sounds/alarms/chime.mp3' },
  { id: 'gong',    category: 'alarm', label: 'Gong',    vn: 'Chuong dong', url: '/sounds/alarms/gong.mp3' },
  { id: 'digital', category: 'alarm', label: 'Digital', vn: 'Ky thuat so', url: '/sounds/alarms/digital.mp3' },
  { id: 'soft',    category: 'alarm', label: 'Soft',    vn: 'Nhe nhang', url: '/sounds/alarms/soft.mp3' },
]
```

### Step 3: Create alarm-settings.tsx
```typescript
// src/components/audio/alarm-settings.tsx
'use client'

import { useAudioStore } from '@/stores/audio-store'
import { soundCatalog } from '@/lib/audio/sound-catalog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Bell, Play } from 'lucide-react'

export function AlarmSettings() {
  const alarmType = useAudioStore(s => s.audioSettings.alarmType)
  const alarmVolume = useAudioStore(s => s.audioSettings.alarmVolume)
  const updateSettings = useAudioStore(s => s.updateAudioSettings)

  const previewAlarm = () => {
    const alarm = soundCatalog.alarms.find(a => a.id === alarmType)
    if (alarm) {
      const audio = new Audio(alarm.url)
      audio.volume = alarmVolume / 100
      audio.play().catch(() => {})
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={alarmType} onValueChange={v => updateSettings({ alarmType: v })}>
        <SelectTrigger className="h-8 w-24 text-xs" />
        <SelectContent>
          {soundCatalog.alarms.map(a => (
            <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Slider
        value={[alarmVolume]}
        min={0} max={100} step={1}
        onValueChange={([v]) => updateSettings({ alarmVolume: v })}
        className="flex-1"
      />
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={previewAlarm}>
        <Play className="h-3 w-3" />
      </Button>
    </div>
  )
}
```

### Step 4: Mount in audio-sidebar.tsx footer
Add `<AlarmSettings />` below the master volume control in the sidebar footer, separated by a small divider.

### Step 5: Fix use-timer-engine.ts
Replace the hardcoded alarm block (L110-116):
```typescript
// BEFORE:
try {
  const audio = new Audio('/sounds/alarm.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
} catch {}

// AFTER:
try {
  const { alarmType, alarmVolume } = useAudioStore.getState().audioSettings
  const alarmEntry = soundCatalog.alarms?.find(a => a.id === alarmType)
  const alarmUrl = alarmEntry?.url || '/sounds/alarms/bell.mp3'
  const audio = new Audio(alarmUrl)
  audio.volume = Math.max(0.1, alarmVolume / 100) // minimum 10% so alarm is always audible
  audio.play().catch(() => {})
} catch {}
```

Add import at top:
```typescript
import { useAudioStore } from '@/stores/audio-store'
import { soundCatalog } from '@/lib/audio/sound-catalog'
```

> Note: `useAudioStore.getState()` is safe to call outside React (in the interval callback). This is a Zustand pattern for accessing store in non-component code.

### Step 6: Check Select component availability
Verify `src/components/ui/select.tsx` exists. If not:
```bash
npx shadcn-ui@latest add select
```

## Todo List
- [ ] Create `public/sounds/alarms/` directory
- [ ] Move/rename alarm.mp3 to alarms/bell.mp3
- [ ] Source 4 new alarm sound files
- [ ] Update sound-catalog alarm entries
- [ ] Create alarm-settings.tsx component
- [ ] Mount AlarmSettings in sidebar footer
- [ ] Fix use-timer-engine.ts alarm playback
- [ ] Add preview button functionality
- [ ] Verify Select component exists (install if needed)
- [ ] Test: timer completes -> correct alarm plays at correct volume
- [ ] Test: change alarm type, timer completes -> new alarm plays
- [ ] Build verification

## Success Criteria
1. Timer completion plays the user-selected alarm type
2. Alarm volume matches the user-configured level
3. All 5 alarm types play correctly
4. Preview button plays a short sample of selected alarm
5. Alarm works even when ambient is muted (minimum 10% volume)
6. Settings persist across page reloads

## Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| Missing alarm sound files at ship time | Medium | Use bell.mp3 as fallback for all; source files in Phase 7 polish |
| Path change breaks existing alarm | Low | Fallback URL hardcoded to `/sounds/alarms/bell.mp3` |
| Alarm not audible when system muted | Medium | Force minimum volume (10%); alarm bypasses mute intentionally |
| Select component not installed | Low | Check and install if missing |

## Next Steps
After this phase, proceed to [Phase 7: Polish & Sound Assets](./phase-07-polish-sound-assets.md).
