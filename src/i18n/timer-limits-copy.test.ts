// @vitest-environment node
import { describe, expect, it } from 'vitest';
import en from '@/i18n/locales/en.json';
import vi from '@/i18n/locales/vi.json';
import ja from '@/i18n/locales/ja.json';
import { DURATION_LIMITS, DURATION_PRESETS } from '@/components/settings/timer-presets';

/**
 * Landing, FAQ and guide copy quoted the timer limits (focus up to 60 minutes, "run two sessions for
 * 90") long after the app allowed 120 minutes and shipped a 90/20 preset. The numbers now come from
 * the same constants the settings panel uses, so the copy cannot drift again.
 */
const locales = { en, vi, ja } as const;

describe.each(Object.entries(locales))('timer limits in %s copy', (_lang, locale) => {
  const faq = locale.site.faq.q3.a;
  const limits = locale.guide2.rhythm.limits;
  const featureDesc = locale.site.features.timer.desc;

  it('mentions the real maximum for every duration', () => {
    for (const text of [faq, limits]) {
      for (const { max } of Object.values(DURATION_LIMITS)) expect(text).toContain(String(max));
    }
    expect(featureDesc).toContain(String(DURATION_LIMITS.workDuration.max));
  });

  it('does not claim the old 60 minute focus ceiling on the landing page', () => {
    expect(featureDesc).not.toMatch(/\b60\b|60分/);
  });

  it('lists every preset in the FAQ and points to the 90/20 block in the guide', () => {
    for (const p of DURATION_PRESETS) expect(faq).toContain(`${p.workDuration}/${p.shortBreakDuration}`);
    expect(limits).toContain('90/20');
  });
});
