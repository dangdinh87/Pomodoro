# Phase 3: Hypothesis & Testing

> Parent: [plan.md](./plan.md)
> Dependencies: Phase 1, Phase 2 findings
> Docs: src/lib/audio/audio-manager.ts (L251-295, L515-531)

## Overview

- **Date**: 2026-02-12
- **Description**: Form hypotheses from investigation, test each with minimal targeted changes
- **Priority**: P1
- **Status**: pending
- **Effort**: 1h

## Key Insights

Based on Phase 1-2 analysis, the primary hypothesis tree:

### Hypothesis A: fadeIn() never calls play() (HIGH confidence)

**Evidence**: `AudioManager.play()` L282-286:
```typescript
if (this.fadeInMs > 0) {
  await this.fadeIn(this.currentPlayer, this.masterVolume)
} else {
  await this.currentPlayer.play()  // <-- only play() call, never reached
}
```

`fadeIn()` L515-531 only adjusts volume via `player.setVolume()` using `requestAnimationFrame`. It never calls `player.play()`.

**Impact**: Any audio going through `audioManager.play()` with fadeInMs>0 (default 300) will never start.

**Test**: Set `this.fadeInMs = 0` in constructor, verify sound plays.

**Counter-evidence**: Ambient sounds use `audioManager.playAmbient()` which calls `player.play()` directly. So ambient may still work. The broken path primarily affects `store.playAudio()` and the helper functions.

### Hypothesis B: Double volume normalization silences audio (HIGH confidence)

**Evidence**: `fadeIn()` L517-528:
```typescript
const targetVolumeNormalized = targetVolume / 100  // e.g. 50 -> 0.5
// ...
player.setVolume(targetVolumeNormalized * progress) // e.g. 0.5 * 1.0 = 0.5
```

But `HTMLAudioPlayer.setVolume()` L77-80:
```typescript
setVolume(volume: number): void {
  if (this.audio) {
    this.audio.volume = Math.max(0, Math.min(1, volume / 100))  // 0.5 / 100 = 0.005
  }
}
```

Volume ends up at 0.005 instead of 0.5. Effectively silent.

**Impact**: Even if Hypothesis A were fixed (play() called before fade), the volume during and after fade would be near-zero.

**Test**: Fix the double normalization, check if volume is correct.

### Hypothesis C: AudioCleanupProvider kills audio on navigation (MEDIUM confidence)

**Evidence**: `AudioCleanupProvider` runs `audioManager.globalAudioCleanup()` in `useEffect` on mount. Located in `AppProviders` which wraps the main app section.

**Impact**: If Next.js remounts the provider tree during client-side navigation (unlikely but possible during layout changes), all audio dies.

**Test**: Add `console.log` with timestamp in cleanup provider. Navigate around. Check if it fires multiple times.

### Hypothesis D: Missing sound files cause silent failures (LOW-MEDIUM confidence)

**Evidence**: `sound-presets.ts` comment (L7): "Some presets reference sounds with placeholder files (coffee-shop, library, cat-purring, brown-noise)."

The `HTMLAudioPlayer.play()` sets `audio.src` and calls `audio.play()`. If the file 404s, `play()` rejects the promise. The error is caught in `playAmbient()` (L447) but only logged.

**Test**: Check `/public/sounds/` directory for all referenced files.

### Hypothesis E: Zustand persist hydration race (LOW confidence)

**Evidence**: Store `merge` function forces `activeAmbientSounds: []` on hydration (L718). But the store also doesn't persist `activeAmbientSounds` (L706, commented out). So on reload, both store and AudioManager are empty -- consistent state.

**Test**: Only relevant if sounds stop after a full page reload when they were playing before. Not related to "sounds not playing when triggered."

## Requirements

- Test each hypothesis independently
- Minimal code changes per test
- Collect evidence (console output, network tab)
- Confirm or reject each hypothesis

## Architecture: Fix Points

```
AudioManager.play() [L251]
  |
  +--> type === 'ambient' --> playAmbient() --> player.play() [WORKS]
  |
  +--> type === 'youtube' or other
       |
       +--> creates player
       +--> player.setVolume(masterVolume) [OK here, not double-normalized]
       |
       +--> fadeInMs > 0 (ALWAYS TRUE, default 300)
       |    |
       |    +--> fadeIn(player, masterVolume) [BUG: no play() call]
       |         |
       |         +--> player.setVolume(vol/100 * progress) [BUG: double normalize]
       |
       +--> fadeInMs === 0 (NEVER REACHED)
            |
            +--> player.play() [this is the only play() call]
```

## Implementation Steps

### Test A: Confirm fadeIn missing play()
- [ ] In audio-manager.ts L282, add before fadeIn: `await this.currentPlayer.play()`
- [ ] Test by calling `audioManager.play()` for a non-ambient source
- [ ] If sound plays: Hypothesis A confirmed

### Test B: Confirm double volume normalization
- [ ] In fadeIn() L517, change to: `const targetVolumeNormalized = targetVolume` (don't divide by 100)
- [ ] OR in fadeIn() L523, change to: `player.setVolume(targetVolumeNormalized * progress * 100)`
- [ ] Check actual `audio.volume` value in browser devtools
- [ ] If volume is correct (0.5 for 50%): Hypothesis B confirmed

### Test C: Confirm cleanup impact
- [ ] Add to AudioCleanupProvider useEffect: `console.log('[AudioCleanup] mount', new Date().toISOString())`
- [ ] Play a sound, then navigate within app
- [ ] If log fires again and audio stops: Hypothesis C confirmed
- [ ] Alternative: temporarily comment out the provider in app-providers.tsx

### Test D: Confirm sound files exist
- [ ] `ls /Users/nguyendangdinh/Personal/Pomodoro/public/sounds/` (check directory structure)
- [ ] Try loading a specific file in browser: `http://localhost:3000/sounds/nature/campfire.mp3`
- [ ] Check for 404s in browser Network tab during playback

### Test E: Verify store hydration (optional)
- [ ] Only if Tests A-D don't explain the issue
- [ ] Check React DevTools for Zustand store state
- [ ] Verify `activeAmbientSounds` matches `audioManager.ambientPlayers`

## Todo List

- [ ] Test Hypothesis A (add play() call before fadeIn)
- [ ] Test Hypothesis B (fix volume normalization)
- [ ] Test Hypothesis C (log cleanup timing)
- [ ] Test Hypothesis D (verify sound files)
- [ ] Document which hypotheses confirmed/rejected
- [ ] Determine fix combination needed

## Success Criteria

- At least one hypothesis confirmed with clear evidence
- Can reproduce the fix consistently
- Understand if multiple bugs compound (likely A + B)
- Ready for implementation in Phase 4

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Fix A but B still silences | High | Test both together |
| Cleanup provider needed for real bugs | Medium | Don't remove, improve with guards |
| Breaking YouTube by fixing AudioManager | Medium | Test YT separately after fixes |

## Security Considerations

None. Debug-only changes, all reverted before final fix.

## Next Steps

Confirmed fixes feed into [Phase 4: Implementation Fix](./phase-04-implementation-fix.md).
