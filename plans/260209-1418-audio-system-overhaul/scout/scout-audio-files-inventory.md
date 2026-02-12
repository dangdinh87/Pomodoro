# Audio System Files Inventory
**Generated:** 2026-02-09 | **Codebase:** Study Bro (Pomodoro)

---

## Summary
- **Total Audio Files:** 42
- **Total Lines of Code:** 5,893 LOC
- **Audio Components:** 8 | **Stores:** 2 | **Hooks:** 2 | **Utilities:** 2
- **Spotify API Routes:** 11 | **Sound Assets:** 44 MP3 files

---

## Audio Components

| File | Lines | Summary |
|------|-------|---------|
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/audio/spotify/spotify-pane.tsx` | 172 | Main Spotify playback UI with playlist input, quick suggestions, and embed player integration |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/audio/spotify/spotify-playlist-list.tsx` | 134 | Playlist grid display with thumbnail, owner, track count, and active state indicators |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/audio/youtube/youtube-pane.tsx` | 306 | YouTube playback UI with video input, player state sync, and error handling |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/audio/youtube/youtube-suggestions.tsx` | 123 | Suggested YouTube videos/playlists with category chips and playback buttons |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/audio/youtube/youtube-input-section.tsx` | 77 | URL input field for YouTube videos with validation and play button |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/audio/youtube/index.ts` | 1 | Barrel export for YouTubeInputSection component |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/audio/spotify/spotify-embed.tsx` | 67 | Spotify embed container with loading state and documentation link |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/audio/spotify/spotify-input-section.tsx` | 47 | Spotify URL input with paste-and-play functionality |

---

## State Management

| File | Lines | Summary |
|------|-------|---------|
| `/Users/nguyendangdinh/Personal/Pomodoro/src/stores/audio-store.ts` | 511 | Zustand store: manages playing audio, settings, favorites, recently played, ambient mixing (batched updates, persistence) |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/stores/system-store.ts` | 108 | System-level store (unrelated to audio; included for reference) |

---

## Audio Utilities & Libraries

| File | Lines | Summary |
|------|-------|---------|
| `/Users/nguyendangdinh/Personal/Pomodoro/src/lib/audio/audio-manager.ts` | 800 | Core audio engine: HTMLAudioPlayer, YouTubePlayer, SpotifyPlayer classes, ambient mixing, volume/mute, fade in/out |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/lib/audio/sound-catalog.ts` | 92 | Centralized sound metadata catalog (alarms, ticks, ambient sounds) with i18n labels (en/vi) |

---

## Custom Hooks

| File | Lines | Summary |
|------|-------|---------|
| `/Users/nguyendangdinh/Personal/Pomodoro/src/hooks/use-spotify-player.ts` | 164 | Spotify iframe API wrapper: playlist loading, playback control, event listeners, theme sync |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/hooks/use-youtube-player.ts` | 379 | YouTube IFrame API wrapper: video/playlist loading, playback state, queue management, event handlers |

---

## Settings & UI Integration

| File | Lines | Summary |
|------|-------|---------|
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/settings/audio-settings-modal.tsx` | 524 | Audio settings UI: volume, mute, notification sounds, ambient selection, fade in/out toggle |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/settings/settings-modal.tsx` | 51 | Settings wrapper/coordinator (minimal audio content) |

---

## Timer Integration

| File | Lines | Summary |
|------|-------|---------|
| `/Users/nguyendangdinh/Personal/Pomodoro/src/app/(main)/timer/components/timer-settings-dock.tsx` | 209 | Timer dock: audio player controls, sound selection, timer configuration |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/app/(main)/timer/hooks/use-timer-engine.ts` | 261 | Timer logic: countdown, completion triggers, audio cue integration |

---

## Data & Suggestions

| File | Lines | Summary |
|------|-------|---------|
| `/Users/nguyendangdinh/Personal/Pomodoro/src/data/youtube-suggestions.ts` | 145 | Predefined YouTube suggestions: study playlists, lofi beats, focus music |

---

## UI Components (shadcn/ui)

| File | Lines | Status |
|------|-------|---------|
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/ui/sheet.tsx` | 140 | ✓ Exists - Sheet/sidebar component for audio panels |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/ui/slider.tsx` | 27 | ✓ Exists - Volume slider control |
| `/Users/nguyendangdinh/Personal/Pomodoro/src/components/ui/drawer.tsx` | — | ✗ NOT FOUND - Can be imported from shadcn if needed |

---

## Spotify API Routes (11 files, 545 total LOC)

| Route | Purpose |
|-------|---------|
| `src/app/api/spotify/login/route.ts` | OAuth2 redirect to Spotify auth |
| `src/app/api/spotify/callback/route.ts` | OAuth2 callback handler, token exchange |
| `src/app/api/spotify/logout/route.ts` | Session cleanup, token revocation |
| `src/app/api/spotify/playlists/route.ts` | Fetch user playlists |
| `src/app/api/spotify/devices/route.ts` | List available playback devices |
| `src/app/api/spotify/status/route.ts` | Get playback state |
| `src/app/api/spotify/play/route.ts` | Play/resume track |
| `src/app/api/spotify/play-track/route.ts` | Play specific track by URI |
| `src/app/api/spotify/recent-tracks/route.ts` | Get recently played tracks |
| `src/app/api/spotify/search/route.ts` | Search tracks/playlists |
| `src/app/api/spotify/transfer/route.ts` | Transfer playback to device |

---

## Sound Assets (44 MP3 files in `/public/sounds/`)

| Category | Files | Examples |
|----------|-------|----------|
| **Alarms** | 2 | alarm.mp3, silence.mp3 |
| **Nature** | 11 | campfire, waves, wind-in-trees, walk-on-leaves, river, howling-wind, droplets, etc. |
| **Rain** | 8 | heavy-rain, light-rain, rain-on-window, rain-on-tent, thunder, etc. |
| **Things** | 12 | clock, typewriter, keyboard, ceiling-fan, singing-bowl, bubbles, etc. |
| **Transport** | 6 | train, airplane, rowing-boat, submarine, inside-a-train, sailboat |
| **Urban** | 5 | busy-street, crowd, highway, traffic, road |

---

## Architecture Notes

### Audio Playback Flow
1. **User selects** audio (Spotify/YouTube/Ambient) → Settings modal or timer dock
2. **Store action** invoked (e.g., `playAudio()`) → triggers `audioManager`
3. **AudioManager** creates appropriate player (SpotifyPlayer/YouTubePlayer/HTMLAudioPlayer)
4. **Player** loads & plays, emits events
5. **Store** updates state → React re-renders UI with current playback info
6. **Ambient mixing** allows multiple ambient sounds + one main source simultaneously

### Key Dependencies
- **Zustand** (state) + **persist** middleware (localStorage)
- **Spotify Embed IFrame API** (hosted script)
- **YouTube IFrame API** (hosted script)
- **HTML5 Audio API** (ambient, fallback)
- **shadcn/ui** components (Button, Input, Sheet, Slider, Badge)

### Persistence
- Audio store persists to localStorage key: `audio-storage-v2`
- Persists: history, settings, favorites, recently-played, active-ambient-ids
- Does NOT persist: currentlyPlaying (runtime-only)

---

## Next Steps for Audio System Overhaul
1. Review `audio-manager.ts` (800 LOC) - core refactoring candidate
2. Test ambient mixing with multiple simultaneous sources
3. Verify Spotify/YouTube API error handling edge cases
4. Consider drawer.tsx component addition if needed for mobile UX
5. Audit sound-catalog.ts for completeness and i18n coverage

