import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { soundCategories } from '@/lib/audio/sound-catalog';
import { useAudioStore } from '@/stores/audio-store';
import { AudioSidebar } from './audio-sidebar';
import { SoundListCategory } from './sound-list-category';

// The panes themselves are covered elsewhere; here only the sidebar chrome and the mixer rows matter.
vi.mock('./ambient-mixer', () => ({ AmbientMixer: () => <button>mixer-control</button> }));
vi.mock('./youtube/youtube-pane', () => ({ default: () => <button>youtube-control</button> }));

const rain = soundCategories.find((c) => c.key === 'rain')!;

const renderRain = (lang: Lang = 'en') =>
  render(
    <I18nProvider initialLang={lang}>
      <SoundListCategory categoryKey="rain" sounds={rain.sounds} />
    </I18nProvider>,
  );

beforeEach(() => {
  useAudioStore.setState({ activeAmbientSounds: [] });
});

describe('mixer rows', () => {
  it('give every slider a name and a spoken value ("Light rain 40%"), "off" when idle', () => {
    useAudioStore.setState({ activeAmbientSounds: [{ id: 'light-rain', volume: 40 }] });
    renderRain();

    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(rain.sounds.length);
    sliders.forEach((slider) => expect(slider).toHaveAccessibleName());

    const light = screen.getByRole('slider', { name: 'Light rain' });
    expect(light).toHaveAttribute('aria-valuetext', 'Light rain 40%');
    expect(light).toHaveAttribute('aria-valuenow', '40');

    const heavy = screen.getByRole('slider', { name: 'Heavy rain' });
    expect(heavy).toHaveAttribute('aria-valuetext', 'Heavy rain, off');
  });

  it('speaks the value in Vietnamese too', () => {
    useAudioStore.setState({ activeAmbientSounds: [{ id: 'light-rain', volume: 65 }] });
    renderRain('vi');

    const spoken = screen.getAllByRole('slider').map((s) => s.getAttribute('aria-valuetext'));
    expect(spoken.some((text) => text?.endsWith(' 65%'))).toBe(true);
    expect(spoken.some((text) => text?.endsWith(', đang tắt'))).toBe(true);
  });

  it('the icon tile is a named toggle that reflects the row state', () => {
    useAudioStore.setState({ activeAmbientSounds: [{ id: 'light-rain', volume: 40 }] });
    renderRain();

    expect(screen.getByRole('button', { name: 'Light rain' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Heavy rain' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('colours the active tile with the category candy, and leaves idle ones neutral', () => {
    useAudioStore.setState({ activeAmbientSounds: [{ id: 'light-rain', volume: 40 }] });
    renderRain();

    const tone = (name: string) =>
      screen.getByRole('button', { name }).querySelector('[data-tone]')?.getAttribute('data-tone');
    expect(tone('Light rain')).toBe('sky');
    expect(tone('Heavy rain')).toBe('surface');
  });
});

describe('master volume', () => {
  const renderSidebar = () =>
    render(
      <I18nProvider initialLang="en">
        <AudioSidebar open onOpenChange={() => {}} />
      </I18nProvider>,
    );

  beforeEach(() => {
    useAudioStore.setState((s) => ({ audioSettings: { ...s.audioSettings, masterVolume: 50, isMuted: false } }));
  });

  it('has a labelled slider that speaks its value, and a named mute button', () => {
    renderSidebar();

    const dialog = screen.getByRole('dialog');
    const slider = within(dialog).getByRole('slider', { name: 'Master volume' });
    expect(slider).toHaveAttribute('aria-valuetext', 'Master volume 50%');
    expect(within(dialog).getByRole('button', { name: 'Mute all sound' })).toBeInTheDocument();
  });

  it('muting changes the button name and the spoken value', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Mute all sound' }));

    expect(within(dialog).getByRole('button', { name: 'Unmute' })).toBeInTheDocument();
    expect(within(dialog).getByRole('slider', { name: 'Master volume' })).toHaveAttribute(
      'aria-valuetext',
      'Master volume, muted',
    );
  });
});

describe('sound panel tabs', () => {
  const renderSidebar = () =>
    render(
      <I18nProvider initialLang="en">
        <AudioSidebar open onOpenChange={() => {}} />
      </I18nProvider>,
    );
  const paneOf = (control: string) => screen.getByText(control, { selector: 'button' }).closest('[data-pane]')!;

  it('the tab that is not shown is inert and hidden from assistive tech (no invisible Tab stops)', () => {
    useAudioStore.setState((s) => ({ audioSettings: { ...s.audioSettings, activeSource: 'ambient' } }));
    renderSidebar();

    expect(paneOf('mixer-control')).not.toHaveAttribute('inert');
    expect(paneOf('mixer-control')).toHaveAttribute('aria-hidden', 'false');
    expect(paneOf('youtube-control')).toHaveAttribute('inert');
    expect(paneOf('youtube-control')).toHaveAttribute('aria-hidden', 'true');
    // the screen reader tree only has the controls of the shown tab
    expect(screen.getByRole('button', { name: 'mixer-control' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'youtube-control' })).not.toBeInTheDocument();
  });

  it('switching tabs swaps which pane is inert', async () => {
    useAudioStore.setState((s) => ({ audioSettings: { ...s.audioSettings, activeSource: 'ambient' } }));
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByRole('tab', { name: 'YouTube' }));

    expect(paneOf('youtube-control')).not.toHaveAttribute('inert');
    expect(paneOf('mixer-control')).toHaveAttribute('inert');
    expect(screen.queryByRole('button', { name: 'mixer-control' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'youtube-control' })).toBeInTheDocument();
  });
});
