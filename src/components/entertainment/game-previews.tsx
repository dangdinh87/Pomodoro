import type { ReactNode } from 'react';

/** Flat, token-coloured thumbnails for the arcade grid. All share a 120x72 viewBox. */
const PREVIEWS: Record<string, ReactNode> = {
  snake: (
    <>
      <path d="M22 52 H58 V30 H88" fill="none" stroke="var(--accent-solid)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="88" cy="30" r="5.5" fill="var(--accent)" />
      <circle cx="90" cy="28" r="1.4" fill="var(--surface)" />
      <circle cx="90" cy="33" r="1.4" fill="var(--surface)" />
      <circle cx="100" cy="52" r="5" fill="var(--rose-solid)" />
    </>
  ),
  'game-2048': (
    <>
      {[
        [38, 12, '2', 'var(--surface-hover)', 'var(--ink)'],
        [62, 12, '4', 'var(--cyan-solid)', '#fff'],
        [38, 36, '8', 'var(--blue-solid)', '#fff'],
        [62, 36, '16', 'var(--purple-solid)', '#fff'],
      ].map(([x, y, label, bg, fg]) => (
        <g key={String(label)}>
          <rect x={Number(x)} y={Number(y)} width="22" height="22" rx="4" fill={String(bg)} />
          <text x={Number(x) + 11} y={Number(y) + 15} textAnchor="middle" fontSize="10" fontWeight="700" fill={String(fg)} fontFamily="var(--font-heading), sans-serif">
            {label}
          </text>
        </g>
      ))}
    </>
  ),
  'brick-breaker': (
    <>
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4].map((c) => (
          <rect key={`${r}-${c}`} x={14 + c * 19} y={8 + r * 9} width="16" height="6" rx="1.5" fill={['var(--rose-solid)', 'var(--amber-solid)', 'var(--green-solid)'][r]} />
        )),
      )}
      <circle cx="70" cy="46" r="3.5" fill="var(--accent)" />
      <rect x="46" y="62" width="34" height="5" rx="2.5" fill="var(--ink)" />
    </>
  ),
  'space-shooter': (
    <>
      <path d="M60 40 L70 62 L60 57 L50 62 Z" fill="var(--accent)" />
      <path d="M30 12 H44 L37 26 Z" fill="var(--rose-solid)" />
      <path d="M78 10 L90 22 L78 34 L66 22 Z" fill="var(--amber-solid)" />
      <rect x="59" y="26" width="2" height="9" fill="var(--ink)" />
      <rect x="59" y="14" width="2" height="7" fill="var(--ink)" />
    </>
  ),
  'neon-flip': (
    <>
      <rect x="12" y="14" width="28" height="40" rx="5" fill="var(--surface)" stroke="var(--border-strong)" />
      <path d="M26 42 C16 34 18 26 23 26 C25 26 26 28 26 28 C26 28 27 26 29 26 C34 26 36 34 26 42 Z" fill="var(--rose-solid)" />
      <rect x="46" y="14" width="28" height="40" rx="5" fill="var(--surface-hover)" stroke="var(--border-strong)" />
      <rect x="80" y="14" width="28" height="40" rx="5" fill="var(--surface)" stroke="var(--green-solid)" />
      <path d="M94 24 L97 32 L105 32 L99 37 L101 45 L94 40 L87 45 L89 37 L83 32 L91 32 Z" fill="var(--amber-solid)" />
    </>
  ),
  'tic-tac-toe': (
    <>
      <path d="M48 10 V62 M72 10 V62 M28 26 H92 M28 46 H92" stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M33 13 L43 23 M43 13 L33 23" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="60" cy="36" r="6" fill="none" stroke="var(--blue-solid)" strokeWidth="3.5" />
      <path d="M77 49 L87 59 M87 49 L77 59" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  minesweeper: (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const c = i % 4;
        const r = Math.floor(i / 4);
        const open = i === 5 || i === 6 || i === 9 || i === 10;
        return <rect key={i} x={30 + c * 15} y={9 + r * 19} width="13" height="17" rx="3" fill={open ? 'var(--surface)' : 'var(--surface-hover)'} stroke="var(--border-strong)" />;
      })}
      <text x="67.5" y="43" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--blue-solid)" fontFamily="var(--font-heading), sans-serif">
        1
      </text>
      <text x="52.5" y="43" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--green-solid)" fontFamily="var(--font-heading), sans-serif">
        2
      </text>
      <path d="M36 14 V28 M36 14 L46 18 L36 22" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  'typing-sprint': (
    <>
      <text x="14" y="30" fontSize="15" fontWeight="600" fontFamily="var(--font-mono), monospace" fill="var(--green-solid)">
        fo
      </text>
      <text x="37" y="30" fontSize="15" fontWeight="600" fontFamily="var(--font-mono), monospace" fill="var(--ink-faint)">
        cus
      </text>
      <rect x="35" y="14" width="1.6" height="20" fill="var(--accent)" />
      {[16, 40, 64, 88].map((x) => (
        <rect key={x} x={x} y="46" width="18" height="14" rx="3" fill="var(--surface)" stroke="var(--border-strong)" />
      ))}
    </>
  ),
  'aim-trainer': (
    <>
      <circle cx="60" cy="36" r="26" fill="none" stroke="var(--accent)" strokeOpacity="0.45" strokeWidth="2" />
      <circle cx="60" cy="36" r="17" fill="var(--accent)" />
      <circle cx="60" cy="36" r="8" fill="var(--surface)" />
      <circle cx="98" cy="16" r="5" fill="var(--accent)" fillOpacity="0.5" />
      <circle cx="22" cy="56" r="4" fill="var(--accent)" fillOpacity="0.5" />
    </>
  ),
  stack: (
    <>
      {[
        [32, 50, 56, 'hsl(205, 55%, 58%)'],
        [38, 38, 46, 'hsl(218, 55%, 58%)'],
        [44, 26, 34, 'hsl(231, 55%, 58%)'],
        [50, 14, 22, 'hsl(244, 55%, 58%)'],
      ].map(([x, y, w, fill]) => (
        <rect key={String(y)} x={Number(x)} y={Number(y)} width={Number(w)} height="10" rx="2" fill={String(fill)} />
      ))}
    </>
  ),
};

export function GamePreview({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 72" className={className} aria-hidden focusable="false">
      {PREVIEWS[id]}
    </svg>
  );
}
