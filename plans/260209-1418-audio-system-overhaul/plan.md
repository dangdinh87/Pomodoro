---
title: "Audio System Overhaul"
description: "Replace audio modal with sidebar mixer, remove Spotify, add per-sound volume & presets"
status: in-progress
priority: P1
effort: "22h"
branch: feat/new-branding
tags: [audio, ui, refactor, mixer, presets]
created: 2026-02-09
---

# Audio System Overhaul

## Goal
Transform the 800px 3-tab audio modal into a 350px right sidebar soundscape mixer with per-sound volume, presets, and exclusive source switching. Remove Spotify entirely.

## Phases

| # | Phase | File | Status | Effort |
|---|-------|------|--------|--------|
| 1 | Remove Spotify & Clean Legacy | [phase-01](./phase-01-remove-spotify-clean-legacy.md) | completed | 2h |
| 2 | Restructure Audio Store & Engine | [phase-02](./phase-02-restructure-store-engine.md) | completed | 4h |
| 3 | Build Audio Sidebar Panel | [phase-03](./phase-03-audio-sidebar-panel.md) | completed | 5h |
| 4 | Preset System | [phase-04](./phase-04-preset-system.md) | completed | 3h |
| 5 | YouTube Exclusive Mode | [phase-05](./phase-05-youtube-exclusive-mode.md) | completed | 2h |
| 6 | Alarm System & Timer Integration | [phase-06](./phase-06-alarm-system-timer.md) | pending | 3h |
| 7 | Polish & Sound Assets | [phase-07](./phase-07-polish-sound-assets.md) | pending | 3h |

## Dependency Graph
```
Phase 1 (Spotify removal)
  |
  v
Phase 2 (Store + Engine) ----+
  |                           |
  v                           v
Phase 3 (Sidebar UI)     Phase 5 (YouTube)
  |
  v
Phase 4 (Presets)
  |
Phase 6 (Alarm) -- can start after Phase 2
  |
  v
Phase 7 (Polish) -- final, after all others
```

## Key Decisions
- HTMLAudioElement (no Web Audio API) -- sufficient for 5-6 simultaneous sounds
- shadcn Sheet (side="right") -- already installed in codebase
- Zustand persist with v2 -> v3 migration
- Max 6 concurrent ambient sounds
- YouTube XOR Ambient (mutually exclusive, state preserved on switch)

## Sound Library Changes
- Remove 14 sounds (walks, boiling water, washing machine, etc.)
- Add ~10 new sounds (noise colors, ASMR, study rooms)
- Reorganize from 5 flat categories into 8 themed categories
- Final catalog: ~37 ambient sounds

## Files Overview
- **Delete**: 4 Spotify components, 1 Spotify hook, 11 Spotify API routes, 14 sound files
- **Rewrite**: audio-settings-modal.tsx -> audio-sidebar.tsx, audio-store.ts
- **Modify**: audio-manager.ts, sound-catalog.ts, timer-settings-dock.tsx, use-timer-engine.ts
- **Create**: audio-sidebar.tsx, ambient-mixer.tsx, preset-chips.tsx, sound-icon-grid.tsx, active-sound-card.tsx, alarm-settings.tsx

## Research
- [Sidebar UX patterns](./research/researcher-sidebar-ux-patterns.md)
- [HTML5 Audio mixing](./research/researcher-html5-audio-mixing.md)
- [File inventory](./scout/scout-audio-files-inventory.md)

## Validation Summary

**Validated:** 2026-02-09
**Questions asked:** 6

### Confirmed Decisions
- **Directory restructure**: Move sounds to new category folders EARLY (Phase 2), not Phase 7. Avoid double URL changes.
- **New sound assets**: Generate using AI audio tools (not manual freesound.org sourcing)
- **Alarm + Mute**: Alarm always plays (bypasses mute). Min 10% volume on timer completion.
- **Mini player**: Add small indicator on dock (icon + sound name + play/pause) when sidebar is closed. No floating card.
- **Spotify env vars**: Keep SPOTIFY_CLIENT_ID/SECRET in .env (don't delete). Only remove code.
- **Missing sound fallback**: Skip silently when preset references missing sound. No toast, no disable.

### Action Items (Plan Revisions Needed)
- [ ] Phase 2: Add sound directory restructure (move files + update URLs) — moved from Phase 7
- [ ] Phase 3: Add mini indicator component to timer-settings-dock (icon + name + play/pause)
- [ ] Phase 1: Keep Spotify env vars in .env files, only delete source code
- [ ] Phase 4: Add graceful skip logic for missing sounds in loadPreset
- [ ] Phase 7: Reduce scope — directory restructure already done in Phase 2, focus on new sounds (AI-generated) + fade + QA
