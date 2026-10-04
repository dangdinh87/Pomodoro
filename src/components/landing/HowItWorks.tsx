import { Armchair, Coffee, Timer } from '@phosphor-icons/react/dist/ssr';
import { IconTile, type IconTileTone } from '@/components/ui/icon-tile';
import { StickerCard } from '@/components/ui/sticker-card';
import { getT } from '@/lib/server-translations';

// Mode colours match the timer stage (spec §3.1): focus tomato, short break mint, long break sky.
// Text on them is always on-accent, never white.
const MODES = [
  { key: 'focus', fill: 'bg-candy-tomato', tone: 'tomato', icon: Timer },
  { key: 'shortBreak', fill: 'bg-candy-mint', tone: 'mint', icon: Coffee },
  { key: 'longBreak', fill: 'bg-candy-sky', tone: 'sky', icon: Armchair },
] as const satisfies readonly { key: string; fill: string; tone: IconTileTone; icon: unknown }[];

// One full default cycle; segment width is proportional to minutes (long break drawn at 20 of its 15-30).
const CYCLE = [
  { fill: MODES[0].fill, min: 25, label: '25' },
  { fill: MODES[1].fill, min: 5, label: '5' },
  { fill: MODES[0].fill, min: 25, label: '25' },
  { fill: MODES[1].fill, min: 5, label: '5' },
  { fill: MODES[0].fill, min: 25, label: '25' },
  { fill: MODES[1].fill, min: 5, label: '5' },
  { fill: MODES[0].fill, min: 25, label: '25' },
  { fill: MODES[2].fill, min: 20, label: '15–30' },
];

export async function HowItWorks() {
  const t = await getT();
  return (
    <section id="how-it-works" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-heading text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] text-ink sm:text-4xl">{t('site.how.title')}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t('site.how.lead')}</p>
        </div>

        <StickerCard className="p-5 sm:p-6">
          <p className="mb-3 font-heading text-sm font-bold text-ink-secondary">{t('site.how.cycleLabel')}</p>
          <div aria-hidden="true" className="flex h-11 gap-1 sm:gap-1.5">
            {CYCLE.map((s, i) => (
              <div
                key={i}
                style={{ flexGrow: s.min, flexBasis: 0 }}
                // min-w keeps the 5-minute pieces wide enough for their label on a phone
                className={`flex min-w-6 items-center justify-center rounded-[10px] border-2 border-outline font-heading text-xs font-extrabold tabular-nums text-on-accent sm:min-w-9 ${s.fill}`}
              >
                {s.label}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-muted">{t('site.how.cycleUnit')}</p>
        </StickerCard>

        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {MODES.map(({ key, tone, icon }, i) => (
            <li key={key} className="flex">
              <StickerCard tilt={i % 2 === 0 ? 'left' : 'right'} className="w-full p-5">
                <div className="flex items-center gap-3">
                  <IconTile icon={icon} tone={tone} size="md" />
                  <h3 className="font-heading text-xl font-bold leading-tight tracking-[-0.01em] text-ink">{t(`site.how.${key}.title`)}</h3>
                  <span className="ml-auto whitespace-nowrap rounded-full border-2 border-outline bg-surface-raised px-2.5 py-0.5 font-heading text-sm font-bold tabular-nums text-ink">
                    {t(`site.how.${key}.duration`)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{t(`site.how.${key}.desc`)}</p>
              </StickerCard>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-muted">{t('site.how.defaults')}</p>

        <figure className="mt-12 max-w-[68ch]">
          <h3 className="font-heading text-2xl font-bold tracking-[-0.02em] text-ink">{t('site.why.title')}</h3>
          <p className="mt-3 text-base leading-[1.75] text-ink-secondary">{t('site.why.p1')}</p>
          <p className="mt-3 text-base leading-[1.75] text-ink-secondary">{t('site.why.p2')}</p>
          <figcaption className="mt-4 text-sm text-ink-muted">{t('site.why.source')}</figcaption>
        </figure>
      </div>
    </section>
  );
}
