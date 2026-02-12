# Study Bro Documentation Index

Navigate the complete documentation for Study Bro (Pomodoro App).

## Core Documentation

### Architecture & Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical overview, tech stack, state management, design system (Vietnamese)
- **[PROJECT_STRUCTURE_REVIEW.md](./PROJECT_STRUCTURE_REVIEW.md)** - Directory structure analysis, best practices, recommendations (Vietnamese)

### Feature Documentation

#### Audio System (Phase 2 Complete)
- **[audio-system.md](./audio-system.md)** - Complete audio system reference
  - 8-category sound structure (32 ambient + 5 alarms)
  - Per-sound volume control with master volume
  - Storage migration (v2 → v3)
  - Audio Manager & Store architecture
  - Testing patterns & development guidelines

#### Backgrounds
- **[ADDING_BACKGROUNDS.md](./ADDING_BACKGROUNDS.md)** - Guide for adding background images/videos

### Configuration & Setup
- **[MCP_SETUP.md](./MCP_SETUP.md)** - MCP (Model Context Protocol) configuration and setup

---

## Quick Reference

### For Developers New to Audio
Start with: **[audio-system.md](./audio-system.md)**
- Read "Overview" section for v3 status
- Check "Architecture" for sound categories & types
- Reference "Code References" for file locations

### For Volume Logic Implementation
See: **audio-system.md → Volume Model**
Formula: `effectiveVolume = (soundVolume/100) × (masterVolume/100)`

### For Storage & Migration
See: **audio-system.md → Migration Logic (v2 → v3)**
Handles legacy data conversion automatically

### For Adding New Sounds
See: **audio-system.md → Development Notes**
1. Add file to `public/sounds/{category}/`
2. Add entry to sound-catalog.ts
3. No store changes needed

---

## Documentation Status

| Document | Updated | Status |
|----------|---------|--------|
| ARCHITECTURE.md | 2026-02-06 | Vietnamese, covers tech stack |
| PROJECT_STRUCTURE_REVIEW.md | 2026-02-09 | Complete structure analysis |
| audio-system.md | 2026-02-09 | Phase 2 implementation synced |
| ADDING_BACKGROUNDS.md | 2026-02-08 | Background assets guide |
| MCP_SETUP.md | 2026-02-09 | Configuration reference |

---

## By Use Case

### "I need to understand the audio system"
1. Read: audio-system.md (Architecture section)
2. Review: Type definitions (AmbientSoundState, SoundPreset, AudioSettings)
3. Check: Volume formula and per-sound control logic

### "I need to add a new ambient sound"
1. See: audio-system.md → Development Notes
2. Add file: `public/sounds/{category}/{id}.mp3`
3. Update: sound-catalog.ts with SoundItem entry

### "I need to debug volume issues"
1. Reference: audio-system.md → Volume Model
2. Check: Audio Manager's setAmbientVolume() implementation
3. Review: Critical issues in "Volume Bounds & Safety"

### "I need to understand the app structure"
1. Start: ARCHITECTURE.md (tech stack overview)
2. Deep dive: PROJECT_STRUCTURE_REVIEW.md (detailed analysis)
3. Check: Recommendations for improvements

### "I'm implementing Phase 3 (Sidebar)"
1. Read: audio-system.md → Future Phases (Phase 3 details)
2. Review: Known Limitations section for UI gaps
3. Plan: Per-sound volume control UI components

---

## Phase Timeline

- **Phase 1**: Remove Spotify, clean legacy (Complete)
- **Phase 2**: Restructure Audio Store & Engine (Complete) ✅ Documented
- **Phase 3**: Audio Sidebar Panel (In Planning)
- **Phase 4**: Preset System (Planned)
- **Phase 5**: YouTube Exclusive Mode (Planned)
- **Phase 6**: Alarm System & Timer (Planned)
- **Phase 7**: Polish Sound Assets (Planned)

---

## Critical Items

### Before Phase 3
- [ ] Fix H1: Array bounds checking on activeAmbientSounds[0]
- [ ] Fix H2: Volume clamping in setAmbientVolume()
- [ ] Resolve 20 pre-existing TypeScript errors

### Phase 7 (Sound Assets)
- [ ] Create MP3 files for 9 placeholder sounds
- [ ] Update sound-catalog.ts with final URLs
- [ ] Update audio-system.md with quality standards

---

## Resources

- **Source Code**: `src/lib/audio/` (core audio logic)
- **State Management**: `src/stores/audio-store.ts` (Zustand store)
- **Components**: `src/components/settings/audio-settings-modal.tsx` (UI, temp)
- **Sound Assets**: `public/sounds/` (organized by category)

---

Last updated: 2026-02-09
