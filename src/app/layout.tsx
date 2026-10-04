/**
 * Pass-through root layout. The document (<html lang>, <body>) is rendered one level down by
 * `[lang]/layout.tsx` (or `dev/layout.tsx`), because the language comes from the URL. Keeping a
 * real root layout here is what lets `[lang]/not-found.tsx` render inside its language; with
 * the `[lang]` layout as the root, a `notFound()` falls back to Next's client-rendered error shell.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
