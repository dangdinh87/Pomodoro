# Audio System Documentation

## Overview

The audio system in Study Bro provides flexible ambient sound management, YouTube integration, and alarm functionality. Phase 2 (2026-02-09) restructured the system for per-sound volume control, new category structure, and multi-source switching.

**Current Version:** v3
**Status:** Implemented & Reviewed (7.5/10 quality score)

---

## Architecture

### Sound Catalog Structure

8 categories with 32 ambient sounds + 5 alarm types:

| Category | Count | Examples |
|----------|-------|----------|
| **nature** | 6 | Campfire, droplets, river, waves, wind |
| **rain** | 5 | Heavy rain, light rain, thunder, rain on window |
| **noise** | 3 | White, brown, pink noise (placeholders in Phase 2) |
| **study** | 3 | Library, coffee shop, coworking (placeholders) |
| **cozy** | 5 | Clock, singing bowl, wind chimes, vinyl, cat purring |
| **transport** | 4 | Airplane, train, submarine, inside train |
| **city** | 3 | Busy street, crowd, traffic |
| **machine** | 3 | Ceiling fan, keyboard, typewriter |

**Alarm Sounds:** Bell, chime, gong, digital, soft

### Type Definitions

#### AmbientSoundState
```typescript
interface AmbientSoundState {
  id: string        // e.g., "campfire", "heavy-rain"
  volume: number    // 0-100, individual per-sound
}
```

#### SoundItem
```typescript
interface SoundItem {
  id: string                    // Unique identifier
  category: SoundCategory       // One of 8 categories
  label: string                 // English display name
  vn?: string                   // Vietnamese translation
  icon: string                  // Emoji icon
  url: string                   // Path to audio file
}
```

#### SoundPreset
```typescript
interface SoundPreset {
  id: string                    // Preset identifier
  name: string                  // User-friendly name
  icon?: string                 // Optional emoji
  sounds: AmbientSoundState[]   // Array of active sounds with volumes
  isBuiltIn: boolean           // Built-in vs user-created
}
```

#### AudioSettings
```typescript
interface AudioSettings {
  masterVolume: number       // 0-100 (main volume control)
  isMuted: boolean          // Global mute toggle
  fadeInOut: boolean        // Fade in/out on play/stop
  activeSource: 'ambient' | 'youtube' | 'none'  // Current audio source
  alarmType: string         // Selected alarm type ('bell', 'chime', etc.)
  alarmVolume: number       // 0-100, independent alarm volume
  youtubeUrl: string        // YouTube video URL for playback
}
```

---

## Volume Model

**Effective Volume Formula:**
```
effectiveVolume = (soundVolume / 100) * (masterVolume / 100)
```

**Example:**
- Sound volume: 60%
- Master volume: 80%
- Result: (0.60) × (0.80) = 0.48 → 48% effective volume

**Key Points:**
- Per-sound volumes are stored in `AmbientSoundState.volume`
- Master volume applies to all ambient sounds equally
- Changing master volume recalculates all effective volumes
- Alarm volume is independent of master volume

---

## Audio Store (Zustand)

### State Structure

```typescript
interface AudioState {
  // Current playback
  currentlyPlaying: CurrentlyPlayingAudio | null
  audioHistory: CurrentlyPlayingAudio[]

  // Settings & Configuration
  audioSettings: AudioSettings

  // Ambient sounds
  activeAmbientSounds: AmbientSoundState[]    // Currently playing sounds
  savedAmbientState: AmbientSoundState[]      // Saved when switching to YouTube

  // Presets & Favorites
  presets: SoundPreset[]
  favorites: string[]
  recentlyPlayed: string[]
}
```

### Key Actions

#### Volume Control
```typescript
updateVolume(volume: number)        // Updates masterVolume
setSoundVolume(soundId, volume)     // Updates per-sound volume
```

#### Playback
```typescript
playAmbient(soundId, volume?: 50)   // Play a single ambient sound
toggleAmbient(soundId)              // Play/stop a sound
stopAmbient(soundId)                // Stop specific sound
stopAllAmbient()                    // Clear all active sounds
playAudio(source)                   // Play AudioSource with effective volume
togglePlayPause()                   // Toggle current playback
```

#### Source Switching
```typescript
setActiveSource(source)             // Switch between 'ambient', 'youtube', 'none'
```

When switching to YouTube:
1. Current ambient state is saved to `savedAmbientState`
2. All ambients are stopped
3. YouTube playback begins

When switching back to ambient:
1. YouTube stops
2. Saved ambient state is restored from `savedAmbientState`

#### State Persistence
```typescript
updateAudioSettings(Partial<AudioSettings>)  // Merge settings
resetAudioSettings()                         // Restore defaults
```

---

## Audio Manager

Manages actual Web Audio API players and volume calculations.

### Per-Sound Volume Control
```typescript
setAmbientVolume(soundId: string, soundVolume: number, masterVolume: number)
```

- Retrieves player for `soundId`
- Calculates: `effective = (soundVolume/100) * (masterVolume/100)`
- Applies to Web Audio API: `player.volume = effective`

### Player Management
```typescript
playAmbient(source: AudioSource): Promise<boolean>
```

- Source contains: `{ id, url, volume (per-sound), ...}`
- Internally calculates effective volume
- Stores per-sound volumes in `ambientVolumes: Map<string, number>`

### Master Volume Updates
When `updateVolume()` is called:
1. Store updates `masterVolume`
2. AudioManager recalculates ALL ambient player volumes
3. Each player's effective volume = `(stored per-sound vol) * (new master vol) / 100`

---

## Migration Logic (v2 → v3)

Zustand persist middleware automatically migrates old data:

```typescript
if (version < 3) {
  // Convert activeAmbientSounds from string[] to AmbientSoundState[]
  if (Array.isArray(persistedState.activeAmbientSounds)) {
    persistedState.activeAmbientSounds = persistedState.activeAmbientSounds.map(
      (id: string) => typeof id === 'string' ? { id, volume: 50 } : id
    )
  }

  // Rename 'volume' → 'masterVolume'
  if (persistedState.audioSettings?.volume !== undefined) {
    persistedState.audioSettings.masterVolume = persistedState.audioSettings.volume
    delete persistedState.audioSettings.volume
  }

  // Add new fields with defaults
  persistedState.audioSettings = {
    ...persistedState.audioSettings,
    activeSource: 'ambient',
    alarmType: 'bell',
    alarmVolume: 70,
  }

  // Remove deprecated fields
  delete persistedState.audioSettings?.selectedAmbientSound
  delete persistedState.audioSettings?.selectedTab
  delete persistedState.audioSettings?.selectedNotificationSound
  delete persistedState.audioSettings?.notificationVolume

  // Initialize new state
  persistedState.presets = []
  persistedState.savedAmbientState = []
}
```

**Storage Key:** `audio-storage-v3` (uses version-based migration, not key-based)

---

## Code References

### Core Files

| File | Purpose |
|------|---------|
| `src/lib/audio/sound-catalog.ts` | Sound definitions & categories (32 ambient + 5 alarms) |
| `src/stores/audio-store.ts` | Zustand store with all audio state & actions |
| `src/lib/audio/audio-manager.ts` | Web Audio API player management |
| `src/hooks/use-youtube-player.ts` | YouTube integration (uses `masterVolume`) |
| `src/components/settings/audio-settings-modal.tsx` | Audio UI (temporary, Phase 3 rewrite pending) |

### Sound Files Location

```
public/sounds/
├── nature/           # 6 files (campfire.mp3, droplets.mp3, etc.)
├── rain/             # 5 files (heavy-rain.mp3, light-rain.mp3, etc.)
├── noise/            # Placeholder URLs only (Phase 7)
├── study/            # Placeholder URLs only (Phase 7)
├── things/           # Cozy + machine sounds (clock.mp3, keyboard.mp3, etc.)
├── transport/        # 4 files (airplane.mp3, train.mp3, etc.)
├── urban/            # 3 files (busy-street.mp3, crowd.mp3, traffic.mp3)
├── alarms/           # chime.mp3, gong.mp3, digital.mp3, soft.mp3
└── alarm.mp3         # Bell alarm (original)
```

---

## Volume Bounds & Safety

### Critical Issues Fixed

**Volume Clamping Required** (deferred from Phase 2):
- Before applying volumes, clamp to 0-100 range
- Both `setAmbientVolume()` and `playAmbient()` need validation
- Prevents NaN or out-of-range Web Audio values

### Array Access Safety

Code checking for bounds before `activeAmbientSounds[0]` access:
```typescript
// Safe pattern:
if (activeAmbientSounds.length > 0) {
  const first = activeAmbientSounds[0]
  // ...
}
```

---

## Known Limitations (Phase 2)

### Placeholder Sound Files
- **noise** category: white-noise, brown-noise, pink-noise (URLs only)
- **study** category: library, coffee-shop, coworking (URLs only)
- **cozy** category: cat-purring (URL only)

**Resolution:** Phase 7 will create/add MP3 files for these sounds

### UI Limitations
- **audio-settings-modal.tsx**: Temporary implementation
- Full sidebar redesign pending Phase 3
- Doesn't expose per-sound volume controls yet

### Build Status
- 20 pre-existing TypeScript errors in unrelated files (navigation.tsx, task components)
- Not blocking Phase 2 functionality
- Must be fixed before general deployment

---

## Future Phases

| Phase | Focus | Impact |
|-------|-------|--------|
| **3** | Audio Sidebar Panel | Full UI overhaul, per-sound volume controls |
| **4** | Preset System | User-created sound combinations, quick-switch |
| **5** | YouTube Exclusive Mode | Alternative audio source, state restoration |
| **6** | Alarm System & Timer | Notification integration, Pomodoro end signals |
| **7** | Polish Sound Assets | Create missing MP3s, quality optimization |

---

## Testing Recommendations

### Unit Tests
```typescript
// Volume calculation
expect(effective(60, 80)).toBe(48)

// Migration v2→v3
const oldData = { activeAmbientSounds: ['campfire', 'rain'] }
const migrated = migrate(oldData, 2)
expect(migrated.activeAmbientSounds).toEqual([
  { id: 'campfire', volume: 50 },
  { id: 'rain', volume: 50 }
])

// Array bounds
expect(getFirst([]).length).toBe(0)  // Safe
```

### Integration Tests
```typescript
// Per-sound volume independence
play('campfire', 60)
play('rain', 80)
setMasterVolume(50)
// Both sounds should have different effective volumes
// campfire: 0.3, rain: 0.4 (not equal)
```

---

## Development Notes

### Adding New Sounds

1. Add file to `public/sounds/{category}/{id}.mp3`
2. Add entry to category array in `sound-catalog.ts`:
   ```typescript
   { id: "new-id", category: "nature", label: "New Sound",
     vn: "Âm thanh mới", icon: "🎵", url: "/sounds/nature/new-id.mp3" }
   ```
3. No store changes needed (reads from catalog)

### Volume Formula Reference
Keep consistent across all code:
```
effectiveVol = (soundVol / 100) * (masterVol / 100) * 100
```

Last Updated: 2026-02-09 (Phase 2 Complete)
