# Phase 1: Root Cause Investigation

> Parent: [plan.md](./plan.md)
> Dependencies: None
> Docs: src/lib/audio/audio-manager.ts, src/stores/audio-store.ts

## Overview

- **Date**: 2026-02-12
- **Description**: Systematically trace playback flow from UI click to audio output, identify where it breaks
- **Priority**: P1
- **Status**: pending
- **Effort**: 1h

## Key Insights

After thorough code review, **two critical bugs in `AudioManager.play()` L251-295** are the most likely root cause:

1. `fadeIn()` never calls `player.play()` -- sound is never started
2. `fadeIn()` double-normalizes volume -- even if played, volume ~0

The `fadeInMs` defaults to 300ms (L213), meaning the fade path is ALWAYS taken unless explicitly set to 0. The `audioSettings.fadeInOut` in the store (defaults `true`) is never wired to `AudioManager.setFadeSettings()`.

## Requirements

- Trace complete call chain: UI click -> store action -> AudioManager -> HTMLAudioElement
- Verify fade logic execution path
- Check if sound files are loadable
- Identify all breaking points

## Architecture: Ambient Playback Flow

```
SoundListCategory.toggleAmbient(soundId)
  -> audio-store.toggleAmbient(soundId)
    -> checks activeAmbientSounds, not found
    -> audio-store.playAmbient(soundId, 50)
      -> soundCatalog.ambient.find(soundId) -> SoundItem
      -> creates AudioSource { type: 'ambient', volume: 50, loop: true }
      -> audioManager.playAmbient(source)  [audio-manager.ts L419]
        -> creates HTMLAudioPlayer(effectiveSource)
        -> player.play()  [L440]
          -> new Audio(), sets src/loop/volume
          -> audio.play()
        -> ambientPlayers.set(soundId, player)
      -> returns true
    -> updates activeAmbientSounds, currentlyPlaying
```

**NOTE**: `playAmbient()` in AudioManager (L419-450) has its own path that does NOT go through the main `play()` method. It directly creates player and calls `player.play()`. This means **ambient sounds bypass the broken fade logic**. The bug in `play()` affects:
- YouTube playback via AudioManager (but this may be dead code)
- Any direct `audioManager.play()` calls for non-ambient sources

### Ambient-Specific Flow (Likely Working)

`audioManager.playAmbient()` at L419:
1. Checks if already in `ambientPlayers` map -> returns true (no-op)
2. Stores per-sound volume in `ambientVolumes`
3. Calculates effective volume: `(soundVol/100) * (masterVol/100) * 100`
4. Creates `HTMLAudioPlayer` with effective volume
5. Calls `player.play()` directly -- **NO fade involved**
6. Stores in `ambientPlayers` map

This path should work. If it doesn't, the issue is likely:
- Missing sound file (404)
- Browser autoplay policy blocking
- `AudioCleanupProvider` killing sounds right after creation

### Main play() Flow (Broken for non-ambient)

`audioManager.play()` at L251:
1. If YouTube, calls `this.stop()` (stops current main player, NOT ambients)
2. If ambient, redirects to `playAmbient()` -- working path
3. Creates player (HTMLAudioPlayer or YouTubePlayer)
4. Sets volume: `player.setVolume(this.isMuted ? 0 : this.masterVolume)` -- volume set correctly here
5. **If fadeInMs > 0** (always true, default 300):
   - Calls `this.fadeIn(player, this.masterVolume)` -- **BUG: never calls play()**
6. **Else**: calls `player.play()` -- would work, but never reached

## Implementation Steps

### Step 1: Verify ambient playback path works
- [ ] Add console.log in `audioManager.playAmbient()` before and after `player.play()`
- [ ] Click a sound in SoundListCategory
- [ ] Check if `player.play()` succeeds or throws
- [ ] Check browser console for autoplay policy errors
- [ ] Check Network tab for 404 on sound file

### Step 2: Verify the fade bug
- [ ] Add console.log at L282 (`if (this.fadeInMs > 0)`)
- [ ] Confirm fade path is taken (fadeInMs=300 by default)
- [ ] Add console.log inside fadeIn() to confirm play() is never called
- [ ] Test: temporarily set `this.fadeInMs = 0` and verify sounds work

### Step 3: Verify AudioCleanupProvider impact
- [ ] Add console.log in `AudioCleanupProvider` useEffect
- [ ] Check timing: does it run AFTER user clicks play?
- [ ] Check if navigating within app re-triggers cleanup
- [ ] Test: comment out AudioCleanupProvider, check if sounds work

### Step 4: Verify sound files exist
- [ ] Open browser, navigate to `/sounds/nature/campfire.mp3` directly
- [ ] Check if file loads (200 OK vs 404)
- [ ] Repeat for 2-3 other sound categories

### Step 5: Check YouTube path
- [ ] Determine if `audioManager.play()` with type='youtube' is ever called
- [ ] Search codebase for calls to `audioManager.play()` vs `createOrUpdatePlayer()`
- [ ] If only hook is used, AudioManager.YouTubePlayer is dead code

## Todo List

- [ ] Add debug logging to ambient playback chain
- [ ] Verify fade bug by setting fadeInMs=0 temporarily
- [ ] Test AudioCleanupProvider timing
- [ ] Verify sound file availability
- [ ] Determine if AudioManager YouTube path is dead code
- [ ] Document findings in Phase 2

## Success Criteria

- Root cause identified with evidence (console logs, network requests)
- Can articulate exactly which line(s) of code cause the failure
- Working vs broken paths clearly documented
- Hypothesis formed for Phase 3

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Multiple bugs masking each other | High | Test each path independently |
| Browser autoplay policy | Medium | Test with user interaction |
| Sound files missing | Medium | Check public/sounds/ directory |
| Zustand hydration race condition | Medium | Log timing of store hydration vs cleanup |

## Security Considerations

- No security concerns. All audio is local files or YouTube embeds.
- No user data exposed in debug logging (remove before commit).

## Next Steps

Findings feed into [Phase 2: Pattern Analysis](./phase-02-pattern-analysis.md).
