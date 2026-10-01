import { ArrowRight, ChartBar, GameController, ImageSquare, ListChecks, MusicNotes, Timer, UserCircle } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { getT } from '@/lib/server-translations';
import type { PanelId } from '@/features/app-shell/panel-store';
import { PanelLink } from './panel-link';

const FEATURES: { key: string; icon: Icon; panel: PanelId }[] = [
  { key: 'timer', icon: Timer, panel: 'timer' },
  { key: 'tasks', icon: ListChecks, panel: 'tasks' },
  { key: 'stats', icon: ChartBar, panel: 'stats' },
  { key: 'sound', icon: MusicNotes, panel: 'sound' },
  { key: 'scene', icon: ImageSquare, panel: 'scene' },
  { key: 'arcade', icon: GameController, panel: 'arcade' },
  { key: 'account', icon: UserCircle, panel: 'login' },
];

export async function FeaturesSSR() {
  const t = await getT();
  return (
    <section id="features" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] py-20 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-heading text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-ink sm:text-4xl">{t('site.features.title')}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t('site.features.lead')}</p>
        </div>

        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, icon: Icon, panel }, i) => (
            <li
              key={key}
              className={`flex flex-col gap-3 bg-surface p-6 ${i === 0 ? 'lg:col-span-2' : ''} ${i === FEATURES.length - 1 ? 'sm:max-lg:col-span-2' : ''}`}
            >
              <Icon size={22} className="text-ink-secondary" />
              <h3 className="font-heading text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">{t(`site.features.${key}.title`)}</h3>
              <p className="flex-1 text-sm leading-relaxed text-ink-secondary">{t(`site.features.${key}.desc`)}</p>
              <PanelLink panel={panel} className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
                {t(`shell.panels.${panel}`)}
                <ArrowRight size={14} weight="bold" />
              </PanelLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
