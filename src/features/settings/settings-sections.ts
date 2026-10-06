import { Palette, SlidersHorizontal, UserCircle } from '@phosphor-icons/react/dist/ssr'
import type { IconTileTone } from '@/components/ui/icon-tile'

export const SETTINGS_SECTIONS = [
  { id: 'general', labelKey: 'settings.nav.general', Icon: SlidersHorizontal, tone: 'butter' },
  { id: 'appearance', labelKey: 'settings.nav.appearance', Icon: Palette, tone: 'lilac' },
  { id: 'account', labelKey: 'settings.nav.account', Icon: UserCircle, tone: 'sky' },
] as const satisfies readonly { id: string; labelKey: string; Icon: unknown; tone: IconTileTone }[]

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]['id']
