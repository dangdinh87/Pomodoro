import { notFound } from 'next/navigation';

/**
 * Any path that is not a page (`/vi/nope`, and `/nope` after the proxy rewrote it to `/en/nope`)
 * lands here so the 404 renders inside its language: `[lang]/not-found.tsx`, translated, with
 * links that stay in that language.
 */
export default function UnknownPage() {
  notFound();
}
