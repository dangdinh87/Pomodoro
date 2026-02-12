# Phase 4: Implementation Fix

> Parent: [plan.md](./plan.md)
> Dependencies: Phase 3 confirmed hypotheses
> Docs: src/lib/audio/audio-manager.ts, src/stores/audio-store.ts, src/components/providers/audio-cleanup-provider.tsx

## Overview

- **Date**: 2026-02-12
- **Description**: Implement fixes for confirmed bugs, verify across all audio panels
- **Priority**: P1
- **Status**: pending
- **Effort**: 1.5h

## Key Insights

Fixes ordered by severity. Each fix is independent and can be applied incrementally.

## Requirements

- Fix root cause, not symptoms
- Each fix must not break other audio flows
- Maintain backward compatibility with persisted Zustand state
- All fixes in existing files (no new files needed)

## Architecture: Post-Fix Flow

```
AudioManager.play()
  |
  +--> type === 'ambient' --> playAmbient() --> player.play() [unchanged, works]
  |
  +--> type === 'youtube' or other
       |
       +--> creates player
       +--> player.setVolume(masterVolume)
       |
       +--> await player.play()          <-- FIX: always call play() first
       |
       +--> fadeInMs > 0
       |    +--> fadeIn(player, masterVolume)
       |         +--> player.setVolume(volume * progress)  <-- FIX: correct normalization
       |
       +--> fadeInMs === 0 (no-op, already playing)
```

## Implementation Steps

### Fix 1: fadeIn() must call play() first (BUG-2) -- CRITICAL

**File**: `src/lib/audio/audio-manager.ts`
**Lines**: L278-286

**Current**:
```typescript
// Apply current settings
this.currentPlayer.setVolume(this.isMuted ? 0 : this.masterVolume)

// Play with fade in if enabled
if (this.fadeInMs > 0) {
  await this.fadeIn(this.currentPlayer, this.masterVolume)
} else {
  await this.currentPlayer.play()
}
```

**Fixed**:
```typescript
// Start playback first (required before any volume manipulation)
this.currentPlayer.setVolume(this.isMuted ? 0 : 0) // start silent for fade
await this.currentPlayer.play()

// Apply fade or set final volume
if (this.fadeInMs > 0 && !this.isMuted) {
  await this.fadeIn(this.currentPlayer, this.masterVolume)
} else {
  this.currentPlayer.setVolume(this.isMuted ? 0 : this.masterVolume)
}
```

**Rationale**: HTMLAudioElement must be playing before volume animation makes sense. Start silent, then fade up.

### Fix 2: Fix double volume normalization in fadeIn() (BUG-1) -- CRITICAL

**File**: `src/lib/audio/audio-manager.ts`
**Lines**: L515-531

**Current**:
```typescript
private fadeIn(player: AudioPlayer, targetVolume: number): Promise<void> {
  return new Promise(resolve => {
    const targetVolumeNormalized = targetVolume / 100  // 50 -> 0.5
    const startTime = performance.now()
    const fade = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / this.fadeInMs, 1)
      player.setVolume(targetVolumeNormalized * progress) // 0.5 * 1.0 = 0.5, then setVolume divides by 100 again!
      if (progress < 1) {
        requestAnimationFrame(fade)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(fade)
  })
}
```

**Fixed**:
```typescript
private fadeIn(player: AudioPlayer, targetVolume: number): Promise<void> {
  return new Promise(resolve => {
    const startTime = performance.now()
    const fade = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / this.fadeInMs, 1)
      player.setVolume(targetVolume * progress)  // pass 0-100 scale, setVolume handles normalization
      if (progress < 1) {
        requestAnimationFrame(fade)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(fade)
  })
}
```

**Rationale**: `setVolume()` already normalizes from 0-100 to 0-1. Pass raw 0-100 scale values.

### Fix 3: Same bug in fadeOut() (BUG-1 variant)

**File**: `src/lib/audio/audio-manager.ts`
**Lines**: L534-550

**Current**:
```typescript
private fadeOut(player: AudioPlayer, durationMs: number): Promise<void> {
  return new Promise(resolve => {
    const startVolume = this.masterVolume / 100  // double normalization
    // ...
    player.setVolume(startVolume * (1 - progress))  // passes ~0.5, then /100 again
```

**Fixed**:
```typescript
private fadeOut(player: AudioPlayer, durationMs: number): Promise<void> {
  return new Promise(resolve => {
    const startVolume = this.masterVolume  // keep in 0-100 scale
    const startTime = performance.now()
    const fade = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      player.setVolume(startVolume * (1 - progress))  // pass 0-100 scale
      if (progress < 1) {
        requestAnimationFrame(fade)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(fade)
  })
}
```

### Fix 4: Improve AudioCleanupProvider (BUG-3) -- MODERATE

**File**: `src/components/providers/audio-cleanup-provider.tsx`

**Current**: Unconditionally cleans up all audio on mount.

**Fixed approach**: Only clean up orphaned elements, not managed ones.

```typescript
export function AudioCleanupProvider() {
  useEffect(() => {
    // Only clean up orphaned audio elements (from previous sessions)
    // Don't use globalAudioCleanup() as it destroys AudioManager state
    const orphanedAudios = document.querySelectorAll('audio:not([data-managed])');
    orphanedAudios.forEach(audio => {
      (audio as HTMLAudioElement).pause();
      audio.remove();
    });

    // Clean orphaned YouTube iframes only if AudioManager has no active YouTube
    if (!audioManager.getCurrentSource() || audioManager.getCurrentSource()?.type !== 'youtube') {
      const ytIframes = document.querySelectorAll('iframe[src*="youtube.com"]');
      ytIframes.forEach(iframe => iframe.remove());
    }
  }, []);

  return null;
}
```

**Alternative simpler approach**: Just remove the provider entirely. The Zustand store already clears `activeAmbientSounds` on hydration, and AudioManager resets on page reload naturally.

### Fix 5: Mark managed audio elements (Defense-in-depth)

**File**: `src/lib/audio/audio-manager.ts`
**Lines**: L52-53 (HTMLAudioPlayer.play())

**Add** after creating Audio element:
```typescript
this.audio = new Audio()
this.audio.setAttribute('data-managed', 'true')  // mark as managed
```

This prevents AudioCleanupProvider from destroying active audio elements.

### Fix 6: Wire fadeInOut setting to AudioManager (Optional enhancement)

**File**: `src/stores/audio-store.ts`

Currently `audioSettings.fadeInOut` is stored but never used. Wire it:

In `playAmbient` or anywhere AudioManager is initialized:
```typescript
// In updateAudioSettings or a useEffect
if (audioSettings.fadeInOut) {
  audioManager.setFadeSettings(300, 300)
} else {
  audioManager.setFadeSettings(0, 0)
}
```

### Fix 7: setSoundVolume(id, 0) should mute, not remove (BUG-5) -- LOW

**File**: `src/stores/audio-store.ts` L478-481

**Current**:
```typescript
if (clamped === 0) {
  get().stopAmbient(soundId);
  return;
}
```

**Fixed**: Set volume to 0 (mute) but keep in active list. Or set a minimum volume of 1:
```typescript
// Option A: Allow volume=0 as mute (keep in list, just silence)
if (clamped === 0) {
  audioManager.setAmbientVolume(soundId, 0);
  const updated = activeAmbientSounds.map((s) =>
    s.id === soundId ? { ...s, volume: 0 } : s,
  );
  set({ activeAmbientSounds: updated });
  return;
}

// Option B: Simpler - just enforce minimum of 1
const clamped = Math.max(1, Math.min(100, volume));
```

Recommend **Option A** for better UX. User can mute individual sounds without losing them.

## Todo List

- [ ] Apply Fix 1 (play before fade) in audio-manager.ts
- [ ] Apply Fix 2 (fadeIn volume) in audio-manager.ts
- [ ] Apply Fix 3 (fadeOut volume) in audio-manager.ts
- [ ] Apply Fix 4 (cleanup provider) or remove it
- [ ] Apply Fix 5 (data-managed attribute) in audio-manager.ts
- [ ] Test ambient: click sound in SoundListCategory
- [ ] Test ambient: drag slider from 0 on inactive sound
- [ ] Test ambient: load preset (Rain, Forest, etc.)
- [ ] Test YouTube: click suggestion, toggle play/pause
- [ ] Test volume: master volume slider, individual sound sliders
- [ ] Test mute: toggle mute button
- [ ] Test cleanup: refresh page, navigate, check no phantom audio
- [ ] Test XOR: play ambient, switch to YouTube tab, verify behavior
- [ ] Remove all debug console.logs
- [ ] Optional: Apply Fix 6 (wire fadeInOut)
- [ ] Optional: Apply Fix 7 (volume=0 behavior)

## Success Criteria

- All ambient sounds play when clicked from SoundListCategory
- Preset loading plays all sounds in the preset
- Volume sliders correctly control individual and master volume
- YouTube playback works via suggestion list and URL input
- Mute toggles work globally
- No phantom audio after page reload
- No console errors during normal playback operations
- Fade in/out produces audible smooth transitions

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Fix 1 + Fix 2 interaction | Medium | Test together, fade should work end-to-end |
| Removing cleanup causes phantom audio | Medium | Keep Fix 5 (data-managed) as safety net |
| Fix 7 changes preset comparison logic | Low | PresetChips `isPresetActive()` checks volume match; vol=0 sounds would affect comparison |
| Browser autoplay policy blocks play() | Medium | play() is always triggered by user click (event chain from UI), should be fine |

## Security Considerations

- No security impact. All changes are audio playback logic.
- Ensure no debug logs left in production code.

## Verification Checklist

After all fixes applied, run through:

1. **Fresh load**: Open app, no audio playing, no console errors
2. **Single ambient**: Click campfire -> hear fire -> click again -> stops
3. **Multiple ambient**: Click campfire + rain -> both play -> "Stop All" -> silence
4. **Volume**: Drag individual slider -> volume changes smoothly
5. **Master volume**: Drag bottom slider -> all sounds adjust proportionally
6. **Mute**: Click mute -> all silent -> unmute -> all resume at previous volume
7. **Preset**: Click "Rain" preset -> thunder + light rain play -> click again -> stops
8. **YouTube**: Click a suggestion -> video plays in background -> pause/play works
9. **Tab switch**: Switch ambient <-> YouTube tab -> previous source behavior correct
10. **Page reload**: Reload page -> no phantom audio, clean state

## Next Steps

After fixes verified:
- Remove any remaining debug logging
- Consider writing unit tests for AudioManager.play() and fade logic
- Consider removing dead code (AudioManager.YouTubePlayer class if hook handles all YT)
