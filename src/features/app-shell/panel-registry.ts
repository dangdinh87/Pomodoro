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
import type { PanelId } from './panel-store';

export type PanelMeta = {
  labelKey: string;
  icon: Icon;
  /** Single-letter shortcut (no modifier); omitted for panels reached from menus. */
  hotkey?: string;
};

export const PANELS: Record<PanelId, PanelMeta> = {
  tasks: { labelKey: 'shell.panels.tasks', icon: ListChecks, hotkey: 't' },
  sound: { labelKey: 'shell.panels.sound', icon: MusicNotes, hotkey: 's' },
  scene: { labelKey: 'shell.panels.scene', icon: ImageSquare, hotkey: 'b' },
  timer: { labelKey: 'shell.panels.timer', icon: Clock, hotkey: 'c' },
  stats: { labelKey: 'shell.panels.stats', icon: ChartBar, hotkey: 'h' },
  arcade: { labelKey: 'shell.panels.arcade', icon: GameController, hotkey: 'g' },
  settings: { labelKey: 'shell.panels.settings', icon: Gear },
  feedback: { labelKey: 'shell.panels.feedback', icon: ChatCircle },
  login: { labelKey: 'shell.panels.login', icon: SignIn },
};

/** Order of the dock, left to right. */
export const DOCK_PANELS: PanelId[] = ['tasks', 'sound', 'scene', 'timer', 'stats', 'arcade'];
