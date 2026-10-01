import { getT } from '@/lib/server-translations';

const STEPS = ['step1', 'step2', 'step3'];

export async function HowItWorks() {
  const t = await getT();
  return (
    <section id="how-it-works" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="mb-10 text-3xl font-bold text-ink sm:text-4xl">{t('landingUi.how.title')}</h2>

        <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step} className="flex flex-col gap-2 bg-surface p-6">
              <span className="font-heading text-sm font-bold tabular-nums text-ink-muted">{i + 1}</span>
              <h3 className="font-heading text-[1.0625rem] font-bold text-ink">{t(`landingUi.how.${step}.title`)}</h3>
              <p className="text-sm leading-relaxed text-ink-secondary">{t(`landingUi.how.${step}.description`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
