import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '../../../..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');

// The timer card scales with the viewport height through `--stage-*` variables declared on `.stage-card`
// (globals.css). The live card and the server skeleton must read the same ones, or the skeleton and the app
// differ in height and mounting the app shifts the page. jsdom has no layout, so this guards the contract.
const LIVE = [
  'src/features/timer/components/enhanced-timer.tsx',
  'src/features/timer/components/timer-mascot.tsx',
  'src/features/timer/components/timer-mode-selector.tsx',
  'src/features/timer/components/timer-clock-display.tsx',
  'src/features/timer/components/timer-controls.tsx',
  'src/features/timer/components/clocks/digital-clock.tsx',
];
const SKELETON = 'src/features/app-shell/app-home-skeleton.tsx';

const used = (source: string) => new Set(source.match(/--stage-[a-z-]+/g) ?? []);

describe('timer stage sizing', () => {
  const css = read('src/app/globals.css');
  const block = css.slice(css.indexOf('.stage-card {'), css.indexOf('[data-chrome] {'));
  const declared = new Set(block.match(/(--stage-[a-z-]+):/g)?.map((name) => name.slice(0, -1)));

  it('declares every variable the live card and the skeleton read', () => {
    for (const file of [...LIVE, SKELETON]) {
      for (const name of used(read(file))) {
        // --stage-digits has a fallback in digital-clock (the settings gallery has no stage); the rest must exist
        expect(declared, `${name} in ${file}`).toContain(name);
      }
    }
  });

  it('puts the skeleton and the live card on the same stage-card frame', () => {
    expect(read(SKELETON)).toContain('stage-card');
    expect(read('src/features/timer/components/enhanced-timer.tsx')).toContain('stage-card');
  });

  it('reads the same variables in the skeleton as the live card does for its spacing and sizes', () => {
    const live = new Set(LIVE.flatMap((file) => [...used(read(file))]));
    const skeleton = used(read(SKELETON));
    for (const name of live) expect(skeleton, `${name} missing in the skeleton`).toContain(name);
  });

  // jsdom has no hit-testing, so the real check (elementFromPoint on the centre of each chip at 768-1920px, all
  // three locales) is a browser probe; this keeps the two pieces of the fix from being dropped by accident.
  it('keeps the mode chips clickable: chip row above the clock, clock digits ignore the pointer', () => {
    expect(read('src/features/timer/components/enhanced-timer.tsx')).toMatch(/data-chrome className="[^"]*\brelative\b[^"]*\bz-10\b/);
    expect(read('src/features/timer/components/clocks/clock-digits.tsx')).toContain('pointer-events-none');
  });

  it('hands the language bar height back, for the live stage and the skeleton alike', () => {
    expect(css).toMatch(/section\[data-timer\],\s*\[data-stage-skeleton\]\s*\{\s*min-height: calc\(100dvh - var\(--lang-banner-h, 0px\)\)/);
    expect(read(SKELETON)).toContain('data-stage-skeleton');
    expect(read('src/features/app-shell/app-home.tsx')).toMatch(/<section[^>]*data-timer/s);
    expect(block).toContain('--lang-banner-h');
  });
});
