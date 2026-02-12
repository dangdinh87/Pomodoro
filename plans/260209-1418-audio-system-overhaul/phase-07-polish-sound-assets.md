# Phase 7: Polish & Sound Assets

## Context
- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: All previous phases (1-6)
- **Blocks**: None (final phase)

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Priority | P2 |
| Effort | 3h |
| Implementation | pending |
| Review | pending |

Final polish: add fade in/out effects, source new ambient sounds, remove deprecated sound files, test looping, mobile testing, and end-to-end QA.

## Key Insights
- Current fade in AudioManager uses `setTimeout` chain (L705-729) -- should use `requestAnimationFrame` per research
- 14 sound files to delete from `public/sounds/`
- ~10 new sounds to source: noise colors (3), ASMR/cozy (4-5), study rooms (3)
- New sounds need proper looping: export with crossfade overlap at start/end
- Mobile testing critical: Sheet fullscreen, touch sliders, audio autoplay restrictions

## Requirements
1. Replace fade implementation with requestAnimationFrame approach
2. Source/download ~10 new ambient sound files
3. Delete 14 deprecated sound files
4. Add new sound entries to sound-catalog.ts
5. Reorganize `public/sounds/` directory structure to match new categories
6. Test all sounds loop seamlessly
7. Mobile responsiveness testing
8. Full end-to-end QA

## Architecture

### Fade Implementation (requestAnimationFrame)
Replace current fadeIn/fadeOut in AudioManager:
```typescript
private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration = 300): void {
  audio.volume = 0
  audio.play()
  const startTime = performance.now()
  const fade = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    audio.volume = targetVolume * progress
    if (progress < 1) requestAnimationFrame(fade)
  }
  requestAnimationFrame(fade)
}

private fadeOut(audio: HTMLAudioElement, duration = 300): Promise<void> {
  return new Promise(resolve => {
    const startVolume = audio.volume
    const startTime = performance.now()
    const fade = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      audio.volume = startVolume * (1 - progress)
      if (progress < 1) {
        requestAnimationFrame(fade)
      } else {
        audio.pause()
        audio.currentTime = 0
        resolve()
      }
    }
    requestAnimationFrame(fade)
  })
}
```

### New Sound Files to Source
| ID | Category | File Path | Source |
|----|----------|-----------|--------|
| white-noise | noise | `/sounds/noise/white-noise.mp3` | Generate (audacity) or freesound.org |
| brown-noise | noise | `/sounds/noise/brown-noise.mp3` | Generate or freesound.org |
| pink-noise | noise | `/sounds/noise/pink-noise.mp3` | Generate or freesound.org |
| birds | nature | `/sounds/nature/birds.mp3` | freesound.org (CC0) |
| night-crickets | nature | `/sounds/nature/night-crickets.mp3` | freesound.org (CC0) |
| cat-purring | cozy | `/sounds/cozy/cat-purring.mp3` | freesound.org (CC0) |
| fireplace | nature | `/sounds/nature/fireplace.mp3` | freesound.org (CC0) |
| library | study | `/sounds/study/library.mp3` | freesound.org (CC0) |
| coffee-shop | study | `/sounds/study/coffee-shop.mp3` | freesound.org (CC0) |
| coworking | study | `/sounds/study/coworking.mp3` | freesound.org (CC0) |

### Sound Files to Delete (14)
| File | Reason |
|------|--------|
| `public/sounds/nature/walk-in-snow.mp3` | Not ambient |
| `public/sounds/nature/walk-on-gravel.mp3` | Not ambient |
| `public/sounds/nature/walk-on-leaves.mp3` | Not ambient |
| `public/sounds/nature/howling-wind.mp3` | Too aggressive |
| `public/sounds/things/boiling-water.mp3` | Not relaxing |
| `public/sounds/things/bubbles.mp3` | Not relaxing |
| `public/sounds/things/paper.mp3` | Not ambient |
| `public/sounds/things/tuning-radio.mp3` | Distracting |
| `public/sounds/things/washing-machine.mp3` | Not relaxing |
| `public/sounds/rain/rain-on-car-roof.mp3` | Redundant |
| `public/sounds/rain/rain-on-tent.mp3` | Redundant |
| `public/sounds/rain/rain-on-umbrella.mp3` | Redundant |
| `public/sounds/transport/rowing-boat.mp3` | Too niche |
| `public/sounds/transport/sailboat.mp3` | Redundant with waves+wind |

### Directory Reorganization
```
public/sounds/
  alarms/       bell.mp3, chime.mp3, gong.mp3, digital.mp3, soft.mp3
  nature/       campfire.mp3, droplets.mp3, river.mp3, waves.mp3, wind-in-trees.mp3, wind.mp3, birds.mp3, night-crickets.mp3, fireplace.mp3
  rain/         heavy-rain.mp3, light-rain.mp3, rain-on-leaves.mp3, rain-on-window.mp3, thunder.mp3
  noise/        white-noise.mp3, brown-noise.mp3, pink-noise.mp3
  study/        library.mp3, coffee-shop.mp3, coworking.mp3
  cozy/         cat-purring.mp3, vinyl-effect.mp3, singing-bowl.mp3, wind-chimes.mp3, clock.mp3
  transport/    airplane.mp3, inside-a-train.mp3, submarine.mp3, train.mp3
  city/         busy-street.mp3, crowd.mp3, traffic.mp3
  machine/      ceiling-fan.mp3, keyboard.mp3, typewriter.mp3
```

> Note: Some sounds move folders (e.g., clock from things/ to cozy/, keyboard from things/ to machine/). Update URLs in sound-catalog.ts accordingly.

## Related Code Files

### Modify
| File | Changes |
|------|---------|
| `src/lib/audio/audio-manager.ts` | Replace fade methods with rAF implementation |
| `src/lib/audio/sound-catalog.ts` | Add new sound entries, update moved file URLs |

### Delete
14 sound files listed above.

### Create
~10 new sound files + new directories (noise/, study/, cozy/, city/, machine/).

## Implementation Steps

### Step 1: Refactor fade methods in AudioManager
1. Replace `fadeIn()` method with requestAnimationFrame version
2. Replace `fadeOut()` method with requestAnimationFrame version (returns Promise)
3. Remove `delay()` helper method
4. Apply fade to ambient sound start/stop (in `playAmbient` and `stopAmbient`)
5. Respect `fadeInOut` setting from store: skip fade if disabled

### Step 2: Delete deprecated sound files
```bash
rm public/sounds/nature/walk-in-snow.mp3
rm public/sounds/nature/walk-on-gravel.mp3
rm public/sounds/nature/walk-on-leaves.mp3
rm public/sounds/nature/howling-wind.mp3
rm public/sounds/things/boiling-water.mp3
rm public/sounds/things/bubbles.mp3
rm public/sounds/things/paper.mp3
rm public/sounds/things/tuning-radio.mp3
rm public/sounds/things/washing-machine.mp3
rm public/sounds/rain/rain-on-car-roof.mp3
rm public/sounds/rain/rain-on-tent.mp3
rm public/sounds/rain/rain-on-umbrella.mp3
rm public/sounds/transport/rowing-boat.mp3
rm public/sounds/transport/sailboat.mp3
```

### Step 3: Create new directory structure
```bash
mkdir -p public/sounds/{alarms,noise,study,cozy,city,machine}
```

### Step 4: Move sounds to new category directories
```bash
# Things -> appropriate categories
mv public/sounds/things/clock.mp3 public/sounds/cozy/
mv public/sounds/things/keyboard.mp3 public/sounds/machine/
mv public/sounds/things/typewriter.mp3 public/sounds/machine/
mv public/sounds/things/ceiling-fan.mp3 public/sounds/machine/
mv public/sounds/things/singing-bowl.mp3 public/sounds/cozy/
mv public/sounds/things/vinyl-effect.mp3 public/sounds/cozy/
mv public/sounds/things/wind-chimes.mp3 public/sounds/cozy/
# Urban -> city
mv public/sounds/urban/busy-street.mp3 public/sounds/city/
mv public/sounds/urban/crowd.mp3 public/sounds/city/
mv public/sounds/urban/traffic.mp3 public/sounds/city/
# Remove redundant urban sounds
rm public/sounds/urban/highway.mp3
rm public/sounds/urban/road.mp3
```

### Step 5: Source new sound files
1. **Noise colors** (white, brown, pink): Generate using Audacity (3-5 min loops, exported as MP3 192kbps) or download from freesound.org
2. **Nature**: birds.mp3, night-crickets.mp3, fireplace.mp3 from freesound.org (CC0)
3. **Study rooms**: library.mp3, coffee-shop.mp3, coworking.mp3 from freesound.org (CC0)
4. **Cozy**: cat-purring.mp3 from freesound.org (CC0)
5. All files: normalize volume, ensure seamless loop, 30-60 second duration, MP3 128-192kbps

### Step 6: Update sound-catalog.ts URLs
Update all `url` fields to match new directory structure. Add entries for new sounds.

### Step 7: Remove empty directories
```bash
rmdir public/sounds/things/ public/sounds/urban/ 2>/dev/null || true
```

### Step 8: Mobile testing checklist
- [ ] Sidebar opens as fullscreen on mobile (<md breakpoint)
- [ ] Volume sliders are touch-friendly (44px min touch target)
- [ ] Scroll works inside sidebar content
- [ ] Sound plays on first tap (iOS autoplay requires user gesture)
- [ ] Closing sidebar via swipe or X button
- [ ] No layout shift when sidebar opens/closes

### Step 9: End-to-end QA
- [ ] Fresh user: no localStorage, app loads, defaults work
- [ ] Existing user: v2 localStorage migrates to v3 cleanly
- [ ] Play 5 sounds simultaneously: no lag, individual volumes correct
- [ ] Switch ambient -> YouTube -> ambient: state preserved
- [ ] Load preset: correct sounds at correct volumes
- [ ] Save preset: appears in chips, persists on reload
- [ ] Timer completes: correct alarm at correct volume
- [ ] All 37 ambient sounds: play, loop, stop, volume control
- [ ] Fade in/out: smooth 300ms transition on play/stop
- [ ] Master volume: affects all sounds proportionally
- [ ] Mute: silences everything, unmute restores

## Todo List
- [ ] Refactor fade to requestAnimationFrame
- [ ] Delete 14+2 deprecated sound files
- [ ] Create new directory structure
- [ ] Move sounds to new category directories
- [ ] Source ~10 new ambient sound files
- [ ] Add new sounds to sound-catalog.ts
- [ ] Update all sound URLs for moved files
- [ ] Clean up empty directories
- [ ] Mobile testing
- [ ] End-to-end QA
- [ ] Final build verification

## Success Criteria
1. All ~37 ambient sounds play and loop without perceivable gaps
2. Fade in/out is smooth (no stepping artifacts)
3. No 404s for any sound URL
4. Mobile UX works on iOS Safari and Chrome Android
5. `next build` passes with zero errors
6. Total sound assets size is reasonable (<50MB)
7. All QA checklist items pass

## Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| Sound sourcing takes time (licensing) | Medium | Use CC0 only; freesound.org has vast CC0 library |
| New sounds don't loop well | Medium | Use Audacity crossfade at loop points; test each sound |
| Directory restructure breaks deployed URLs | Low | This is pre-release; no existing deployed links |
| Mobile autoplay restrictions | Medium | Require user gesture (tap) before first play; browser standard |

## Next Steps
This is the final phase. After completion, the audio system overhaul is ready for review and merge.
