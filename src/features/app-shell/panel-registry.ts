import {
  ChartBar,
  ChatCircle,
  Clock,
  GameController,
  Gear,
  ImageSquare,
  ListChecks,
  MusicNotes,
  SignIn,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import type { IconTileTone } from '@/components/ui/icon-tile';
import type { PanelId } from './panel-store';

export type PanelMeta = {
  labelKey: string;
  icon: Icon;
  /** Candy colour of the panel's tile in the dock, the command menu and the user menu (spec §7.1). */
  tone: IconTileTone;
  /** Single-letter shortcut (no modifier); omitted for panels reached from menus. */
  hotkey?: string;
};

export const PANELS: Record<PanelId, PanelMeta> = {
  tasks: { labelKey: 'shell.panels.tasks', icon: ListChecks, tone: 'butter', hotkey: 't' },
  sound: { labelKey: 'shell.panels.sound', icon: MusicNotes, tone: 'sky', hotkey: 's' },
  scene: { labelKey: 'shell.panels.scene', icon: ImageSquare, tone: 'lilac', hotkey: 'b' },
  timer: { labelKey: 'shell.panels.timer', icon: Clock, tone: 'mint', hotkey: 'c' },
  stats: { labelKey: 'shell.panels.stats', icon: ChartBar, tone: 'tomato', hotkey: 'h' },
  arcade: { labelKey: 'shell.panels.arcade', icon: GameController, tone: 'peach', hotkey: 'g' },
  settings: { labelKey: 'shell.panels.settings', icon: Gear, tone: 'surface' },
  feedback: { labelKey: 'shell.panels.feedback', icon: ChatCircle, tone: 'sky' },
  login: { labelKey: 'shell.panels.login', icon: SignIn, tone: 'mint' },
};

/** Order of the dock, left to right. */
export const DOCK_PANELS: PanelId[] = ['tasks', 'sound', 'scene', 'timer', 'stats', 'arcade'];
