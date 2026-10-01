/**
 * SSR AIChatIndicator component - text content rendered server-side for SEO
 */
import { Chat, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/server-translations';
import Link from 'next/link';

export function AIChatIndicator() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-page">
      <div className="mx-auto max-w-4xl">
        <div className="p-8 sm:p-12 rounded-lg bg-surface border border-border">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <Chat size={40} className="shrink-0 text-ai-ink" />

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-4">
                {t('landing.aiChatHighlight.title')}
              </h2>
              <p className="text-ink-secondary text-lg mb-8 max-w-md mx-auto md:mx-0">
                {t('landing.aiChatHighlight.subtitle')}
              </p>
              <Button size="lg" asChild>
                <Link href="/chat">
                  {t('landing.aiChatHighlight.cta')}
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
