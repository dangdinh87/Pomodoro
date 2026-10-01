/**
 * Not Found Page - uses static text (no i18n provider at root level)
 */
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main data-theme="dark" className="flex min-h-screen items-center justify-center bg-surface-page px-4 text-ink">
      <div className="flex max-w-md flex-col items-center text-center">
        <picture>
          <source srcSet="/mascot/wolf_cute.webp" type="image/webp" />
          <img src="/mascot/wolf_cute.png" alt="" width={112} height={112} className="mb-6 size-28 object-contain" />
        </picture>
        <p className="font-heading text-sm font-bold tabular-nums text-ink-muted">404</p>
        <h1 className="mt-1 font-heading text-[1.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
          This page could not be found
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/timer">Back to timer</Link>
        </Button>
      </div>
    </main>
  );
}
