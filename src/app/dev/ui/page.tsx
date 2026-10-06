import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { UiShowcase } from './showcase';

export const metadata: Metadata = {
  title: 'UI primitives (dev)',
  robots: { index: false, follow: false },
};

// Dev-only gallery of every UI primitive (sticker pop). 404 in production.
export default function UiShowcasePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <UiShowcase />;
}
