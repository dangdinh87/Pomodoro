'use client';

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Cube } from '@phosphor-icons/react/dist/ssr';
import { useI18n } from '@/contexts/i18n-context';
import { GalleryCard } from '@/features/scenes/components/scene-card';
import { useTimerStore } from '@/stores/timer-store';
import { AnalogClock } from './analog-clock';
import { DigitalClock } from './digital-clock';
import { FlipClock } from './flip-clock';
import { ThreeClock } from './three-clock';
import { CLOCK_STYLES, type SelectableClockType } from './clock-registry';
import { formatClock } from './clock-math';

const TILE_HEIGHT = '7rem';

/** Shrinks the real (viewport-sized) 2D clock to whatever box it is placed in. */
function ScaleToFit({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const w = i.offsetWidth;
      const h = i.offsetHeight;
      if (!w || !h) return;
      setScale(Math.min(1, (o.clientWidth * 0.92) / w, (o.clientHeight * 0.88) / h));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="absolute inset-0">
      <div
        ref={inner}
        className="absolute left-1/2 top-1/2 w-max"
        style={{ transform: `translate(-50%, -50%) scale(${scale ?? 1})`, opacity: scale === null ? 0 : 1 }}
      >
        {children}
      </div>
    </div>
  );
}

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '80px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

// 3D previews mount one by one: each creates a WebGL context and compiles shaders,
// and doing all four in one frame stutters the modal. The first waits out the open animation.
let nextMountAt = 0;
function useStaggeredMount(active: boolean) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!active || ready) return;
    const now = performance.now();
    nextMountAt = Math.max(now + 250, nextMountAt + 180);
    const id = window.setTimeout(() => setReady(true), nextMountAt - now);
    return () => window.clearTimeout(id);
  }, [active, ready]);
  return ready;
}

/** The real clock component at thumbnail size, on the same paper as the timer stage (follows the light/dark theme). */
export function ClockPreview({
  type,
  workMinutes,
  warn,
}: {
  type: SelectableClockType;
  workMinutes: number;
  warn: boolean;
}) {
  const mode = useTimerStore((s) => s.mode);
  const [ref, seen] = useInView<HTMLDivElement>();
  const mount3d = useStaggeredMount(seen && Boolean(CLOCK_STYLES.find((c) => c.id === type)?.is3d));
  const total = Math.max(1, workMinutes) * 60;
  const timeLeft = Math.round(total * 0.72);
  const meta = CLOCK_STYLES.find((c) => c.id === type);

  let content: ReactNode = null;
  if (meta?.is3d) {
    content = mount3d ? (
      <div className="absolute inset-0 flex items-center justify-center">
        <ThreeClock
          scene={type as 'flip3d' | 'tomato' | 'orbit' | 'solid'}
          timeLeft={timeLeft}
          totalTimeForMode={total}
          isRunning={false}
          clockSize="small"
          warn={warn}
          fitHeight={TILE_HEIGHT}
        />
      </div>
    ) : null;
  } else if (type === 'analog') {
    content = (
      <ScaleToFit>
        <AnalogClock formattedTime={formatClock(timeLeft)} totalTimeForMode={total} timeLeft={timeLeft} clockSize="small" isRunning={false} warn={warn} />
      </ScaleToFit>
    );
  } else if (type === 'flip') {
    content = (
      <ScaleToFit>
        <FlipClock formattedTime={formatClock(timeLeft)} timeLeft={timeLeft} isRunning={false} clockSize="small" warn={warn} />
      </ScaleToFit>
    );
  } else {
    content = (
      <ScaleToFit>
        <DigitalClock formattedTime={formatClock(timeLeft)} timeLeft={timeLeft} isRunning={false} totalTimeForMode={total} clockSize="small" warn={warn} />
      </ScaleToFit>
    );
  }

  return (
    <div
      ref={ref}
      data-timer
      data-mode={mode}
      aria-hidden="true"
      // The live clocks are decorative here; the card's own label names the style.
      inert
      className="relative w-full overflow-hidden bg-surface-page"
      style={{ height: TILE_HEIGHT }}
    >
      {content}
    </div>
  );
}

export function ClockStylePicker({
  value,
  onChange,
  workMinutes,
  warn,
  labelledBy,
}: {
  value: SelectableClockType;
  onChange: (next: SelectableClockType) => void;
  workMinutes: number;
  warn: boolean;
  labelledBy: string;
}) {
  const { t } = useI18n();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (e: KeyboardEvent, index: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const step = keys[e.key];
    if (!step) return;
    e.preventDefault();
    const next = CLOCK_STYLES[(index + step + CLOCK_STYLES.length) % CLOCK_STYLES.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="-mx-2 grid grid-cols-2 gap-5 p-2 sm:grid-cols-3 lg:grid-cols-4">
      {CLOCK_STYLES.map((style, index) => {
        const selected = value === style.id;
        return (
          <GalleryCard
            key={style.id}
            label={t(style.labelKey)}
            selected={selected}
            onSelect={() => onChange(style.id)}
            previewClassName="aspect-auto"
            overlay={
              style.is3d ? (
                <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border-2 border-outline bg-candy-lilac px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none text-on-accent">
                  <Cube size={11} weight="fill" aria-hidden />
                  {t('clockStyles.badge3d')}
                </span>
              ) : undefined
            }
            radio={{
              tabIndex: selected ? 0 : -1,
              onKeyDown: (e) => move(e, index),
              buttonRef: (el) => {
                refs.current[style.id] = el;
              },
            }}
          >
            <ClockPreview type={style.id} workMinutes={workMinutes} warn={warn} />
          </GalleryCard>
        );
      })}
    </div>
  );
}
