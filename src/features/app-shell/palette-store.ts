import { create } from 'zustand';

/** Whether the command palette (⌘K) is open. Its own module so the palette's code can load on demand. */
export const usePaletteStore = create<{ open: boolean }>(() => ({ open: false }));
export const setPaletteOpen = (open: boolean) => usePaletteStore.setState({ open });
export const openCommandPalette = () => setPaletteOpen(true);
