import {
  ArrowRight,
  ChartBar,
  GameController,
  ImageSquare,
  ListChecks,
  MusicNotes,
  Timer,
  UserCircle,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { Tomo } from '@/components/brand/tomo';
import { IconTile, type IconTileTone } from '@/components/ui/icon-tile';
import { StickerCard } from '@/components/ui/sticker-card';
import { getT } from '@/lib/server-translations';
import type { PanelId } from '@/features/app-shell/panel-store';
import { PanelLink } from './panel-link';

// Tile colours follow the dock (spec §7.1) so a feature has the same colour here and in the app.
const FEATURES: { key: string; icon: Icon; panel: PanelId; tone: IconTileTone }[] = [
  { key: 'timer', icon: Timer, panel: 'timer', tone: 'mint' },
  { key: 'tasks', icon: ListChecks, panel: 'tasks', tone: 'butter' },
  { key: 'stats', icon: ChartBar, panel: 'stats', tone: 'tomato' },
  { key: 'sound', icon: MusicNotes, panel: 'sound', tone: 'sky' },
  { key: 'scene', icon: ImageSquare, panel: 'scene', tone: 'lilac' },
  { key: 'arcade', icon: GameController, panel: 'arcade', tone: 'peach' },
  { key: 'account', icon: UserCircle, panel: 'login', tone: 'surface' },
];

/** What's inside: sticker cards tilted in turn (decorative, so the tilt is allowed), Tomo beside the heading. */
export async function FeaturesSSR() {
  const t = await getT();
  return (
    <section id="features" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] py-16 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] text-ink sm:text-4xl">{t('site.features.title')}</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">{t('site.features.lead')}</p>
          </div>
          <Tomo face="happy" size={128} className="hidden size-24 shrink-0 sm:block lg:size-32" />
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, icon, panel, tone }, i) => (
            <li key={key} className={`flex ${i === 0 ? 'lg:col-span-2' : ''} ${i === FEATURES.length - 1 ? 'sm:max-lg:col-span-2' : ''}`}>
              <StickerCard tilt={i % 2 === 0 ? 'left' : 'right'} className="flex w-full flex-col gap-3 p-6">
                <IconTile icon={icon} tone={tone} size="lg" />
                <h3 className="font-heading text-xl font-bold leading-tight tracking-[-0.01em] text-ink">{t(`site.features.${key}.title`)}</h3>
                <p className="flex-1 text-sm leading-relaxed text-ink-secondary">{t(`site.features.${key}.desc`)}</p>
                <PanelLink panel={panel} className="focus-ring mt-1 inline-flex items-center gap-1.5 self-start rounded-md font-heading text-[0.9375rem] font-bold text-brand hover:text-brand-hover hover:underline">
                  {t(`shell.panels.${panel}`)}
                  <ArrowRight size={14} weight="bold" />
                </PanelLink>
              </StickerCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
