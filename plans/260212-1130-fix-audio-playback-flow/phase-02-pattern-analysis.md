# Phase 2: Pattern Analysis

> Parent: [plan.md](./plan.md)
> Dependencies: Phase 1 findings
> Docs: All audio files listed in plan.md

## Overview

- **Date**: 2026-02-12
- **Description**: Compare working vs broken flows, identify patterns across all audio panels
- **Priority**: P1
- **Status**: pending
- **Effort**: 0.5h

## Key Insights

### Working Flows (bypass fade)

| Flow | Entry Point | AudioManager Method | Uses Fade? |
|------|-------------|-------------------|------------|
| Ambient toggle | SoundListCategory -> store.toggleAmbient | audioManager.playAmbient() | NO |
| Ambient play | SoundListCategory slider drag | store.playAmbient(id, vol) | NO |
| Preset load | PresetChips -> store.loadPreset | store.playAmbient() per sound | NO |
| YouTube play | YouTubePane -> useYouTubePlayer.createOrUpdatePlayer | Direct YT.Player API | NO |

### Broken Flows (hit fade path)

| Flow | Entry Point | AudioManager Method | Uses Fade? |
|------|-------------|-------------------|------------|
| store.playAudio(source) | Any direct AudioSource play | audioManager.play() | YES - BUG |
| playAmbientSound() helper | audio-manager.ts L559 | audioManager.play() | YES - BUG (routes to playAmbient though) |
| playYouTube() helper | audio-manager.ts L576 | audioManager.play() | YES - BUG |

**Key pattern**: The store actions for ambient (playAmbient, toggleAmbient) call `audioManager.playAmbient()` directly, bypassing the broken `audioManager.play()`. This is why ambient sounds *might* still work.

BUT: `playAmbientSound()` helper (L559-574) calls `audioManager.play(source)` with `type: 'ambient'`, which routes to `playAmbient()` at L258. So the helper also works -- it just takes a detour through `play()` -> `playAmbient()`.

### State Synchronization Matrix

```
                        audio-store          AudioManager         Browser
                        (Zustand)            (Singleton)          (DOM)
                        -----------          -----------          ------
activeAmbientSounds     [{id, vol}...]       ambientPlayers Map   <audio> elements
currentlyPlaying        {type, id, ...}      currentSource        ---
masterVolume            audioSettings.mv     this.masterVolume    audio.volume
isMuted                 audioSettings.muted  this.isMuted         audio.volume=0
YouTube state           currentlyPlaying     currentPlayer        iframe / __globalYTPlayer
```

**Desync risk points**:
1. Store says playing, AudioManager has no player (post-cleanup)
2. AudioManager has player, store was cleared (persist hydration)
3. Two YouTube players: AudioManager.currentPlayer vs window.__globalYTPlayer

### YouTube Dual Player Analysis

AudioManager's `play()` for YouTube (L267-273):
- Creates `new YouTubePlayer(source)` as `this.currentPlayer`
- This uses `youtube-global-container` div
- Sets `this.currentSource`

useYouTubePlayer hook:
- Creates player via `new YT.Player(container, ...)`
- Stores on `window.__globalYTPlayer`
- Also uses `youtube-global-container` div
- Manages its own state via `useState`

**Conflict**: Both try to create a YT.Player on the SAME container div. The second creation would destroy the first or create a conflict. In practice, since all YouTube UI goes through `useYouTubePlayer`, the AudioManager YouTube path is likely **dead code** never reached from UI.

### XOR Mode Analysis

The `setActiveSource()` in audio-store (L495-504) is called when user switches tabs in AudioSidebar. It updates `audioSettings.activeSource` but does NOT:
- Stop ambient sounds when switching to YouTube
- Stop YouTube when switching to ambient
- The visual lockout in AmbientMixer (L70) only applies `pointer-events-none`

This means sounds from both sources can play simultaneously despite the XOR design intent.

## Requirements

- Map every UI entry point to its audio flow
- Identify which flows are broken vs working
- Document state sync gaps
- Determine dead code paths

## Architecture: Complete Flow Map

```
UI Entry Points                    Store Actions              AudioManager
-----------------                  -------------              ------------
SoundListCategory:
  icon click        ------>  toggleAmbient(id) ------>  playAmbient() / stopAmbient()
  slider drag       ------>  playAmbient(id,v) ------>  playAmbient()
                    ------>  setSoundVolume(id,v) --->  setAmbientVolume()

ActiveSoundCard:
  slider            ------>  setSoundVolume(id,v) --->  setAmbientVolume()
  X button          ------>  stopAmbient(id) -------->  stopAmbient()

PresetChips:
  chip click        ------>  loadPreset(preset) -----> stopAllAmbient() + playAmbient() x N
  "Stop All"        ------>  stopAllAmbient() -------> stopAllAmbient()

AudioSidebar:
  tab switch        ------>  setActiveSource() -------> (no AudioManager call)
  volume slider     ------>  updateVolume(v) ---------> setVolume()
  mute button       ------>  toggleMute() ----------->  setMute()

YouTubePane:
  suggestion click  ------>  (via hook) createOrUpdatePlayer() --> YT.Player API
  input play btn    ------>  (via hook) togglePlayback() -------> YT.Player API
  random btn        ------>  (via hook) createOrUpdatePlayer() --> YT.Player API

TimerSettingsDock:
  music btn         ------>  setAudioSettingsOpen(true) --> opens sidebar (no audio call)

togglePlayPause():            store.togglePlayPause() ------> audioManager.pause()/resume()
                              for YT: window.__globalYTPlayer.pauseVideo()
```

## Implementation Steps

### Step 1: Confirm ambient playback works
- [ ] Click any sound in SoundListCategory grid
- [ ] Verify audio plays from browser
- [ ] Check `activeAmbientSounds` in store devtools
- [ ] Check `audioManager.ambientPlayers` size

### Step 2: Test preset loading
- [ ] Click a preset chip (e.g. "Rain")
- [ ] Verify each sound in preset loads sequentially
- [ ] Check for error in console for missing sound files

### Step 3: Test YouTube flow
- [ ] Click a suggestion in YouTubePane
- [ ] Verify YouTube iframe appears (hidden div)
- [ ] Check `window.__globalYTPlayer` exists
- [ ] Check `audioManager.currentPlayer` (should be null -- YouTube managed by hook)

### Step 4: Test volume + mute propagation
- [ ] Play ambient sound, adjust master volume slider
- [ ] Verify actual audio volume changes
- [ ] Toggle mute, verify silence
- [ ] Check both audioManager.masterVolume and browser audio.volume

### Step 5: Test cleanup provider impact
- [ ] Open app, play a sound, navigate away and back
- [ ] Check if audio persists or gets killed
- [ ] Log AudioCleanupProvider mount timing

## Todo List

- [ ] Run through all 4 entry point flows with browser devtools open
- [ ] Catalog which flows succeed and which fail
- [ ] Verify YouTube is hook-only (AudioManager YT path = dead code)
- [ ] Check for 404s on sound file requests
- [ ] Document sync gaps between store and AudioManager

## Success Criteria

- Complete map of working vs broken flows
- Evidence-based categorization (not guessing)
- Clear pattern: "works when X, breaks when Y"
- Ready to form hypothesis in Phase 3

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Intermittent failures (race conditions) | High | Test multiple times, check timing |
| Browser caching hiding 404s | Low | Hard refresh + check Network tab |
| State devtools not reflecting latest | Low | Use store.getState() in console |

## Security Considerations

None. This is analysis-only phase.

## Next Steps

Findings feed into [Phase 3: Hypothesis & Testing](./phase-03-hypothesis-testing.md).
