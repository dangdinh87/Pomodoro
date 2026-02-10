"use client"

export type SoundCategory =
  | 'nature' | 'rain' | 'noise' | 'study'
  | 'cozy' | 'transport' | 'city' | 'machine'

export interface SoundItem {
  id: string
  category: SoundCategory
  label: string
  vn?: string
  icon: string // emoji
  url: string
}

export interface AlarmItem {
  id: string
  label: string
  vn?: string
  url: string
}

// All ambient sound categories
const nature: SoundItem[] = [
  { id: "campfire", category: "nature", label: "Campfire", vn: "Lửa trại", icon: "🔥", url: "/sounds/nature/campfire.mp3" },
  { id: "droplets", category: "nature", label: "Droplets", vn: "Giọt nước", icon: "💧", url: "/sounds/nature/droplets.mp3" },
  { id: "river", category: "nature", label: "River", vn: "Dòng sông", icon: "🏞️", url: "/sounds/nature/river.mp3" },
  { id: "waves", category: "nature", label: "Waves", vn: "Sóng biển", icon: "🌊", url: "/sounds/nature/waves.mp3" },
  { id: "wind-in-trees", category: "nature", label: "Wind in Trees", vn: "Gió trong cây", icon: "🌳", url: "/sounds/nature/wind-in-trees.mp3" },
  { id: "wind", category: "nature", label: "Wind", vn: "Gió", icon: "💨", url: "/sounds/nature/wind.mp3" },
  { id: "birds", category: "nature", label: "Birds", vn: "Chim hót", icon: "🐦", url: "/sounds/nature/birds.mp3" },
  { id: "night-crickets", category: "nature", label: "Night Crickets", vn: "Dế đêm", icon: "🦗", url: "/sounds/nature/night-crickets.mp3" },
  { id: "fireplace", category: "nature", label: "Fireplace", vn: "Lò sưởi", icon: "🪵", url: "/sounds/nature/fireplace.mp3" },
]

const rain: SoundItem[] = [
  { id: "heavy-rain", category: "rain", label: "Heavy Rain", vn: "Mưa lớn", icon: "🌧️", url: "/sounds/rain/heavy-rain.mp3" },
  { id: "light-rain", category: "rain", label: "Light Rain", vn: "Mưa nhỏ", icon: "🌦️", url: "/sounds/rain/light-rain.mp3" },
  { id: "rain-on-leaves", category: "rain", label: "Rain on Leaves", vn: "Mưa trên lá", icon: "🍃", url: "/sounds/rain/rain-on-leaves.mp3" },
  { id: "rain-on-window", category: "rain", label: "Rain on Window", vn: "Mưa trên cửa sổ", icon: "🪟", url: "/sounds/rain/rain-on-window.mp3" },
  { id: "thunder", category: "rain", label: "Thunder", vn: "Sấm", icon: "⛈️", url: "/sounds/rain/thunder.mp3" },
]

const noise: SoundItem[] = [
  { id: "white-noise", category: "noise", label: "White Noise", vn: "Tiếng ồn trắng", icon: "⬜", url: "/sounds/noise/white-noise.mp3" },
  { id: "brown-noise", category: "noise", label: "Brown Noise", vn: "Tiếng ồn nâu", icon: "🟫", url: "/sounds/noise/brown-noise.mp3" },
  { id: "pink-noise", category: "noise", label: "Pink Noise", vn: "Tiếng ồn hồng", icon: "🩷", url: "/sounds/noise/pink-noise.mp3" },
]

const study: SoundItem[] = [
  { id: "library", category: "study", label: "Library", vn: "Thư viện", icon: "📚", url: "/sounds/study/library.mp3" },
  { id: "coffee-shop", category: "study", label: "Coffee Shop", vn: "Quán cà phê", icon: "☕", url: "/sounds/study/coffee-shop.mp3" },
  { id: "coworking", category: "study", label: "Coworking", vn: "Không gian làm việc", icon: "💻", url: "/sounds/study/coworking.mp3" },
]

const cozy: SoundItem[] = [
  { id: "clock", category: "cozy", label: "Clock", vn: "Đồng hồ", icon: "🕐", url: "/sounds/cozy/clock.mp3" },
  { id: "singing-bowl", category: "cozy", label: "Singing Bowl", vn: "Chén hát", icon: "🔔", url: "/sounds/cozy/singing-bowl.mp3" },
  { id: "vinyl-effect", category: "cozy", label: "Vinyl Effect", vn: "Đĩa than", icon: "💿", url: "/sounds/cozy/vinyl-effect.mp3" },
  { id: "wind-chimes", category: "cozy", label: "Wind Chimes", vn: "Chuông gió", icon: "🎐", url: "/sounds/cozy/wind-chimes.mp3" },
  { id: "cat-purring", category: "cozy", label: "Cat Purring", vn: "Mèo kêu", icon: "🐱", url: "/sounds/cozy/cat-purring.mp3" },
]

const transport: SoundItem[] = [
  { id: "airplane", category: "transport", label: "Airplane", vn: "Máy bay", icon: "✈️", url: "/sounds/transport/airplane.mp3" },
  { id: "inside-a-train", category: "transport", label: "Inside a Train", vn: "Trong tàu hỏa", icon: "🚂", url: "/sounds/transport/inside-a-train.mp3" },
  { id: "submarine", category: "transport", label: "Submarine", vn: "Tàu ngầm", icon: "🚢", url: "/sounds/transport/submarine.mp3" },
  { id: "train", category: "transport", label: "Train", vn: "Tàu hỏa", icon: "🚆", url: "/sounds/transport/train.mp3" },
]

const city: SoundItem[] = [
  { id: "busy-street", category: "city", label: "Busy Street", vn: "Đường đông", icon: "🏙️", url: "/sounds/city/busy-street.mp3" },
  { id: "crowd", category: "city", label: "Crowd", vn: "Đám đông", icon: "👥", url: "/sounds/city/crowd.mp3" },
  { id: "traffic", category: "city", label: "Traffic", vn: "Giao thông", icon: "🚗", url: "/sounds/city/traffic.mp3" },
]

const machine: SoundItem[] = [
  { id: "ceiling-fan", category: "machine", label: "Ceiling Fan", vn: "Quạt trần", icon: "🌀", url: "/sounds/machine/ceiling-fan.mp3" },
  { id: "keyboard", category: "machine", label: "Keyboard", vn: "Bàn phím", icon: "⌨️", url: "/sounds/machine/keyboard.mp3" },
  { id: "typewriter", category: "machine", label: "Typewriter", vn: "Máy viết chữ", icon: "📝", url: "/sounds/machine/typewriter.mp3" },
]

// Category definitions with display order
export const soundCategories: { key: SoundCategory; label: string; vn: string; sounds: SoundItem[] }[] = [
  { key: 'nature', label: 'Nature', vn: 'Thiên nhiên', sounds: nature },
  { key: 'rain', label: 'Rain', vn: 'Mưa', sounds: rain },
  { key: 'noise', label: 'Noise', vn: 'Tiếng ồn', sounds: noise },
  { key: 'study', label: 'Study', vn: 'Học tập', sounds: study },
  { key: 'cozy', label: 'Cozy', vn: 'Ấm cúng', sounds: cozy },
  { key: 'transport', label: 'Transport', vn: 'Phương tiện', sounds: transport },
  { key: 'city', label: 'City', vn: 'Thành phố', sounds: city },
  { key: 'machine', label: 'Machine', vn: 'Máy móc', sounds: machine },
]

// Alarm sounds
export const alarmSounds: AlarmItem[] = [
  { id: "bell", label: "Bell", vn: "Chuông", url: "/sounds/alarms/bell.mp3" },
  { id: "chime", label: "Chime", vn: "Chuông nhẹ", url: "/sounds/alarms/chime.mp3" },
  { id: "gong", label: "Gong", vn: "Chuông đồng", url: "/sounds/alarms/gong.mp3" },
  { id: "digital", label: "Digital", vn: "Kỹ thuật số", url: "/sounds/alarms/digital.mp3" },
  { id: "soft", label: "Soft", vn: "Nhẹ nhàng", url: "/sounds/alarms/soft.mp3" },
]

// Backward-compatible: flat catalog object for existing code
// soundCatalog.ambient returns all ambient sounds as flat array
export const soundCatalog = {
  get ambient(): ReadonlyArray<SoundItem> {
    return soundCategories.flatMap(c => c.sounds)
  },
  alarms: alarmSounds,
} as const

// Helper functions
export function allAmbientSounds(): ReadonlyArray<SoundItem> {
  return soundCategories.flatMap(c => c.sounds)
}

export function getCategory(category: SoundCategory): ReadonlyArray<SoundItem> {
  return soundCategories.find(c => c.key === category)?.sounds ?? []
}

export function findSound(id: string): SoundItem | undefined {
  return allAmbientSounds().find(s => s.id === id)
}
