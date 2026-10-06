import { fetchYouTubeOEmbed, youtubeErrorKey } from '@/lib/youtube-utils';
import { useAudioStore } from '@/stores/audio-store';
import { useYouTubeStore, type YouTubeSource, type YouTubeStatus } from '@/stores/youtube-player-store';

/**
 * The one YouTube player of the app.
 *
 * YouTube's terms require the embedded player to be visible, at least 200x200 px, and not covered. So the
 * iframe is only ever created inside `#youtube-player-slot`, which the mini player card renders
 * (components/audio/youtube/youtube-mini-player.tsx); there is no hidden or off-screen container, and no
 * iframe at all while nothing plays (`stopYouTube` destroys it). State flows out through `useYouTubeStore`
 * from the player's events.
 */
export const YOUTUBE_SLOT_ID = 'youtube-player-slot';
/** YouTube's floor for the player viewport, both ways. The mini player never goes below it. */
export const YOUTUBE_MIN_PX = 200;

const API_SRC = 'https://www.youtube.com/iframe_api';
const API_SCRIPT_ID = 'youtube-iframe-api';
const API_TIMEOUT_MS = 15_000;
const PLAYER_FAILED_KEY = 'audio.youtube.errors.playerFailed';

interface YTPlayer {
  playVideo?: () => void;
  pauseVideo?: () => void;
  stopVideo?: () => void;
  nextVideo?: () => void;
  previousVideo?: () => void;
  loadVideoById?: (videoId: string) => void;
  loadPlaylist?: (options: { list: string; listType: 'playlist' }) => void;
  setVolume?: (volume: number) => void;
  mute?: () => void;
  unMute?: () => void;
  getPlayerState?: () => number;
  getIframe?: () => HTMLIFrameElement | null;
  destroy?: () => void;
}

interface YTNamespace {
  Player: new (target: HTMLElement, options: Record<string, unknown>) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
    /** The live player, read by audio-store's play/pause shortcut. */
    __globalYTPlayer?: YTPlayer | null;
  }
}

// IFrame API player states -> ours. An ended video stays on screen as "paused" (play replays it); inside a
// playlist the next video follows at once, so that state is never seen for long.
const STATE_TO_STATUS: Record<number, YouTubeStatus> = {
  [-1]: 'buffering', // unstarted
  0: 'paused', // ended
  1: 'playing',
  2: 'paused',
  3: 'buffering',
  5: 'paused', // cued: waiting for the person to press play (autoplay refused)
};

let player: YTPlayer | null = null;
let unsubscribeAudio: (() => void) | null = null;
/** Bumped by every play and stop, so a slow API load or slot lookup of an older request gives up. */
let requestId = 0;
let apiPromise: Promise<YTNamespace> | null = null;

function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<YTNamespace>((resolve, reject) => {
    const fail = (reason: string) => {
      apiPromise = null;
      document.getElementById(API_SCRIPT_ID)?.remove();
      reject(new Error(reason));
    };
    const timer = window.setTimeout(() => fail('YouTube API timed out'), API_TIMEOUT_MS);
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer);
      previousReady?.();
      if (window.YT) resolve(window.YT);
      else fail('YouTube API missing after load');
    };
    if (!document.getElementById(API_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = API_SCRIPT_ID;
      script.src = API_SRC;
      script.onerror = () => {
        window.clearTimeout(timer);
        fail('YouTube API script failed to load');
      };
      document.body.appendChild(script);
    }
  });
  return apiPromise;
}

/** The card renders the slot in the same commit that sets the source; give React a few frames to show it. */
async function findSlot(): Promise<HTMLElement | null> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const slot = document.getElementById(YOUTUBE_SLOT_ID);
    if (slot) return slot;
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
  return null;
}

function applyAudioSettings(target: YTPlayer) {
  const { masterVolume, isMuted } = useAudioStore.getState().audioSettings;
  target.setVolume?.(masterVolume);
  if (isMuted) target.mute?.();
  else target.unMute?.();
}

function sourceId(source: YouTubeSource) {
  return source.videoId ? `video-${source.videoId}` : source.listId ? `playlist-${source.listId}` : '';
}

/** Tells the audio store (dock icon, "now playing" title) what is playing; the real title comes from oEmbed. */
function syncAudioStore(source: YouTubeSource, isPlaying: boolean) {
  const audio = useAudioStore.getState();
  const current = audio.currentlyPlaying;
  const id = sourceId(source);
  if (current?.id === id && current.isPlaying === isPlaying && current.type === 'youtube') return;

  const url = source.videoId
    ? `https://www.youtube.com/watch?v=${source.videoId}`
    : `https://www.youtube.com/playlist?list=${source.listId}`;
  // Same video, only the play state changed: keep the title already fetched
  const sameVideo = current?.id === id && current.type === 'youtube';
  const name = sameVideo ? current.name : source.videoId ? 'YouTube Video' : 'YouTube Playlist';

  audio.setCurrentlyPlaying({
    type: 'youtube',
    id,
    name,
    volume: 50,
    isPlaying,
    source: { id, type: 'youtube', name, url, volume: 50, loop: false },
  });

  if (name.startsWith('YouTube')) {
    void fetchYouTubeOEmbed(url).then((data) => {
      const latest = useAudioStore.getState().currentlyPlaying;
      if (data?.title && latest?.id === id && latest.name !== data.title) {
        useAudioStore.getState().setCurrentlyPlaying({ ...latest, name: data.title });
      }
    });
  }
}

function syncAudioPlaying(status: YouTubeStatus) {
  if (status !== 'playing' && status !== 'paused') return;
  const audio = useAudioStore.getState();
  const source = useYouTubeStore.getState().source;
  if (audio.currentlyPlaying?.type === 'youtube') audio.updatePlayingStatus(status === 'playing');
  else if (!audio.currentlyPlaying && source) syncAudioStore(source, status === 'playing');
}

function loadInto(target: YTPlayer, source: YouTubeSource) {
  if (source.listId && !source.videoId) target.loadPlaylist?.({ list: source.listId, listType: 'playlist' });
  else if (source.videoId) target.loadVideoById?.(source.videoId);
  applyAudioSettings(target);
}

/** Plays a video or playlist in the mini player, creating the player on first use. */
export async function playYouTube(source: YouTubeSource): Promise<void> {
  const id = ++requestId;
  useYouTubeStore.setState({ source, status: 'buffering', errorKey: null });
  syncAudioStore(source, true);

  try {
    const YT = await loadApi();
    if (id !== requestId) return;

    if (player) {
      loadInto(player, source);
      return;
    }

    const slot = await findSlot();
    if (id !== requestId) return;
    if (!slot) throw new Error('The mini player is not on screen');

    const mount = document.createElement('div');
    slot.replaceChildren(mount);
    const created: YTPlayer = new YT.Player(mount, {
      width: '100%',
      height: '100%',
      videoId: source.videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        controls: 1,
        playsinline: 1,
        autoplay: 1,
        origin: window.location.origin,
        ...(source.listId && !source.videoId && { list: source.listId, listType: 'playlist' }),
      },
      events: {
        onReady: () => {
          if (created !== player) return;
          applyAudioSettings(created);
          created.playVideo?.();
        },
        onStateChange: (event: { data: number }) => {
          if (created !== player) return;
          const status = STATE_TO_STATUS[event.data] ?? 'paused';
          useYouTubeStore.getState().setStatus(status);
          syncAudioPlaying(status);
        },
        onError: (event: { data: number }) => {
          if (created !== player) return;
          stopYouTube(youtubeErrorKey(event.data));
        },
      },
    });
    player = created;
    window.__globalYTPlayer = created;
    unsubscribeAudio = useAudioStore.subscribe((state, previous) => {
      const next = state.audioSettings;
      const before = previous.audioSettings;
      if (next.masterVolume !== before.masterVolume || next.isMuted !== before.isMuted) applyAudioSettings(created);
    });
  } catch (error) {
    if (id !== requestId) return;
    console.error('Failed to start the YouTube player:', error);
    stopYouTube(PLAYER_FAILED_KEY);
  }
}

export function toggleYouTubePlayback(): void {
  if (!player) return;
  if (player.getPlayerState?.() === 1) player.pauseVideo?.();
  else player.playVideo?.();
}

export function nextYouTubeVideo(): void {
  player?.nextVideo?.();
}

export function previousYouTubeVideo(): void {
  player?.previousVideo?.();
}

/**
 * Stops playback and removes the player (and its iframe) from the page. `errorKey` makes the mini player
 * announce why, with a toast.
 */
export function stopYouTube(errorKey?: string): void {
  requestId += 1;
  unsubscribeAudio?.();
  unsubscribeAudio = null;

  const current = player;
  player = null;
  window.__globalYTPlayer = null;
  try {
    // An iframe that already left the page (its card unmounted) cannot be told to stop, and YouTube warns
    // "not attached to the DOM" if asked; destroying it is still fine.
    if (current?.getIframe?.()?.isConnected !== false) current?.stopVideo?.();
    current?.destroy?.();
  } catch {
    // The player may already be gone (tab closed it, API reloaded)
  }
  document.getElementById(YOUTUBE_SLOT_ID)?.replaceChildren();

  if (errorKey) useYouTubeStore.getState().fail(errorKey);
  else useYouTubeStore.getState().reset();

  const audio = useAudioStore.getState();
  if (audio.currentlyPlaying?.type === 'youtube') audio.clearCurrentlyPlaying();
}
