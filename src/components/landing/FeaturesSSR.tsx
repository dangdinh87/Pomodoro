import { Timer, ChartBar, ListChecks, MusicNotes, GameController } from '@phosphor-icons/react/dist/ssr';
import { getT } from '@/lib/server-translations';

const FEATURES = [
  { key: 'timer', icon: Timer },
  { key: 'tasks', icon: ListChecks },
  { key: 'analytics', icon: ChartBar },
  { key: 'sounds', icon: MusicNotes },
  { key: 'entertainment', icon: GameController },
];

export async function FeaturesSSR() {
  const t = await getT();
  return (
    <section id="features" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] py-20 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="mb-10 max-w-2xl text-3xl font-bold text-ink sm:text-4xl">{t('landingUi.features.title')}</h2>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ key, icon: Icon }) => (
            <article key={key} className="flex flex-col gap-2 bg-surface p-6 sm:last:col-span-2">
              <div className="flex items-center gap-2.5">
                <Icon size={20} className="shrink-0 text-ink-secondary" />
                <h3 className="font-heading text-[1.0625rem] font-bold text-ink">
                  {t(`landing.features.items.${key}.title`)}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-ink-secondary">{t(`landingUi.features.${key}`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
