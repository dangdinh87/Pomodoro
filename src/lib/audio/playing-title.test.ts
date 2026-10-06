import { playingTitle } from './playing-title';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';

const translator = (dict: typeof en) => (key: string, vars?: Record<string, string | number>) => {
  const template = key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], dict);
  return String(template).replace(/\{(\w+)\}/g, (_m, k) => String(vars?.[k]));
};

describe('playingTitle', () => {
  const mix = { id: 'mixed-ambient', name: 'Mixed Ambient', count: 3 };

  it('names a mix with its size in every language', () => {
    expect(playingTitle(mix, translator(en))).toBe('Mixed ambient (3 sounds)');
    expect(playingTitle(mix, translator(vi as typeof en))).toBe('Âm thanh hỗn hợp (3 âm)');
    expect(playingTitle(mix, translator(ja as typeof en))).toBe('ミックス環境音（3種類）');
  });

  it('uses the sound name for a single sound or YouTube video', () => {
    expect(playingTitle({ id: 'light-rain', name: 'Light Rain' }, translator(en))).toBe('Light Rain');
  });

  it('is empty when nothing plays', () => {
    expect(playingTitle(null, translator(en))).toBe('');
  });
});
