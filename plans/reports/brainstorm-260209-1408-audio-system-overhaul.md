# Brainstorm: Overhaul Hệ Thống Âm Thanh

## Vấn Đề

Hệ thống âm thanh hiện tại có 4 vấn đề lớn:
1. **UI rối, khó dùng** — Modal 800px với 3 tab (Hệ thống/YouTube/Spotify) gây overload
2. **Logic lỗi** — Volume không đồng bộ giữa sources, alarm hardcoded 50% không dùng setting
3. **Thiếu tính năng** — Không volume riêng từng sound, không presets, không save mix
4. **Trải nghiệm tệ** — Flow không mượt, không tạo cảm giác thư giãn/tập trung

## Quyết Định Đã Thống Nhất

| Hạng mục | Quyết định |
|----------|-----------|
| Hướng đi | Soundscape mixer (hybrid Noisli + popup slider) |
| UI | Right sidebar panel ~300-350px, slide from right |
| Streaming | Bỏ Spotify, chỉ giữ YouTube |
| Multi-source | YouTube thay thế ambient (chỉ 1 nguồn tại 1 thời điểm) |
| Presets | Có sẵn (Cafe, Rain, Forest...) + user tự tạo |
| Alarm | Nhiều loại alarm + volume riêng |
| Extras | Fade in/out effects |

---

## Giải Pháp Đề Xuất

### 1. UI Layout — Right Sidebar Panel

```
┌──────────────────────────────┐
│ 🔊 Âm Thanh              [X] │
├──────────────────────────────┤
│ [🌿 Ambient]  [▶ YouTube]    │  ← 2 source tabs
├──────────────────────────────┤
│                               │
│ ── Presets ──                 │
│ [☕ Cafe] [🌧 Mưa] [🌲 Rừng] │  ← Chips nhanh
│ [💾 Save mix] [❤ My Mix 1]   │
│                               │
├──────────────────────────────┤
│ ── Đang phát (2) ──          │
│ ┌────────────────────────┐   │
│ │ 🌧 Mưa nhẹ     [x]    │   │
│ │ ━━━━━━━━━━━━━━ 60%     │   │
│ ├────────────────────────┤   │
│ │ ☕ Quán cafe    [x]    │   │
│ │ ━━━━━━━━━━━ 40%        │   │
│ └────────────────────────┘   │
│                               │
├──────────────────────────────┤
│ ── Tất cả ──                 │
│ ▼ Thiên nhiên                │
│   [🌊] [🌲] [🐦] [💨] [🔥]  │  ← Icon grid
│ ▼ Mưa                        │
│   [🌧] [⛈] [🏠] [☂]        │
│ ▼ Đồ vật                     │
│   [⌨] [☕] [📻] [🕐]        │
│ ▼ Giao thông                 │
│   [✈] [🚂] [⛵]             │
│ ▼ Thành phố                  │
│   [🏙] [👥] [🛣]             │
│                               │
├──────────────────────────────┤
│ Master: 🔊 ━━━━━━━━━ 70%    │
│ Fade: [ON]                    │
├──────────────────────────────┤
│ Alarm: [Chuông ▾] 🔔━━ 50%  │
└──────────────────────────────┘
```

**YouTube Tab:**
```
┌──────────────────────────────┐
│ [🌿 Ambient]  [▶ YouTube]    │
├──────────────────────────────┤
│ [Paste YouTube URL...]        │
│                               │
│ ── Gợi ý ──                  │
│ 🎵 Lo-Fi Study Beats         │
│ 🎵 Chill Piano               │
│ 🎵 Jazz Cafe Background      │
│ 🎵 ...                       │
│                               │
│ ── Đang phát ──              │
│ 🎬 Lofi Girl - beats to...   │
│ ▶ ━━━━━━━━━━━━━━━            │
│ 🔊 ━━━━━━━━━━━━━ 70%        │
└──────────────────────────────┘
```

### 2. Interaction Flow

**Ambient sounds:**
1. User mở sidebar → thấy preset chips ở trên
2. Tap preset → load mix (nhiều sounds + volumes)
3. Hoặc scroll xuống "Tất cả" → tap icon để toggle sound
4. Sound được thêm → hiện lên section "Đang phát" với slider volume riêng
5. Drag slider để chỉnh volume từng sound
6. Tap [x] trên sound đang phát → tắt sound đó
7. Tap [💾 Save mix] → lưu mix hiện tại thành preset tự tạo

**YouTube:**
1. Chuyển tab YouTube → tất cả ambient sounds tự động dừng
2. Paste URL hoặc chọn gợi ý → phát nhạc
3. Quay lại tab Ambient → YouTube tự động dừng, ambient trước đó resume

**Alarm:**
- Nằm cố định ở bottom sidebar
- Dropdown chọn loại alarm (Bell, Chime, Gong, Digital, Soft)
- Slider volume riêng cho alarm
- Khi timer hết → phát đúng alarm đã chọn, đúng volume

### 3. Kiến Trúc Kỹ Thuật

#### State Store Changes (audio-store.ts)

```typescript
// TRƯỚC: activeAmbientSounds: string[]
// SAU:
interface AmbientSoundState {
  id: string
  volume: number  // 0-100, volume riêng từng sound
}

interface SoundPreset {
  id: string
  name: string
  icon?: string
  sounds: AmbientSoundState[]
  isBuiltIn: boolean
}

interface AudioSettings {
  masterVolume: number        // 0-100
  isMuted: boolean
  fadeInOut: boolean
  // BỎ: selectedAmbientSound, selectedTab (spotify)
  // THÊM:
  activeSource: 'ambient' | 'youtube' | 'none'
  alarmType: string           // 'bell' | 'chime' | 'gong' | 'digital' | 'soft'
  alarmVolume: number         // 0-100
  youtubeUrl: string
}

interface AudioState {
  activeAmbientSounds: AmbientSoundState[]  // thay đổi type
  presets: SoundPreset[]                     // THÊM
  audioSettings: AudioSettings
  // GIỮ: favorites, recentlyPlayed, audioHistory
}
```

#### AudioManager Changes

```
TRƯỚC:
  AudioManager → HTMLAudioPlayer (ambient, cùng volume)
               → YouTubePlayer
               → SpotifyPlayer (BỎ)

SAU:
  AudioManager → HTMLAudioPlayer[] (ambient, MỖI sound volume riêng)
               → YouTubePlayer
               → Exclusive source logic (ambient XOR youtube)
```

**Thay đổi chính:**
- `playAmbient(id, volume)` — thêm param volume
- `setAmbientVolume(id, volume)` — chỉnh volume riêng 1 sound
- `setActiveSource(source)` — chuyển source, auto-stop source cũ
- Bỏ toàn bộ SpotifyPlayer class
- Fix alarm: dùng alarmType + alarmVolume từ store

#### Files Cần Thay Đổi

| Action | File | Lý do |
|--------|------|-------|
| **XÓA** | `src/components/audio/spotify/*` (4 files) | Bỏ Spotify |
| **XÓA** | `src/hooks/use-spotify-player.ts` | Bỏ Spotify |
| **XÓA** | `src/app/api/spotify/*` (10 routes) | Bỏ Spotify API |
| **REWRITE** | `src/components/settings/audio-settings-modal.tsx` | → Sidebar panel |
| **REWRITE** | `src/stores/audio-store.ts` | Thêm per-sound volume, presets |
| **EDIT** | `src/lib/audio/audio-manager.ts` | Thêm per-sound volume, bỏ Spotify |
| **EDIT** | `src/lib/audio/sound-catalog.ts` | Thêm alarm sounds |
| **EDIT** | `src/hooks/use-youtube-player.ts` | Exclusive source logic |
| **EDIT** | `src/app/(main)/timer/hooks/use-timer-engine.ts` | Fix alarm hardcode |
| **EDIT** | `src/app/(main)/timer/components/timer-settings-dock.tsx` | Trigger sidebar thay modal |
| **EDIT** | `src/stores/system-store.ts` | Remove legacy sound settings |
| **TẠO** | `src/components/audio/audio-sidebar.tsx` | Sidebar panel chính |
| **TẠO** | `src/components/audio/ambient-mixer.tsx` | Mixer UI (active + all sounds) |
| **TẠO** | `src/components/audio/preset-chips.tsx` | Preset chips row |
| **TẠO** | `src/components/audio/sound-icon-grid.tsx` | Grid icons by category |
| **TẠO** | `src/components/audio/alarm-settings.tsx` | Alarm type + volume |

### 4. Built-in Presets

| Preset | Sounds | Volumes |
|--------|--------|---------|
| ☕ Cafe | crowd + keyboard + bubbles | 40/20/15 |
| 🌧 Mưa | light-rain + thunder | 60/25 |
| 🌲 Rừng | wind-in-trees + river + campfire | 50/35/20 |
| 🌊 Biển | waves + wind | 55/30 |
| 🚂 Tàu | inside-a-train + light-rain | 50/30 |
| 🔥 Đêm | campfire + wind + clock | 45/20/15 |

### 5. Alarm Types

| ID | Tên | File |
|----|-----|------|
| bell | Chuông | `/sounds/alarm.mp3` (có sẵn) |
| chime | Chime nhẹ | cần thêm |
| gong | Gõ chuông | cần thêm |
| digital | Digital beep | cần thêm |
| soft | Nhạc nhẹ | cần thêm |

### 6. Migration Strategy

**localStorage key vẫn giữ `audio-storage-v2`** nhưng thêm migration logic:
- Detect old format (`activeAmbientSounds: string[]`) → convert sang `AmbientSoundState[]` với default volume 50
- Bỏ Spotify settings
- Thêm default alarm settings
- Tăng version lên `audio-storage-v3`

---

## Rủi Ro & Lưu Ý

| Rủi ro | Mức | Giải pháp |
|--------|-----|-----------|
| Sidebar che mất content trên mobile | Cao | Overlay full-screen trên mobile, backdrop blur |
| Nhiều HTMLAudioElement cùng lúc → lag | Trung bình | Giới hạn max 5-6 sounds active |
| Migration data cũ | Thấp | Migration function trong store |
| Thiếu alarm sound files | Thấp | Dùng miễn phí từ freesound.org hoặc generate |
| YouTube ↔ Ambient switch gây mất trạng thái | Trung bình | Lưu ambient state khi switch, restore khi quay lại |

## Scope

**Trong scope:**
- Sidebar panel thay modal
- Per-sound volume mixer
- Preset system (built-in + custom)
- YouTube exclusive mode
- Multiple alarm types
- Fade effects
- Xóa Spotify hoàn toàn
- Fix alarm hardcode

**Ngoài scope (làm sau):**
- Web Audio API (GainNode, compressor) — quá phức tạp cho MVP
- Animation theo nhịp âm thanh
- Spatial audio
- Share presets giữa users
- Sync presets lên Supabase

---

## Tiêu Chí Thành Công

1. User mở sidebar, chọn preset → có mix âm thanh ngay trong 2 click
2. Mỗi sound có volume riêng, chỉnh mượt không lag
3. Chuyển Ambient ↔ YouTube smooth, không bị conflict
4. Alarm phát đúng loại + volume đã chọn
5. Fade in/out mượt khi bật/tắt sounds
6. Mobile responsive — sidebar trở thành overlay
7. Preset save/load hoạt động đúng qua localStorage

---

## Đánh Giá & Lọc Sound Library

### Sounds BỎ (14 files → xóa khỏi public/sounds/)

| Sound | Category | Lý do bỏ |
|-------|----------|----------|
| Walk in Snow | nature | Tiếng bước chân, không ambient |
| Walk on Gravel | nature | Tiếng bước chân, không ambient |
| Walk on Leaves | nature | Tiếng bước chân, không ambient |
| Howling Wind | nature | Quá mạnh, gây khó chịu |
| Boiling Water | things | Không phù hợp study/relax |
| Bubbles | things | Không phù hợp study/relax |
| Paper | things | Không ambient |
| Tuning Radio | things | Gây xao nhãng |
| Washing Machine | things | Không phù hợp |
| Rain on Car Roof | rain | Quá niche, trùng với rain khác |
| Rain on Tent | rain | Trùng với rain khác |
| Rain on Umbrella | rain | Trùng với rain khác |
| Rowing Boat | transport | Quá niche |
| Sailboat | transport | Trùng với waves + wind |

### Sounds GIỮ (29 sounds)

**Nature (6):** Campfire, Droplets, River, Waves, Wind in Trees, Wind
**Rain (5):** Heavy Rain, Light Rain, Rain on Leaves, Rain on Window, Thunder
**Things (5):** Ceiling Fan, Keyboard, Singing Bowl, Vinyl Effect, Clock
**Ticks (2):** Typewriter, Wind Chimes
**Transport (4):** Airplane, Inside a Train, Submarine, Train
**Urban (5):** Busy Street, Crowd, Highway, Road, Traffic

> Lưu ý: Urban có 5 sounds khá trùng nhau. Cân nhắc giữ 2-3 (Crowd, Busy Street, Traffic).

### Sounds THÊM MỚI (10-12 sounds → cần tải/tạo)

**Noise Colors (3):**
| Sound | Mô tả | Nguồn |
|-------|--------|-------|
| White Noise | Tần số đều, classic focus sound | Generate hoặc freesound.org |
| Brown Noise | Bass hơn white noise, trendy trên TikTok | Generate hoặc freesound.org |
| Pink Noise | Giữa white và brown, natural feel | Generate hoặc freesound.org |

**ASMR/Cozy (4-5):**
| Sound | Mô tả | Nguồn |
|-------|--------|-------|
| Birds Chirping | Chim hót buổi sáng | freesound.org |
| Night Crickets | Dế kêu đêm, rất relaxing | freesound.org |
| Cat Purring | Mèo kêu purr, ASMR cozy | freesound.org |
| Fireplace | Lửa lò sưởi crackling (khác campfire) | freesound.org |
| Rain + Thunder (Gentle) | Mưa nhẹ kèm sấm xa, atmospheric | Mix từ existing |

**Phòng Study (3):**
| Sound | Mô tả | Nguồn |
|-------|--------|-------|
| Library | Tiếng thư viện: lật sách, thì thầm xa | freesound.org |
| Coffee Shop | Quán cafe: ly tách, máy pha, nói chuyện xa | freesound.org |
| Co-working Space | Không gian làm việc: gõ phím, nói nhỏ | freesound.org |

### Tổng kết Sound Library mới

| Category | Hiện tại | Bỏ | Giữ | Thêm | Tổng mới |
|----------|---------|-----|------|------|---------|
| Nature | 10 | 4 | 6 | 0 | 6 |
| Rain | 8 | 3 | 5 | 0 | 5 |
| Things/Ticks | 12 | 5 | 7 | 0 | 7 |
| Transport | 6 | 2 | 4 | 0 | 4 |
| Urban | 5 | 0 | 5 | 0 | 5 |
| Noise | 0 | 0 | 0 | 3 | 3 |
| ASMR/Cozy | 0 | 0 | 0 | 4-5 | 4-5 |
| Phòng Study | 0 | 0 | 0 | 3 | 3 |
| **Tổng** | **41** | **14** | **27** | **10-11** | **37-38** |

### Categories Mới (đề xuất 8 categories)

| # | Category | Icon | Sounds |
|---|----------|------|--------|
| 1 | Thiên nhiên | 🌿 | Campfire, Droplets, River, Waves, Wind in Trees, Wind, Birds, Night Crickets, Fireplace |
| 2 | Mưa | 🌧 | Heavy Rain, Light Rain, Rain on Leaves, Rain on Window, Thunder |
| 3 | Noise | 📊 | White Noise, Brown Noise, Pink Noise |
| 4 | Phòng Study | 📚 | Library, Coffee Shop, Co-working Space, Keyboard, Typewriter |
| 5 | Cozy | 🐱 | Cat Purring, Vinyl Effect, Singing Bowl, Wind Chimes, Clock |
| 6 | Giao thông | 🚂 | Airplane, Inside a Train, Submarine, Train |
| 7 | Thành phố | 🏙 | Busy Street, Crowd, Traffic |
| 8 | Máy | ⚙️ | Ceiling Fan |

> Gộp "Things" + "Ticks" vào categories phù hợp hơn (Study, Cozy, Máy).
> Urban giảm từ 5 → 3 (bỏ Highway, Road vì trùng Traffic).

### Cập nhật Built-in Presets (dùng sounds mới)

| Preset | Sounds | Volumes |
|--------|--------|---------|
| ☕ Cafe | coffee-shop + keyboard | 50/25 |
| 🌧 Mưa | light-rain + thunder | 60/20 |
| 🌲 Rừng | wind-in-trees + river + birds | 45/35/25 |
| 🌊 Biển | waves + wind | 55/30 |
| 🚂 Tàu | inside-a-train + light-rain | 50/25 |
| 🔥 Đêm | campfire + night-crickets + wind | 45/30/15 |
| 📚 Thư viện | library + clock | 50/15 |
| 🐱 Cozy | cat-purring + fireplace + vinyl-effect | 40/35/20 |
| 📊 Deep Focus | brown-noise | 60 |

---

## Bước Tiếp Theo

Nếu đồng ý, sẽ tạo implementation plan chi tiết với các phase:
- Phase 1: Xóa Spotify + restructure store
- Phase 2: Sidebar panel + ambient mixer UI
- Phase 3: Per-sound volume + preset system
- Phase 4: YouTube exclusive mode
- Phase 5: Alarm system
- Phase 6: Polish (fade, mobile, migration)
