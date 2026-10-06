import { create } from 'zustand';

export const PANEL_IDS = [
  'tasks',
  'sound',
  'scene',
  'timer',
  'stats',
  'arcade',
  'settings',
  'feedback',
  'login',
] as const;
export type PanelId = (typeof PANEL_IDS)[number];

export const isPanelId = (value: unknown): value is PanelId =>
  typeof value === 'string' && (PANEL_IDS as readonly string[]).includes(value);

interface PanelState {
  active: PanelId | null;
}

/** One panel at a time, mirrored in `?panel=` so panels deep-link and Back closes them. */
export const usePanelStore = create<PanelState>(() => ({ active: null }));

// True while the current history entry was pushed by opening a panel in-app;
// closing then steps back instead of leaving a stale `?panel=` entry behind.
let pushedEntry = false;

function urlWithPanel(id: PanelId | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set('panel', id);
  else url.searchParams.delete('panel');
  return url.toString();
}

export function openPanel(id: PanelId) {
  const { active } = usePanelStore.getState();
  if (active === id) return;
  if (active) {
    window.history.replaceState(window.history.state, '', urlWithPanel(id));
  } else {
    window.history.pushState(window.history.state, '', urlWithPanel(id));
    pushedEntry = true;
  }
  usePanelStore.setState({ active: id });
}

export function closePanel() {
  if (!usePanelStore.getState().active) return;
  usePanelStore.setState({ active: null });
  if (pushedEntry) {
    pushedEntry = false;
    window.history.back();
  } else {
    window.history.replaceState(window.history.state, '', urlWithPanel(null));
  }
}

export function togglePanel(id: PanelId) {
  if (usePanelStore.getState().active === id) closePanel();
  else openPanel(id);
}

/** Reads `?panel=` on load and on Back/Forward. */
export function syncPanelFromUrl() {
  const id = new URL(window.location.href).searchParams.get('panel');
  if (!isPanelId(id)) pushedEntry = false;
  usePanelStore.setState({ active: isPanelId(id) ? id : null });
}
