# Phase 1: Remove Spotify & Clean Legacy Code

## Context
- **Parent plan**: [plan.md](./plan.md)
- **Dependencies**: None (first phase)
- **Blocks**: Phase 2, 3, 5

## Overview
| Field | Value |
|-------|-------|
| Date | 2026-02-09 |
| Priority | P1 |
| Effort | 2h |
| Implementation | done |
| Review | done |

Remove all Spotify integration (components, hooks, API routes, player class) and legacy `soundSettings` from system-store. This is a clean-slate phase -- delete code, verify compilation.

## Key Insights
- 4 Spotify components (420 LOC), 1 hook (164 LOC), 11 API routes (545 LOC), 1 player class (~220 LOC)
- Total removal: ~1,350 LOC
- `audio-settings-modal.tsx` imports SpotifyPane -- will be fully rewritten in Phase 3, so just remove the import/tab for now
- `system-store.ts` has `SoundSettings` with `soundType: 'bell' | 'chime' | ...` -- this is legacy, alarm settings move to audio-store in Phase 2
- `AudioSourceType` includes `'spotify'` -- remove from union type
- `audio-manager.ts` exports `playSpotify` helper -- remove it

## Requirements
1. Delete all Spotify-related files
2. Remove SpotifyPlayer class from audio-manager.ts
3. Remove `playSpotify` export from audio-manager.ts
4. Remove `'spotify'` from `AudioSourceType` union
5. Remove Spotify tab from audio-settings-modal.tsx
6. Remove `SpotifyPlaybackOptions` and `SpotifyPlayerMetadata` types
7. Remove `soundSettings` from system-store.ts (legacy, unused after overhaul)
8. Remove Spotify references from `CurrentlyPlayingAudio.type` union
9. App must compile with `next build` after all deletions

## Architecture
No new architecture -- pure deletion phase. The audio-settings-modal will be simplified to 2 tabs (Ambient/YouTube) temporarily until Phase 3 replaces it entirely.

## Related Code Files

### Delete
| File | LOC |
|------|-----|
| `src/components/audio/spotify/spotify-pane.tsx` | 172 |
| `src/components/audio/spotify/spotify-playlist-list.tsx` | 134 |
| `src/components/audio/spotify/spotify-embed.tsx` | 67 |
| `src/components/audio/spotify/spotify-input-section.tsx` | 47 |
| `src/hooks/use-spotify-player.ts` | 164 |
| `src/app/api/spotify/login/route.ts` | ~50 |
| `src/app/api/spotify/callback/route.ts` | ~50 |
| `src/app/api/spotify/logout/route.ts` | ~50 |
| `src/app/api/spotify/playlists/route.ts` | ~50 |
| `src/app/api/spotify/devices/route.ts` | ~50 |
| `src/app/api/spotify/status/route.ts` | ~50 |
| `src/app/api/spotify/play/route.ts` | ~50 |
| `src/app/api/spotify/play-track/route.ts` | ~50 |
| `src/app/api/spotify/recent-tracks/route.ts` | ~50 |
| `src/app/api/spotify/search/route.ts` | ~50 |
| `src/app/api/spotify/transfer/route.ts` | ~50 |

### Modify
| File | Changes |
|------|---------|
| `src/lib/audio/audio-manager.ts` | Remove SpotifyPlayer class (L216-439), `playSpotify` export (L767-789), `SpotifyPlaybackOptions` type, `'spotify'` from AudioSourceType, spotify branch in `play()` method |
| `src/stores/audio-store.ts` | Remove `'spotify'` from `CurrentlyPlayingAudio.type`, remove spotify branch in `togglePlayPause` |
| `src/components/settings/audio-settings-modal.tsx` | Remove SpotifyPane import (L37), SpotifyIcon component (L272-282), Spotify TabsTrigger (L448-453), Spotify TabsContent (L510-512) |
| `src/stores/system-store.ts` | Remove `SoundSettings` interface, `soundSettings` from state, `updateSoundSettings`, `resetSoundSettings`, `defaultSoundSettings`, remove from `partialize` |
| `src/app/(main)/timer/components/timer-settings-dock.tsx` | Remove `spotify` reference from tooltip rendering (L103-106) |

## Implementation Steps

1. **Delete Spotify component files**
   ```bash
   rm -rf src/components/audio/spotify/
   ```

2. **Delete Spotify hook**
   ```bash
   rm src/hooks/use-spotify-player.ts
   ```

3. **Delete Spotify API routes**
   ```bash
   rm -rf src/app/api/spotify/
   ```

4. **Clean audio-manager.ts**
   - Remove `SpotifyPlaybackOptions` interface (L16-21)
   - Remove `SpotifyPlayerMetadata` type (L44-46)
   - Remove entire `SpotifyPlayer` class (L216-439)
   - Remove `'spotify'` from `AudioSourceType` union (L14)
   - In `play()` method, remove `source.type === 'spotify'` branch (L489, L509-510)
   - Remove `playSpotify` export function (L767-789)

5. **Clean audio-store.ts**
   - Update `CurrentlyPlayingAudio.type` from `'ambient' | 'youtube' | 'spotify'` to `'ambient' | 'youtube'`
   - In `togglePlayPause`, remove any spotify-specific logic
   - In `playAudio`, remove spotify comment references

6. **Clean audio-settings-modal.tsx**
   - Remove `import SpotifyPane` (L37)
   - Remove `SpotifyIcon` component (L272-282)
   - Change TabsList from `grid-cols-3` to `grid-cols-2`
   - Remove Spotify TabsTrigger (L439-453)
   - Remove Spotify TabsContent (L510-512)

7. **Clean system-store.ts**
   - Remove `SoundSettings` interface
   - Remove `soundSettings` from `SystemState`
   - Remove `updateSoundSettings`, `resetSoundSettings` actions
   - Remove `defaultSoundSettings`
   - Remove `soundSettings` from `partialize`
   - Remove `soundSettings` from initial state

8. **Clean timer-settings-dock.tsx**
   - Remove spotify SVG icon in tooltip (L103-106)

9. **Clean audio-settings-modal.tsx**
   - Remove `useSystemStore` import and `updateSoundSettings` destructuring (L50)

10. **Run build verification**
    ```bash
    npx next build
    ```
    Fix any remaining TypeScript errors from dangling references.

## Todo List
- [x] Delete Spotify component directory
- [x] Delete Spotify hook file
- [x] Delete Spotify API route directory
- [x] Remove SpotifyPlayer class from audio-manager.ts
- [x] Remove spotify from AudioSourceType
- [x] Clean audio-store.ts type references
- [x] Clean audio-settings-modal.tsx (imports, tab, icon)
- [x] Remove legacy soundSettings from system-store.ts
- [x] Clean timer-settings-dock.tsx tooltip
- [x] Run `next build` and fix errors (⚠️ blocked by 20 pre-existing errors, not Phase 1 fault)
- [x] Verify app works in dev mode

## Success Criteria
1. `next build` passes with zero errors
2. No files reference "spotify" (case-insensitive grep returns 0 results in src/)
3. `system-store.ts` no longer has `soundSettings`
4. Ambient sounds and YouTube still work as before
5. Audio modal shows 2 tabs (Ambient, YouTube)

## Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| Hidden Spotify imports elsewhere | Low | Run `grep -r "spotify" src/` to catch all |
| system-store soundSettings used elsewhere | Low | Grep for `updateSoundSettings` and `soundSettings` |
| Build breaks from type narrowing | Low | TypeScript compiler will catch all references |

## Next Steps
After this phase, proceed to [Phase 2: Restructure Audio Store & Engine](./phase-02-restructure-store-engine.md).
