"use client"

export type SoundGroup = "alarms" | "ticks" | "ambient"

export interface SoundItem {
  id: string
  group: SoundGroup
  label: string
  vn?: string
  url: string
  loopRecommended: boolean
}

/**
 * Centralized sound catalog used by settings UI and audio previews.
 * URLs reference assets under /public/sounds to ensure stable paths at runtime.
 */
export const soundCatalog: Record<SoundGroup, ReadonlyArray<SoundItem>> = {
  alarms: [
    { id: "alarm", group: "alarms", label: "Alarm", vn: "Chuông báo", url: "/sounds/alarm.mp3", loopRecommended: false },
    { id: "silence", group: "alarms", label: "Silence", vn: "Im lặng", url: "/sounds/silence.mp3", loopRecommended: false },
  ],
  ticks: [
    { id: "clock", group: "ticks", label: "Clock", vn: "Đồng hồ", url: "/sounds/things/clock.mp3", loopRecommended: true },
    { id: "typewriter", group: "ticks", label: "Typewriter", vn: "Máy viết chữ", url: "/sounds/things/typewriter.mp3", loopRecommended: true },
    { id: "wind-chimes", group: "ticks", label: "Wind Chimes", vn: "Chuông gió", url: "/sounds/things/wind-chimes.mp3", loopRecommended: true },
  ],
  ambient: [
    // Nature
    { id: "campfire", group: "ambient", label: "Campfire", vn: "Lửa trại", url: "/sounds/nature/campfire.mp3", loopRecommended: true },
    { id: "droplets", group: "ambient", label: "Droplets", vn: "Giọt nước", url: "/sounds/nature/droplets.mp3", loopRecommended: true },
    { id: "howling-wind", group: "ambient", label: "Howling Wind", vn: "Gió rít", url: "/sounds/nature/howling-wind.mp3", loopRecommended: true },
    { id: "river", group: "ambient", label: "River", vn: "Dòng sông", url: "/sounds/nature/river.mp3", loopRecommended: true },
    { id: "walk-in-snow", group: "ambient", label: "Walk in Snow", vn: "Đi trong tuyết", url: "/sounds/nature/walk-in-snow.mp3", loopRecommended: true },
    { id: "walk-on-gravel", group: "ambient", label: "Walk on Gravel", vn: "Đi trên sỏi", url: "/sounds/nature/walk-on-gravel.mp3", loopRecommended: true },
    { id: "walk-on-leaves", group: "ambient", label: "Walk on Leaves", vn: "Đi trên lá", url: "/sounds/nature/walk-on-leaves.mp3", loopRecommended: true },
    { id: "waves", group: "ambient", label: "Waves", vn: "Sóng biển", url: "/sounds/nature/waves.mp3", loopRecommended: true },
    { id: "wind-in-trees", group: "ambient", label: "Wind in Trees", vn: "Gió trong cây", url: "/sounds/nature/wind-in-trees.mp3", loopRecommended: true },
    { id: "wind", group: "ambient", label: "Wind", vn: "Gió", url: "/sounds/nature/wind.mp3", loopRecommended: true },

    // Rain
    { id: "heavy-rain", group: "ambient", label: "Heavy Rain", vn: "Mưa lớn", url: "/sounds/rain/heavy-rain.mp3", loopRecommended: true },
    { id: "light-rain", group: "ambient", label: "Light Rain", vn: "Mưa nhỏ", url: "/sounds/rain/light-rain.mp3", loopRecommended: true },
    { id: "rain-on-car-roof", group: "ambient", label: "Rain on Car Roof", vn: "Mưa trên nóc xe", url: "/sounds/rain/rain-on-car-roof.mp3", loopRecommended: true },
    { id: "rain-on-leaves", group: "ambient", label: "Rain on Leaves", vn: "Mưa trên lá", url: "/sounds/rain/rain-on-leaves.mp3", loopRecommended: true },
    { id: "rain-on-tent", group: "ambient", label: "Rain on Tent", vn: "Mưa trên lều", url: "/sounds/rain/rain-on-tent.mp3", loopRecommended: true },
    { id: "rain-on-umbrella", group: "ambient", label: "Rain on Umbrella", vn: "Mưa trên ô", url: "/sounds/rain/rain-on-umbrella.mp3", loopRecommended: true },
    { id: "rain-on-window", group: "ambient", label: "Rain on Window", vn: "Mưa trên cửa sổ", url: "/sounds/rain/rain-on-window.mp3", loopRecommended: true },
    { id: "thunder", group: "ambient", label: "Thunder", vn: "Sấm", url: "/sounds/rain/thunder.mp3", loopRecommended: true },

    // Things
    { id: "boiling-water", group: "ambient", label: "Boiling Water", vn: "Nước sôi", url: "/sounds/things/boiling-water.mp3", loopRecommended: true },
    { id: "bubbles", group: "ambient", label: "Bubbles", vn: "Bọt khí", url: "/sounds/things/bubbles.mp3", loopRecommended: true },
    { id: "ceiling-fan", group: "ambient", label: "Ceiling Fan", vn: "Quạt trần", url: "/sounds/things/ceiling-fan.mp3", loopRecommended: true },
    { id: "keyboard", group: "ambient", label: "Keyboard", vn: "Bàn phím", url: "/sounds/things/keyboard.mp3", loopRecommended: true },
    { id: "paper", group: "ambient", label: "Paper", vn: "Giấy", url: "/sounds/things/paper.mp3", loopRecommended: true },
    { id: "singing-bowl", group: "ambient", label: "Singing Bowl", vn: "Chén hát", url: "/sounds/things/singing-bowl.mp3", loopRecommended: true },
    { id: "tuning-radio", group: "ambient", label: "Tuning Radio", vn: "Lên đài", url: "/sounds/things/tuning-radio.mp3", loopRecommended: true },
    { id: "vinyl-effect", group: "ambient", label: "Vinyl Effect", vn: "Đĩa than", url: "/sounds/things/vinyl-effect.mp3", loopRecommended: true },
    { id: "washing-machine", group: "ambient", label: "Washing Machine", vn: "Máy giặt", url: "/sounds/things/washing-machine.mp3", loopRecommended: true },

    // Transport
    { id: "airplane", group: "ambient", label: "Airplane", vn: "Máy bay", url: "/sounds/transport/airplane.mp3", loopRecommended: true },
    { id: "inside-a-train", group: "ambient", label: "Inside a Train", vn: "Trong tàu hỏa", url: "/sounds/transport/inside-a-train.mp3", loopRecommended: true },
    { id: "rowing-boat", group: "ambient", label: "Rowing Boat", vn: "Thuyền chèo", url: "/sounds/transport/rowing-boat.mp3", loopRecommended: true },
    { id: "sailboat", group: "ambient", label: "Sailboat", vn: "Thuyền buồm", url: "/sounds/transport/sailboat.mp3", loopRecommended: true },
    { id: "submarine", group: "ambient", label: "Submarine", vn: "Tàu ngầm", url: "/sounds/transport/submarine.mp3", loopRecommended: true },
    { id: "train", group: "ambient", label: "Train", vn: "Tàu hỏa", url: "/sounds/transport/train.mp3", loopRecommended: true },

    // Urban
    { id: "busy-street", group: "ambient", label: "Busy Street", vn: "Đường đông", url: "/sounds/urban/busy-street.mp3", loopRecommended: true },
    { id: "crowd", group: "ambient", label: "Crowd", vn: "Đám đông", url: "/sounds/urban/crowd.mp3", loopRecommended: true },
    { id: "highway", group: "ambient", label: "Highway", vn: "Đường cao tốc", url: "/sounds/urban/highway.mp3", loopRecommended: true },
    { id: "road", group: "ambient", label: "Road", vn: "Con đường", url: "/sounds/urban/road.mp3", loopRecommended: true },
    { id: "traffic", group: "ambient", label: "Traffic", vn: "Giao thông", url: "/sounds/urban/traffic.mp3", loopRecommended: true },
  ],
} as const

export function allSounds(): ReadonlyArray<SoundItem> {
  return [
    ...soundCatalog.alarms,
    ...soundCatalog.ticks,
    ...soundCatalog.ambient,
  ]
}

export function getGroup(group: SoundGroup): ReadonlyArray<SoundItem> {
  return soundCatalog[group]
}

export function findSound(id: string): SoundItem | undefined {
  return allSounds().find(s => s.id === id)
}