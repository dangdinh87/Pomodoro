/**
 * SSR-compatible Features component for SEO
 * Static content rendered on server
 */
import {
  Timer,
  BarChart3,
  ListTodo,
  Music,
  Palette,
  Flame,
} from 'lucide-react';
import { t } from '@/lib/server-translations';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    key: 'timer',
    icon: Timer,
    color: 'bg-blue-600',
    bgGlow: 'from-blue-600/20 to-transparent',
  },
  {
    key: 'tasks',
    icon: ListTodo,
    color: 'bg-orange-600',
    bgGlow: 'from-orange-600/20 to-transparent',
  },
  {
    key: 'analytics',
    icon: BarChart3,
    color: 'bg-purple-600',
    bgGlow: 'from-purple-600/20 to-transparent',
  },
  {
    key: 'sounds',
    icon: Music,
    color: 'bg-green-600',
    bgGlow: 'from-green-600/20 to-transparent',
  },
  {
    key: 'streaks',
    icon: Flame,
    color: 'bg-red-600',
    bgGlow: 'from-red-600/20 to-transparent',
  },
  {
    key: 'themes',
    icon: Palette,
    color: 'bg-pink-600',
    bgGlow: 'from-pink-600/20 to-transparent',
  },
];

export function FeaturesSSR() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-6xl">
        {/* Section Header - SEO important */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            {t('landing.features.title')} {t('landing.features.titleHighlight')}
          </h2>
          <p className="text-slate-600 dark:text-neutral-400 max-w-2xl text-lg">
            {t('landing.features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.key}
                className="group relative flex flex-col p-8 rounded-[2.5rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/[0.05] transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-white/[0.1]"
              >
                {/* Icon */}
                <div
                  className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center mb-8 shadow-lg ring-1 ring-white/10 transition-transform group-hover:scale-110 duration-300',
                    feature.color
                  )}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {t(`landing.features.items.${feature.key}.title`)}
                  </h3>
                  <p className="text-slate-600 dark:text-neutral-500 leading-relaxed font-medium">
                    {t(`landing.features.items.${feature.key}.description`)}
                  </p>
                </div>

                {/* Hover glow effect */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-[2.5rem] bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none',
                    feature.bgGlow
                  )}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
