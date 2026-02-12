---
title: "Fix Audio Playback Flow Issues"
description: "Debug and fix broken audio playback across all sound panels"
status: pending
priority: P1
effort: 4h
branch: feat/new-branding
tags: [bug-fix, audio, debugging, playback-flow]
created: 2026-02-12
---

# Fix Audio Playback Flow Issues

## Problem Statement

Audio playback flow broken after major refactor on `feat/new-branding`. Sounds not playing correctly when triggered from sound settings panels. Recent commits introduced: preset system, XOR exclusive mode, fade refactor, YouTube pane redesign, and `AudioCleanupProvider`.

## Architecture Overview

```
User Click
    |
    v
+-------------------+     +------------------+     +-------------------+
| UI Components     | --> | audio-store.ts   | --> | audio-manager.ts  |
| (sound-list-      |     | (Zustand + persist)|   | (Singleton class) |
|  category,        |     |                  |     |                   |
|  preset-chips,    |     | playAmbient()    |     | HTMLAudioPlayer   |
|  youtube-pane)    |     | toggleAmbient()  |     | YouTubePlayer     |
+-------------------+     | playAudio()      |     | ambientPlayers Map|
                          +------------------+     +-------------------+
                                                          |
                                                          v
                                                   HTMLAudioElement / YT.Player
```

### Dual YouTube Player Problem

**CRITICAL FINDING**: Two separate YouTube player implementations exist:

1. **AudioManager.YouTubePlayer** (audio-manager.ts L98-203) - Class-based, uses `youtube-global-container`
2. **useYouTubePlayer hook** (use-youtube-player.ts) - Hook-based, uses `__globalYTPlayer` on window

Both use the SAME container ID `youtube-global-container` but manage state independently. The `togglePlayPause` in audio-store references `window.__globalYTPlayer` (L406), which is set by the hook, not by AudioManager.

### AudioCleanupProvider Wipes Everything on Mount

`AudioCleanupProvider` calls `audioManager.globalAudioCleanup()` on mount, which:
- Stops all `<audio>` elements and removes them from DOM
- Removes all YouTube iframes
- Clears all internal AudioManager state (maps, players)

This runs BEFORE the Zustand store hydrates, creating a window where the store thinks sounds are playing but AudioManager has nothing.

## Identified Bug Candidates (7 issues)

### BUG-1: fadeIn passes normalized volume to setVolume which normalizes again (CRITICAL)

`AudioManager.fadeIn()` (L515-531) calculates `targetVolumeNormalized = targetVolume / 100`, then calls `player.setVolume(targetVolumeNormalized * progress)`. But `HTMLAudioPlayer.setVolume()` (L77-80) ALSO divides by 100: `this.audio.volume = volume / 100`. Result: volume is divided by 100 twice. A 50% volume becomes `0.5 * 0.5 / 100 = 0.0025` (effectively silent).

### BUG-2: fadeIn never calls play() on the player

`AudioManager.play()` (L282-286): when `fadeInMs > 0`, it calls `fadeIn()` which sets volume progressively but **never calls `player.play()`**. The `else` branch calls `player.play()`, but the fade branch skips it entirely. Sound never starts.

### BUG-3: AudioCleanupProvider kills audio on every page load

Runs `globalAudioCleanup()` on mount unconditionally. If user navigates within the app (Next.js client-side nav), the provider re-mounts and kills all active audio. Combined with Zustand `merge` clearing `activeAmbientSounds: []` on hydration, this creates phantom state.

### BUG-4: Dual YouTube player systems cause state desync

`AudioManager.play()` for YouTube creates its own `YouTubePlayer` instance. Meanwhile, `useYouTubePlayer` hook manages a completely separate global player via `window.__globalYTPlayer`. The `togglePlayPause` in audio-store (L403-425) looks for `window.__globalYTPlayer` which was set by the hook, not AudioManager. If audio was started via AudioManager, the toggle won't find the player.

### BUG-5: setSoundVolume(id, 0) stops sound, preventing volume restore

`audio-store.ts` L479: `if (clamped === 0) { get().stopAmbient(soundId); return; }`. User drags slider to 0 and the sound is removed from `activeAmbientSounds` entirely. No way to increase volume again without re-adding the sound.

### BUG-6: playAmbient default volume not propagated to slider UI

`toggleAmbient()` calls `playAmbient(soundId)` without volume arg, defaulting to 50. But `SoundListCategory` shows `volume = activeState?.volume ?? 0`. If slider was at 0 when user clicks icon, sound plays at 50 but slider snaps from 0 to 50 which is correct BUT if the sound was just stopped via setSoundVolume(0), re-toggling plays at 50 instead of the user's last volume.

### BUG-7: XOR mode (YouTube stops ambient) has incomplete implementation

`setActiveSource` in audio-store (L495-504) only updates the `activeSource` setting. It does NOT actually stop ambient sounds when switching to YouTube, nor stop YouTube when switching to ambient. The `AmbientMixer` adds `opacity-50 pointer-events-none` when YouTube is active (L70), but this is cosmetic only. Sounds that were playing continue.

## Phase Breakdown

| Phase | Focus | Effort | File |
|-------|-------|--------|------|
| 1 | Root Cause Investigation | 1h | phase-01-root-cause-investigation.md |
| 2 | Pattern Analysis | 0.5h | phase-02-pattern-analysis.md |
| 3 | Hypothesis & Testing | 1h | phase-03-hypothesis-testing.md |
| 4 | Implementation Fix | 1.5h | phase-04-implementation-fix.md |

## Fix Priority Order

1. **BUG-2** (fadeIn never plays) - Most likely root cause of "sounds not playing"
2. **BUG-1** (double volume normalization) - Sounds play but at near-zero volume
3. **BUG-3** (cleanup on mount) - Audio dies on navigation
4. **BUG-4** (dual YT players) - YouTube controls don't work
5. **BUG-5** (vol=0 removes sound) - UX issue with volume slider
6. **BUG-7** (XOR incomplete) - Feature incomplete
7. **BUG-6** (default volume) - Minor UX

## Related Files

| File | Role |
|------|------|
| `src/lib/audio/audio-manager.ts` | Core singleton, HTMLAudioPlayer, YouTubePlayer, fade logic |
| `src/stores/audio-store.ts` | Zustand store, all playback actions, persist config |
| `src/hooks/use-youtube-player.ts` | Second YT player system, global window state |
| `src/components/audio/sound-list-category.tsx` | Main UI for triggering ambient sounds |
| `src/components/audio/preset-chips.tsx` | Preset load/save UI |
| `src/components/audio/youtube/youtube-pane.tsx` | YouTube browsing and playback UI |
| `src/components/providers/audio-cleanup-provider.tsx` | Cleanup on mount |
| `src/components/providers/app-providers.tsx` | Provider tree (cleanup position) |
| `src/lib/audio/sound-catalog.ts` | Sound definitions, URLs |
| `src/data/sound-presets.ts` | Built-in presets |

## Unresolved Questions

1. Is `AudioManager.play()` for YouTube type ever called directly, or is all YouTube playback through `useYouTubePlayer` hook? If only hook is used, the AudioManager YouTube path is dead code.
2. Does the app use client-side navigation between pages that would re-mount `AudioCleanupProvider`?
3. Are the sound files in `/public/sounds/` actually present and working? Missing files would cause silent failures in `HTMLAudioElement.play()`.
4. Is `fadeInOut` setting from audio store ever passed to `AudioManager.setFadeSettings()`? Currently `fadeInMs`/`fadeOutMs` default to 300 in AudioManager, but the store has `fadeInOut: true` which is never wired to the manager.
