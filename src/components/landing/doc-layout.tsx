import type { ReactNode } from 'react';

export interface DocSection {
  id: string;
  title: string;
  body: ReactNode;
}

/** Renders `**bold**` spans; copy is plain text so no HTML is ever injected. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function P({ children }: { children: string }) {
  return (
    <p>
      <Rich text={children} />
    </p>
  );
}

export function UL({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-ink-faint">
      {items.map((item) => (
        <li key={item}>
          <Rich text={item} />
        </li>
      ))}
    </ul>
  );
}

export function OL({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-ink-muted">
      {items.map((item) => (
        <li key={item} className="pl-1">
          <Rich text={item} />
        </li>
      ))}
    </ol>
  );
}

interface DocLayoutProps {
  title: string;
  lead: string;
  /** Small line under the lead, e.g. "Last updated: …". */
  meta?: string;
  tocLabel: string;
  sections: DocSection[];
  /** Rendered after the last section, inside the article. */
  after?: ReactNode;
}

/** Long-form page: title block, table of contents (sticky on desktop) and a 68ch reading column. */
export function DocLayout({ title, lead, meta, tocLabel, sections, after }: DocLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-[clamp(16px,4vw,32px)] pb-20 pt-10 md:pt-14">
      <header className="max-w-[68ch]">
        <h1 className="font-heading text-[2rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[2.5rem]">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-secondary">{lead}</p>
        {meta ? <p className="mt-3 text-sm text-ink-muted">{meta}</p> : null}
      </header>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={tocLabel} className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">{tocLabel}</p>
          <ol className="grid gap-1 rounded-lg border border-border bg-surface p-2 sm:grid-cols-2 lg:block lg:space-y-0.5 lg:border-0 lg:bg-transparent lg:p-0">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex gap-2.5 rounded px-2 py-1.5 text-sm text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <span className="w-5 shrink-0 tabular-nums text-ink-faint">{i + 1}</span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-[68ch] space-y-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-ink">
                <span className="mr-3 tabular-nums text-ink-faint">{i + 1}</span>
                {s.title}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-[1.7] text-ink-secondary">{s.body}</div>
            </section>
          ))}
          {after}
        </article>
      </div>
    </div>
  );
}
