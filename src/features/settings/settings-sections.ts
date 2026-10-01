import { Palette, SlidersHorizontal, UserCircle } from '@phosphor-icons/react/dist/ssr'

export const SETTINGS_SECTIONS = [
  { id: 'general', labelKey: 'settings.nav.general', Icon: SlidersHorizontal },
  { id: 'appearance', labelKey: 'settings.nav.appearance', Icon: Palette },
  { id: 'account', labelKey: 'settings.nav.account', Icon: UserCircle },
] as const

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]['id']
