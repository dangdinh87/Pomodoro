import { readFileSync } from 'node:fs';
import path from 'node:path';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useYouTubePlayer } from '@/hooks/use-youtube-player';
import { YOUTUBE_MIN_PX, YOUTUBE_SLOT_ID, stopYouTube } from '@/lib/audio/youtube-controller';
import { useAudioStore } from '@/stores/audio-store';
import { useYouTubeStore } from '@/stores/youtube-player-store';
import { YouTubeMiniPlayer } from './youtube-mini-player';

vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key }),
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn() } }));
vi.mock('@/lib/youtube-utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/youtube-utils')>()),
  fetchYouTubeOEmbed: vi.fn().mockResolvedValue(null),
}));
// The audio store talks to the real audio manager (Audio elements): out of scope here
vi.mock('@/lib/audio/audio-manager', () => {
  const manager = { setVolume: vi.fn(), setMute: vi.fn(), pause: vi.fn(), resume: vi.fn(), stop: vi.fn() };
  return { audioManager: manager, default: manager };
});

/** Just enough of the IFrame API: like the real one, the target element is replaced by an iframe. */
class FakePlayer {
  static instances: FakePlayer[] = [];
  state = -1;
  iframe: HTMLIFrameElement;
  events: Record<string, (event: { data: number }) => void>;
  options: Record<string, unknown>;

  constructor(target: HTMLElement, options: Record<string, unknown>) {
    this.options = options;
    this.events = options.events as FakePlayer['events'];
    this.iframe = document.createElement('iframe');
    this.iframe.src = 'https://www.youtube.com/embed/test';
    target.replaceWith(this.iframe);
    FakePlayer.instances.push(this);
    queueMicrotask(() => this.events.onReady?.({ data: 0 }));
  }

  emit(state: number) {
    this.state = state;
    this.events.onStateChange?.({ data: state });
  }

  getPlayerState = vi.fn(() => this.state);
  playVideo = vi.fn(() => this.emit(1));
  pauseVideo = vi.fn(() => this.emit(2));
  stopVideo = vi.fn();
  nextVideo = vi.fn();
  previousVideo = vi.fn();
  loadVideoById = vi.fn();
  loadPlaylist = vi.fn();
  setVolume = vi.fn();
  mute = vi.fn();
  unMute = vi.fn();
  destroy = vi.fn(() => this.iframe.remove());
  getIframe = () => this.iframe;
}

const lastPlayer = () => FakePlayer.instances[FakePlayer.instances.length - 1];

/** Renders the card and starts a video through the same hook the Sounds panel uses. */
async function startPlaying(source: { videoId?: string; listId?: string } = { videoId: 'lofi123' }) {
  render(<YouTubeMiniPlayer />);
  const { result } = renderHook(() => useYouTubePlayer());
  await act(async () => {
    await result.current.play(source);
  });
  await act(async () => {}); // onReady
  return result;
}

beforeEach(() => {
  FakePlayer.instances = [];
  (window as unknown as { YT: unknown }).YT = { Player: FakePlayer };
  useYouTubeStore.getState().reset();
  useYouTubeStore.setState({ collapsed: false });
  useAudioStore.setState({ currentlyPlaying: null });
  vi.clearAllMocks();
});

afterEach(() => {
  act(() => stopYouTube());
});

describe('YouTube mini player: the video is always on screen', () => {
  it('renders nothing, and no iframe exists, while nothing plays', () => {
    render(<YouTubeMiniPlayer />);

    expect(screen.queryByTestId('youtube-mini-player')).not.toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('creates the iframe inside the visible card: no hidden or off-screen container', async () => {
    await startPlaying();

    const card = screen.getByTestId('youtube-mini-player');
    const iframe = document.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(card).toContainElement(iframe);
    expect(iframe?.parentElement).toBe(document.getElementById(YOUTUBE_SLOT_ID));

    // the old hidden container (display:none at -9999px) is gone for good
    expect(document.getElementById('youtube-global-container')).toBeNull();
    for (let node = iframe as HTMLElement | null; node && node !== document.body; node = node.parentElement) {
      expect(node.hidden).toBe(false);
      expect(node.style.display).not.toBe('none');
      expect(node.style.left).not.toBe('-9999px');
    }
  });

  it('keeps the video area at YouTube minimum size, expanded and collapsed', async () => {
    await startPlaying();
    const slot = screen.getByTestId('youtube-player-slot');
    const iframeBefore = document.querySelector('iframe');
    expect(slot.style.minWidth).toBe(`${YOUTUBE_MIN_PX}px`);
    expect(slot.style.minHeight).toBe(`${YOUTUBE_MIN_PX}px`);
    // a border or padding on the slot would shrink the iframe below the minimum (border-box sizing)
    expect(slot.className).not.toMatch(/(^|\s)(border|p[xytblr]?-)/);

    fireEvent.click(screen.getByRole('button', { name: 'audio.youtube.mini.collapse' }));

    const card = screen.getByTestId('youtube-mini-player');
    expect(card).toHaveAttribute('data-collapsed', 'true');
    expect(slot.style.minWidth).toBe(`${YOUTUBE_MIN_PX}px`);
    expect(slot.style.minHeight).toBe(`${YOUTUBE_MIN_PX}px`);
    // same iframe, same playback: collapsing neither moves the iframe (which would reload it) nor pauses
    expect(document.querySelector('iframe')).toBe(iframeBefore);
    expect(lastPlayer().pauseVideo).not.toHaveBeenCalled();
    expect(useYouTubeStore.getState().status).toBe('playing');

    fireEvent.click(screen.getByRole('button', { name: 'audio.youtube.mini.expand' }));
    expect(card).toHaveAttribute('data-collapsed', 'false');
  });

  it('refuses to play without a visible card instead of falling back to a hidden iframe', async () => {
    const { result } = renderHook(() => useYouTubePlayer()); // no <YouTubeMiniPlayer /> on the page
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await result.current.play({ videoId: 'lofi123' });
    });

    expect(document.querySelector('iframe')).toBeNull();
    expect(FakePlayer.instances).toHaveLength(0);
    expect(useYouTubeStore.getState().status).toBe('stopped');
    expect(useYouTubeStore.getState().errorKey).toBe('audio.youtube.errors.playerFailed');
  });
});

describe('YouTube mini player: placement', () => {
  // jsdom has no layout or media queries, so the placement contract is the class list; the real check
  // (elementFromPoint on the Start button at 360, 390 and 768px with a video playing) is a browser probe.
  const classes = async () => {
    await startPlaying();
    return screen.getByTestId('youtube-mini-player').className.split(/\s+/);
  };

  it('floats only from md up; below md it is in the flow, so it cannot sit on the timer controls', async () => {
    const list = await classes();
    expect(list).toContain('md:fixed');
    expect(list).toContain('max-md:relative');
    // no unconditional fixed/absolute and no mobile offsets (they would shift the in-flow card)
    expect(list).not.toContain('fixed');
    expect(list).not.toContain('absolute');
    expect(list.filter((c) => /^(left|right|top|bottom)-/.test(c))).toEqual([]);
  });

  it('keeps the card inside the timer card width on a phone, with the 200px minimum on its own', async () => {
    const list = await classes();
    expect(list).toContain('max-md:w-[min(100%,23rem)]');
    const slot = screen.getByTestId('youtube-player-slot');
    expect(slot.style.minWidth).toBe(`${YOUTUBE_MIN_PX}px`);
    expect(slot.style.minHeight).toBe(`${YOUTUBE_MIN_PX}px`);
  });

  it('is mounted by the timer stage (where the flow is), not by the app providers', () => {
    const root = path.resolve(import.meta.dirname, '../../../..');
    const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
    expect(read('src/features/timer/components/enhanced-timer.tsx')).toContain('<YouTubeMiniPlayer />');
    expect(read('src/components/providers/app-providers.tsx')).not.toContain('YouTubeMiniPlayer');
  });
});

describe('YouTube mini player: errors and closing', () => {
  it('on a player error: toast with the reason, playback stopped, card and iframe gone', async () => {
    await startPlaying();
    const player = lastPlayer();

    await act(async () => {
      player.events.onError({ data: 101 }); // the owner does not allow embedding
    });

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('audio.youtube.errors.embedBlocked');
    expect(useYouTubeStore.getState()).toMatchObject({ status: 'stopped', source: null });
    expect(player.destroy).toHaveBeenCalled();
    expect(screen.queryByTestId('youtube-mini-player')).not.toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
    expect(useAudioStore.getState().currentlyPlaying).toBeNull();
  });

  it('closing stops playback and removes the player', async () => {
    await startPlaying();
    const player = lastPlayer();
    expect(useAudioStore.getState().currentlyPlaying?.type).toBe('youtube');

    fireEvent.click(screen.getByRole('button', { name: 'audio.youtube.mini.close' }));

    expect(player.stopVideo).toHaveBeenCalled();
    expect(player.destroy).toHaveBeenCalled();
    expect(useYouTubeStore.getState()).toMatchObject({ status: 'stopped', source: null });
    expect(useAudioStore.getState().currentlyPlaying).toBeNull();
    expect(screen.queryByTestId('youtube-mini-player')).not.toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
    expect(toast.error).not.toHaveBeenCalled(); // closing is not an error
  });

  it('can play again after closing (a fresh iframe in a fresh card)', async () => {
    const result = await startPlaying();
    fireEvent.click(screen.getByRole('button', { name: 'audio.youtube.mini.close' }));

    await act(async () => {
      await result.current.play({ videoId: 'second' });
    });

    expect(FakePlayer.instances).toHaveLength(2);
    expect(screen.getByTestId('youtube-mini-player')).toContainElement(document.querySelector('iframe'));
  });
});

describe('YouTube mini player: the page tree is replaced while it plays', () => {
  // Switching language (router.push to /vi) re-creates the whole [lang] tree and leaving (main) for
  // /guide drops its layout: the card, its slot and the iframe leave the page with it.
  it('stops the player when the card unmounts, so no state claims playback with no iframe', async () => {
    const view = render(<YouTubeMiniPlayer />);
    const { result } = renderHook(() => useYouTubePlayer());
    await act(async () => {
      await result.current.play({ videoId: 'lofi123' });
    });
    await act(async () => {}); // onReady
    const player = lastPlayer();
    expect(useYouTubeStore.getState().status).toBe('playing');

    view.unmount();

    expect(player.destroy).toHaveBeenCalled();
    // the iframe left the page with the card: calling into it only makes YouTube warn "not attached to the DOM"
    expect(player.stopVideo).not.toHaveBeenCalled();
    expect(useYouTubeStore.getState()).toMatchObject({ status: 'stopped', source: null });
    expect(useAudioStore.getState().currentlyPlaying).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
    expect(toast.error).not.toHaveBeenCalled(); // not a failure, nothing to apologise for
  });

  it('the new tree shows no dead Pause button', async () => {
    const first = render(<YouTubeMiniPlayer />);
    const { result } = renderHook(() => useYouTubePlayer());
    await act(async () => {
      await result.current.play({ videoId: 'lofi123' });
    });
    await act(async () => {});

    first.unmount(); // language switch: old tree out ...
    render(<YouTubeMiniPlayer />); // ... fresh tree in

    expect(screen.queryByTestId('youtube-mini-player')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'common.pause' })).not.toBeInTheDocument();
  });

  it('can play again in the new tree', async () => {
    const first = render(<YouTubeMiniPlayer />);
    const { result } = renderHook(() => useYouTubePlayer());
    await act(async () => {
      await result.current.play({ videoId: 'lofi123' });
    });
    await act(async () => {});
    first.unmount();
    render(<YouTubeMiniPlayer />);

    await act(async () => {
      await result.current.play({ videoId: 'again' });
    });

    expect(FakePlayer.instances).toHaveLength(2);
    expect(screen.getByTestId('youtube-mini-player')).toContainElement(document.querySelector('iframe'));
  });
});

describe('YouTube mini player: controls', () => {
  it('toggles play and pause', async () => {
    await startPlaying();
    const player = lastPlayer();
    expect(screen.getByRole('button', { name: 'common.pause' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'common.pause' }));
    expect(player.pauseVideo).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'common.play' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'common.play' }));
    expect(player.playVideo).toHaveBeenCalledTimes(2); // once on ready, once now
  });

  it('follows the player when it is paused from YouTube own controls', async () => {
    await startPlaying();

    await act(async () => lastPlayer().emit(2));

    expect(useYouTubeStore.getState().status).toBe('paused');
    expect(useAudioStore.getState().currentlyPlaying?.isPlaying).toBe(false);
  });

  it('has no previous and next for a single video', async () => {
    await startPlaying({ videoId: 'single' });

    expect(screen.queryByRole('button', { name: 'audio.youtube.mini.nextVideo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'audio.youtube.mini.previousVideo' })).not.toBeInTheDocument();
  });

  it('has previous and next for a playlist', async () => {
    await startPlaying({ listId: 'PLabc' });
    fireEvent.click(screen.getByRole('button', { name: 'audio.youtube.mini.nextVideo' }));
    fireEvent.click(screen.getByRole('button', { name: 'audio.youtube.mini.previousVideo' }));

    expect(lastPlayer().nextVideo).toHaveBeenCalledTimes(1);
    expect(lastPlayer().previousVideo).toHaveBeenCalledTimes(1);
    expect(lastPlayer().options.playerVars).toMatchObject({ list: 'PLabc', listType: 'playlist' });
  });

  it('follows the master volume and mute of the audio store', async () => {
    await startPlaying();
    const player = lastPlayer();

    await act(async () => {
      useAudioStore.setState({ audioSettings: { ...useAudioStore.getState().audioSettings, masterVolume: 30 } });
    });
    expect(player.setVolume).toHaveBeenLastCalledWith(30);

    await act(async () => {
      useAudioStore.setState({ audioSettings: { ...useAudioStore.getState().audioSettings, isMuted: true } });
    });
    expect(player.mute).toHaveBeenCalled();
  });
});
