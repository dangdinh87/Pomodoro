import type { ReactNode } from 'react';

export interface DocSection {
  id: string;
  title: string;
  body: ReactNode;
}

// Decorative candy rotation for the numbered tiles (chips and headings). Static strings so Tailwind sees them.
const NUMBER_TILES = ['bg-candy-mint', 'bg-candy-butter', 'bg-candy-sky', 'bg-candy-lilac', 'bg-candy-peach', 'bg-candy-tomato'];
const tileClass = (i: number) => NUMBER_TILES[i % NUMBER_TILES.length];

/** Renders `**bold**` spans; copy is plain text so no HTML is ever injected. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-ink">
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
    <ul className="list-disc space-y-2 pl-5 marker:text-ink-muted">
      {items.map((item) => (
        <li key={item} className="pl-1">
          <Rich text={item} />
        </li>
      ))}
    </ul>
  );
}

export function OL({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-3 pl-6 marker:font-heading marker:font-bold marker:text-ink-secondary">
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
  /** Small pill under the lead, e.g. "Last updated: …". */
  meta?: string;
  /** Machine-readable date for `meta` (YYYY-MM-DD); renders the pill as a <time>. */
  metaDateTime?: string;
  tocLabel: string;
  sections: DocSection[];
  /** Rendered after the last section, inside the reading card. */
  after?: ReactNode;
}

/**
 * Long-form page: title block, table of contents as chips, and the text on one sticker card.
 * Reading width is 68ch (about 42em in Japanese, where a character is a full em wide); the card
 * is sized to match so the text never ends up off-centre.
 */
export function DocLayout({ title, lead, meta, metaDateTime, tocLabel, sections, after }: DocLayoutProps) {
  const MetaTag = metaDateTime ? 'time' : 'span';
  return (
    <div className="w-full px-[clamp(16px,4vw,32px)] pb-20 pt-10 md:pt-14">
      <div className="mx-auto max-w-[calc(68ch+5rem)] [&:lang(ja)]:max-w-[calc(42em+5rem)]">
        <header>
          <h1 className="text-balance font-heading text-[2rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[2.75rem]">{title}</h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-secondary [&:lang(ja)]:leading-[1.9]">{lead}</p>
          {meta ? (
            <p className="mt-4">
              <MetaTag
                {...(metaDateTime ? { dateTime: metaDateTime } : {})}
                className="inline-block rounded-full border-2 border-outline bg-candy-butter px-3 py-1 text-sm font-bold text-on-accent"
              >
                {meta}
              </MetaTag>
            </p>
          ) : null}
        </header>

        <nav aria-label={tocLabel} className="mt-8">
          <p className="mb-3 font-heading text-sm font-bold text-ink-secondary">{tocLabel}</p>
          {/* One scrolling row on phones (nine wrapped chips would fill the screen), wrapping from sm up */}
          <ol className="scrollbar-hide -mx-[clamp(16px,4vw,32px)] flex gap-3 overflow-x-auto px-[clamp(16px,4vw,32px)] pb-3 pt-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-1 sm:pt-0">
            {sections.map((s, i) => (
              <li key={s.id} className="max-w-full shrink-0 sm:shrink">
                <a
                  href={`#${s.id}`}
                  className="focus-ring sticker-sm sticker-press inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-4 text-sm font-bold leading-snug text-ink focus-visible:outline-offset-1 sm:whitespace-normal"
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-6 shrink-0 place-items-center rounded-full border-2 border-outline font-heading text-xs font-extrabold tabular-nums text-on-accent ${tileClass(i)}`}
                  >
                    {i + 1}
                  </span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="sticker-lg mt-8 space-y-12 p-5 sm:p-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="flex items-start gap-3 font-heading text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-ink">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-[10px] border-2 border-outline text-base font-extrabold tabular-nums text-on-accent ${tileClass(i)}`}
                >
                  {i + 1}
                </span>
                <span>{s.title}</span>
              </h2>
              <div className="mt-4 space-y-4 text-base leading-[1.75] text-ink-secondary [&:lang(ja)]:leading-[1.95]">{s.body}</div>
            </section>
          ))}
          {after}
        </article>
      </div>
    </div>
  );
}
