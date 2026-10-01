import {
  Fire, Drop, Waves, Leaf, Wind, Bird, Bug, Campfire, CloudRain, CloudLightning, Lightning, Brain,
  Books, Buildings, Clock, BellRinging, Disc, Cat, Airplane, TrainSimple, Train, Anchor, City,
  UsersThree, Car, Fan, Keyboard, Printer, Coffee, Moon, Tree, MusicNotes, Waveform, Cloud,
  AppWindow, BowlFood,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'

const SOUND_ICONS: Record<string, Icon> = {
  campfire: Campfire,
  droplets: Drop,
  river: Waves,
  waves: Waves,
  'wind-in-trees': Leaf,
  wind: Wind,
  birds: Bird,
  'night-crickets': Bug,
  fireplace: Fire,
  'heavy-rain': CloudLightning,
  'light-rain': CloudRain,
  'rain-on-leaves': Leaf,
  'rain-on-window': AppWindow,
  thunder: Lightning,
  'white-noise': Waveform,
  'brown-noise': Waveform,
  'pink-noise': Waveform,
  library: Books,
  'coffee-shop': Coffee,
  coworking: Buildings,
  clock: Clock,
  'singing-bowl': BowlFood,
  'vinyl-effect': Disc,
  'wind-chimes': BellRinging,
  'cat-purring': Cat,
  airplane: Airplane,
  'inside-a-train': TrainSimple,
  submarine: Anchor,
  train: Train,
  'busy-street': City,
  crowd: UsersThree,
  traffic: Car,
  'ceiling-fan': Fan,
  keyboard: Keyboard,
  typewriter: Printer,
}

const PRESET_ICONS: Record<string, Icon> = {
  cafe: Coffee,
  rain: CloudRain,
  forest: Tree,
  ocean: Waves,
  'train-ride': TrainSimple,
  night: Moon,
  library: Books,
  cozy: Cat,
  'deep-focus': Brain,
}

export const getSoundIcon = (id: string): Icon => SOUND_ICONS[id] ?? Cloud
export const getPresetIcon = (id: string): Icon => PRESET_ICONS[id] ?? MusicNotes
