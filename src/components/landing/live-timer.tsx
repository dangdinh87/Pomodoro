'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowCounterClockwise, Pause, Play } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

const MODES = [
  { key: 'work', minutes: 25, label: 'landingUi.timer.work', isBreak: false },
  { key: 'short', minutes: 5, label: 'landingUi.timer.shortBreak', isBreak: true },
  { key: 'long', minutes: 15, label: 'landingUi.timer.longBreak', isBreak: true },
] as const;

type ModeKey = (typeof MODES)[number]['key'];

function format(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function LiveTimer({ className }: { className?: string }) {
  const { t } = useI18n();
  const [modeKey, setModeKey] = useState<ModeKey>('work');
  const mode = MODES.find((m) => m.key === modeKey)!;
  const total = mode.minutes * 60;
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const endAt = useRef(0);

  const selectMode = (key: ModeKey) => {
    setModeKey(key);
    setRunning(false);
    setRemaining(MODES.find((m) => m.key === key)!.minutes * 60);
  };

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(total);
  }, [total]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    const from = remaining === 0 ? total : remaining;
    endAt.current = Date.now() + from * 1000;
    setRemaining(from);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setRunning(false);
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const previous = document.title;
    document.title = `${format(remaining)} · Study Bro`;
    return () => {
      document.title = previous;
    };
  }, [running, remaining]);

  const done = remaining === 0;
  const progress = ((total - remaining) / total) * 100;

  return (
    <div
      data-timer
      data-mode={mode.isBreak ? 'break' : 'work'}
      data-theme="dark"
      className={cn(
        'rounded-lg border border-border bg-surface p-5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] sm:p-8',
        className,
      )}
    >
      <FilterChipGroup label={t('landingUi.timer.modeGroup')} className="justify-center">
        {MODES.map((m) => (
          <FilterChip key={m.key} active={m.key === modeKey} count={m.minutes} onClick={() => selectMode(m.key)}>
            {t(m.label)}
          </FilterChip>
        ))}
      </FilterChipGroup>

      <div
        role="timer"
        aria-label={t(mode.label)}
        className="mt-8 text-center font-heading text-[4.5rem] font-bold leading-none tabular-nums text-ink sm:text-[6.5rem]"
      >
        {format(remaining)}
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="mt-8 h-[3px] w-full overflow-hidden rounded-full bg-border"
      >
        <div className="h-full bg-brand transition-[width] duration-[600ms] ease-linear" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <Button size="lg" onClick={toggle} className="min-w-32">
          {running ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
          {running ? t('landingUi.timer.pause') : done ? t('landingUi.timer.restart') : t('landingUi.timer.start')}
        </Button>
        <Button size="lg" variant="secondary" onClick={reset} disabled={!running && remaining === total}>
          <ArrowCounterClockwise size={16} />
          {t('landingUi.timer.reset')}
        </Button>
      </div>

      <div className="mt-6 flex justify-center border-t border-border pt-4">
        <Button variant="link" size="sm" asChild>
          <Link href="/timer">
            {t('landingUi.timer.openApp')}
            <ArrowRight size={14} weight="bold" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
