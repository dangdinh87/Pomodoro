import { create } from 'zustand';

export interface YouTubeSource {
  videoId?: string;
  listId?: string;
  isChannel?: boolean;
}

export type YouTubeStatus = 'stopped' | 'playing' | 'paused' | 'buffering';

interface YouTubePlayerStore {
  status: YouTubeStatus;
  /** What is loaded in the player. `null` = no player exists (and no iframe in the page). */
  source: YouTubeSource | null;
  /** Compact card. The video stays on screen at YouTube's minimum size, so collapsing never pauses it. */
  collapsed: boolean;
  /** i18n key of the reason playback was stopped; the mini player shows it as a toast, then clears it. */
  errorKey: string | null;
  setStatus: (status: YouTubeStatus) => void;
  setSource: (source: YouTubeSource | null) => void;
  setCollapsed: (collapsed: boolean) => void;
  fail: (errorKey: string) => void;
  clearError: () => void;
  reset: () => void;
}

const idle = { status: 'stopped', source: null, errorKey: null } as const;

/**
 * Playback state of the YouTube player, shared by the Sounds panel (paste link, library) and the mini player
 * (the card on screen). The player itself lives in `lib/audio/youtube-controller.ts`; it writes here from the
 * IFrame API events, so there is no polling.
 */
export const useYouTubeStore = create<YouTubePlayerStore>()((set) => ({
  ...idle,
  collapsed: false,
  setStatus: (status) => set({ status }),
  setSource: (source) => set({ source }),
  setCollapsed: (collapsed) => set({ collapsed }),
  fail: (errorKey) => set({ ...idle, errorKey }),
  clearError: () => set({ errorKey: null }),
  reset: () => set({ ...idle }),
}));
