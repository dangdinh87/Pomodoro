import { getT } from '@/lib/server-translations';

// Mode colours from the timer stage: focus tomato, short break teal, long break blue.
const MODES = [
  { key: 'focus', color: 'bg-[#D93A16]' },
  { key: 'shortBreak', color: 'bg-[#0F766E]' },
  { key: 'longBreak', color: 'bg-[#2563EB]' },
] as const;

// One full default cycle; segment width is proportional to minutes (long break drawn at 20 of its 15-30).
const CYCLE = [
  { color: MODES[0].color, min: 25, label: '25' },
  { color: MODES[1].color, min: 5, label: '5' },
  { color: MODES[0].color, min: 25, label: '25' },
  { color: MODES[1].color, min: 5, label: '5' },
  { color: MODES[0].color, min: 25, label: '25' },
  { color: MODES[1].color, min: 5, label: '5' },
  { color: MODES[0].color, min: 25, label: '25' },
  { color: MODES[2].color, min: 20, label: '15–30' },
];

export async function HowItWorks() {
  const t = await getT();
  return (
    <section id="how-it-works" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-heading text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-ink sm:text-4xl">{t('site.how.title')}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t('site.how.lead')}</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t('site.how.cycleLabel')}</p>
          <div aria-hidden="true" className="flex h-10 gap-1">
            {CYCLE.map((s, i) => (
              <div
                key={i}
                style={{ flexGrow: s.min, flexBasis: 0 }}
                className={`flex min-w-0 items-center justify-center rounded-sm font-heading text-xs font-bold tabular-nums text-white ${s.color}`}
              >
                {s.label}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-muted">{t('site.how.cycleUnit')}</p>

          <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
            {MODES.map(({ key, color }) => (
              <li key={key} className="bg-surface p-5">
                <div className="flex items-center gap-2.5">
                  <span aria-hidden="true" className={`size-3 shrink-0 rounded-sm ${color}`} />
                  <h3 className="font-heading text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">{t(`site.how.${key}.title`)}</h3>
                  <span className="ml-auto text-sm tabular-nums text-ink-muted">{t(`site.how.${key}.duration`)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{t(`site.how.${key}.desc`)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">{t('site.how.defaults')}</p>
        </div>

        <figure className="mt-10 max-w-[68ch]">
          <h3 className="font-heading text-xl font-bold tracking-[-0.02em] text-ink">{t('site.why.title')}</h3>
          <p className="mt-3 text-base leading-[1.7] text-ink-secondary">{t('site.why.p1')}</p>
          <p className="mt-3 text-base leading-[1.7] text-ink-secondary">{t('site.why.p2')}</p>
          <figcaption className="mt-3 text-sm text-ink-muted">{t('site.why.source')}</figcaption>
        </figure>
      </div>
    </section>
  );
}
