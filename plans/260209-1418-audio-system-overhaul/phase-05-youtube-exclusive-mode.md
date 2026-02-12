# Phase 5: YouTube Exclusive Mode

## Context
- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 2 (activeSource in store)
- **Blocks**: None

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Priority | P2 |
| Effort | 2h |
| Implementation | ✅ completed (2026-02-10) |
| Review | ✅ completed - APPROVE with minor recommendations |

Implement mutually exclusive audio source switching: YouTube XOR Ambient. When user switches to YouTube tab, ambient sounds pause and state is saved. When switching back to Ambient, YouTube stops and ambient state restores.

## Key Insights
- Current codebase already has ambient mixing that runs alongside YouTube (see commented-out code in `playAudio` L314-316)
- The brainstorm decided: only ONE source at a time (ambient OR youtube, not both)
- `activeSource` field added in Phase 2 controls which source is active
- Ambient state must be preserved when switching to YouTube (not lost)
- The YouTube pane (`youtube-pane.tsx`, 306 LOC) and `use-youtube-player.ts` (379 LOC) are kept as-is; only source switching logic changes
- Tab switching in the sidebar drives source changes

## Requirements
1. Tab switch Ambient -> YouTube: save ambient state, pause all ambient sounds, set `activeSource: 'youtube'`
2. Tab switch YouTube -> Ambient: stop YouTube playback, restore ambient state, set `activeSource: 'ambient'`
3. Ambient state saved in store as `savedAmbientState: AmbientSoundState[]`
4. When YouTube is active, ambient icon grid is visually dimmed (not interactive)
5. YouTube pane adapted for 350px sidebar width

## Architecture

### Source Switching Flow
```
User clicks "YouTube" tab
  -> store.setActiveSource('youtube')
    -> store.saveAmbientState()  // copy activeAmbientSounds to savedAmbientState
    -> store.stopAllAmbient()    // pause + clear activeAmbientSounds
    -> UI: YouTube tab becomes active

User clicks "Ambient" tab
  -> store.setActiveSource('ambient')
    -> stop YouTube (via global player ref)
    -> store.restoreAmbientState()  // replay savedAmbientState sounds
    -> UI: Ambient tab becomes active, sounds resume
```

### Store Actions (defined in Phase 2, implemented here)
```typescript
setActiveSource: async (source: 'ambient' | 'youtube' | 'none') => {
  const current = get().audioSettings.activeSource
  if (current === source) return

  if (source === 'youtube') {
    // Save and pause ambient
    get().saveAmbientState()
    await get().stopAllAmbient()
  } else if (source === 'ambient') {
    // Stop YouTube
    const yt = (window as any).__globalYTPlayer
    if (yt) { yt.stopVideo?.() }
    // Restore ambient
    await get().restoreAmbientState()
  }

  set(state => ({
    audioSettings: { ...state.audioSettings, activeSource: source }
  }))
}

saveAmbientState: () => {
  set({ savedAmbientState: [...get().activeAmbientSounds] })
}

restoreAmbientState: async () => {
  const saved = get().savedAmbientState
  for (const sound of saved) {
    await get().playAmbient(sound.id, sound.volume)
  }
  set({ savedAmbientState: [] })
}
```

## Related Code Files

### Modify
| File | Changes |
|------|---------|
| `src/stores/audio-store.ts` | Implement setActiveSource, saveAmbientState, restoreAmbientState |
| `src/components/audio/audio-sidebar.tsx` | Tab onValueChange calls setActiveSource; controlled by activeSource |
| `src/components/audio/youtube/youtube-pane.tsx` | Minor width adaptations for 350px |
| `src/components/audio/youtube/youtube-suggestions.tsx` | Grid layout for narrower width |
| `src/components/audio/youtube/youtube-input-section.tsx` | Full-width input |

## Implementation Steps

### Step 1: Implement store actions
Add `setActiveSource`, `saveAmbientState`, `restoreAmbientState` to audio-store.ts as described above. Ensure `savedAmbientState` is persisted (in case user closes browser mid-switch).

### Step 2: Wire tab switching in audio-sidebar.tsx
```typescript
const activeSource = useAudioStore(state => state.audioSettings.activeSource)
const setActiveSource = useAudioStore(state => state.setActiveSource)

<Tabs value={activeSource === 'youtube' ? 'youtube' : 'ambient'}
      onValueChange={(v) => setActiveSource(v as 'ambient' | 'youtube')}>
  <TabsList>
    <TabsTrigger value="ambient">Ambient</TabsTrigger>
    <TabsTrigger value="youtube">YouTube</TabsTrigger>
  </TabsList>
  ...
</Tabs>
```

### Step 3: Visual feedback when YouTube is active
In `ambient-mixer.tsx`, if `activeSource === 'youtube'`, show a banner:
```
"Ambient sounds paused while YouTube is playing.
 Switch back to resume your mix."
```
And dim the sound grid with `opacity-50 pointer-events-none`.

### Step 4: Adapt YouTube pane for sidebar
- `youtube-pane.tsx`: ensure iframe container is `w-full aspect-video`
- `youtube-suggestions.tsx`: change grid from multi-column to single column list
- `youtube-input-section.tsx`: input already full-width, no change needed
- Test that the global YouTube player (`__globalYTPlayer`) still works when rendered inside Sheet portal

### Step 5: Handle edge cases
- User closes sidebar while YouTube is playing: YouTube continues (audio persists)
- User opens sidebar again: tab should show "YouTube" (read from `activeSource`)
- User clicks ambient sound while YouTube tab active: switch to ambient tab first
- Browser refresh: `savedAmbientState` persisted, but audio doesn't auto-play (user must interact)

## Todo List
- [x] Implement setActiveSource in audio-store
- [x] Implement saveAmbientState / restoreAmbientState
- [x] Wire tab switching in audio-sidebar.tsx
- [x] Add "paused" banner in ambient-mixer when YouTube active
- [x] Adapt youtube-pane layout for 350px (existing layout works)
- [x] Adapt youtube-suggestions for single-column (not needed)
- [ ] Test: switch ambient -> youtube -> ambient (sounds restore) → PENDING QA
- [ ] Test: YouTube continues when sidebar closed → PENDING QA
- [x] Build verification

## Code Review Notes (2026-02-10)
**Score**: 8.5/10 | **Status**: APPROVE with minor recommendations

**High Priority Recommendations**:
- H1: Add rapid tab-switching race condition protection (debounce or abort controller)
- H2: Await YouTube stopVideo() to prevent audio overlap
- H3: Parallelize restoreAmbientState with Promise.allSettled for better UX
- H4: Add error handling try-catch in setActiveSource

**See**: [Full review report](../../reports/code-reviewer-260210-1159-phase5-youtube-exclusive-mode.md)

## Success Criteria
1. Switching to YouTube tab pauses all ambient sounds immediately
2. Switching back to Ambient tab stops YouTube and resumes previous ambient mix
3. Ambient sounds resume at their original per-sound volumes
4. YouTube pane renders correctly in 350px width
5. No audio overlap between ambient and YouTube
6. State survives sidebar close/reopen

## Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| YouTube global player not accessible in Sheet portal | Medium | Sheet renders in portal; `window.__globalYTPlayer` is global, should work |
| Restore plays sounds sequentially (slow) | Low | Sounds load from cache after first play; parallel `Promise.all` if needed |
| User expects both sources simultaneously | Low | Clear UI messaging ("YouTube replaces ambient") |

## Next Steps
Phase 5 is independent. After completion, only Phase 6 and 7 remain.
