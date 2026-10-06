'use client';

const SIZE = 32;
const RADIUS = 13;
const STROKE = 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Small ring showing progress toward the daily focus-minutes goal. Purely visual; callers pair it with a text summary. */
export function DailyGoalRing({ percent }: { percent: number }) {
  const clamped = Math.min(1, Math.max(0, percent));
  const dash = `${CIRCUMFERENCE * clamped} ${CIRCUMFERENCE}`;

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0 -rotate-90" aria-hidden="true">
      <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--surface)" strokeWidth={STROKE} />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--accent-solid)"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={dash}
        className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-700"
      />
    </svg>
  );
}
