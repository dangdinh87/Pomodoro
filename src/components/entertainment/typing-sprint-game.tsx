'use client';

import { useEffect, useRef, useState } from 'react';
import { Keyboard } from '@phosphor-icons/react/dist/ssr';

import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { GameFrame, SummaryRow } from './game-overlay';
import { formatClock, useCountdown, useGameSession, type GameProps } from './game-kit';
import { accuracy, buildQueue, matchWord, wordScore, wpm } from './typing-sprint-logic';

const DURATION_MS = 60_000;
const QUEUE_SIZE = 260;

export function TypingSprintGame(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession({ ...props, pauseKey: false });
  const { status, setScore, finish } = session;
  const [queue, setQueue] = useState<string[]>(() => buildQueue(QUEUE_SIZE));
  const [results, setResults] = useState<boolean[]>([]);
  const [typed, setTyped] = useState('');
  const [chars, setChars] = useState(0);
  const scoreRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const countdown = useCountdown(DURATION_MS, status, () => finish(scoreRef.current));

  useEffect(() => {
    if (status === 'playing') inputRef.current?.focus();
  }, [status]);

  const begin = () => {
    setChars(0);
    scoreRef.current = 0;
    countdown.reset();
    setQueue(buildQueue(QUEUE_SIZE));
    setResults([]);
    setTyped('');
    setScore(0);
    session.start();
  };

  const index = results.length;
  const current = queue[index] ?? '';
  const { matched } = matchWord(typed, current);

  const submit = (value: string) => {
    const word = value.trim();
    if (!word) {
      setTyped('');
      return;
    }
    const ok = word === current;
    if (ok) {
      scoreRef.current += wordScore(current);
      setChars((c) => c + wordScore(current));
      setScore(scoreRef.current);
    }
    setResults((prev) => [...prev, ok]);
    setTyped('');
  };

  const elapsed = (DURATION_MS - countdown.left) / 1000;
  const correctWords = results.filter(Boolean).length;
  const liveWpm = wpm(chars, Math.max(elapsed, 1));
  const finalWpm = wpm(chars, DURATION_MS / 1000);

  const visibleFrom = Math.max(0, index - 4);
  const visible = queue.slice(visibleFrom, index + 16);

  return (
    <GameFrame
      title={t('arcadeGames.typingSprint.title')}
      icon={Keyboard}
      description={t('arcadeGames.typingSprint.instructions')}
      hint={t('arcadeGames.typingSprint.hint')}
      session={session}
      onRestart={begin}
      onStart={begin}
      scoreLabel={t('arcadeGames.typingSprint.points')}
      stats={[
        { label: t('arcadeKit.time'), value: formatClock(countdown.left) },
        { label: t('arcadeGames.typingSprint.wpm'), value: liveWpm },
      ]}
      overTitle={t('arcadeGames.typingSprint.timeUp')}
      overSummary={
        <SummaryRow
          items={[
            { label: t('arcadeGames.typingSprint.wpm'), value: finalWpm },
            { label: t('arcadeGames.typingSprint.accuracy'), value: `${accuracy(correctWords, results.length)}%` },
            { label: t('arcadeGames.typingSprint.words'), value: correctWords },
          ]}
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 p-4" onClick={() => inputRef.current?.focus()}>
        <div className="h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-surface-raised" aria-hidden>
          <div className="h-full rounded-full bg-primary" style={{ width: `${(countdown.left / DURATION_MS) * 100}%`, transition: 'width 120ms linear' }} />
        </div>

        <div
          className="w-full max-w-xl rounded-lg border border-border bg-surface p-4 font-mono text-lg leading-9 sm:p-6 sm:text-xl sm:leading-10"
          aria-hidden
          translate="no"
        >
          {visible.map((word, i) => {
            const wordIndex = visibleFrom + i;
            const done = wordIndex < index;
            const isCurrent = wordIndex === index;
            return (
              <span
                key={wordIndex}
                className={cn(
                  'mr-2.5 inline-block rounded px-1',
                  done && (results[wordIndex] ? 'text-success' : 'text-danger line-through decoration-1'),
                  !done && !isCurrent && 'text-ink-muted',
                  isCurrent && 'bg-surface-raised text-ink',
                )}
              >
                {isCurrent
                  ? word.split('').map((ch, ci) => (
                      <span key={ci} className={ci < typed.length ? (ci < matched ? 'text-ink' : 'text-danger') : 'text-ink-muted'}>
                        {ch}
                      </span>
                    ))
                  : word}
              </span>
            );
          })}
        </div>

        <input
          ref={inputRef}
          value={typed}
          disabled={status !== 'playing'}
          onChange={(e) => {
            const value = e.target.value;
            if (/\s$/.test(value)) submit(value);
            else setTyped(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit(typed);
            }
          }}
          aria-label={t('arcadeGames.typingSprint.inputLabel')}
          placeholder={t('arcadeGames.typingSprint.placeholder')}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          className={cn(
            'w-full max-w-xl rounded-lg border border-border-strong bg-surface px-4 py-3 font-mono text-lg text-ink outline-hidden',
            'placeholder:text-ink-faint focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30',
          )}
        />
      </div>
    </GameFrame>
  );
}
