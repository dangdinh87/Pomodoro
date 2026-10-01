/**
 * SSR-compatible Navbar component for SEO
 * Static links rendered on server, interactive parts handled by client component
 */
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { t } from '@/lib/server-translations';
import { NavbarClient } from './NavbarClient';

export function NavbarSSR() {
  const navLinks = [
    { href: '#features', label: t('landing.nav.features') },
    { href: '#pricing', label: t('landing.nav.pricing') },
    { href: '/feedback', label: t('landing.nav.contact') },
  ];

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-[1180px] rounded-lg border border-border bg-surface/80 backdrop-blur-lg">
      <div className="flex items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Study Bro"
              width={36}
              height={36}
              priority
            />
          </div>
          <span className="font-heading text-lg font-bold text-ink">Study Bro</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink rounded-md hover:bg-surface-hover transition-colors cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t('auth.login')}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/timer">{t('landing.hero.getStarted')}</Link>
          </Button>
        </div>

        <NavbarClient navLinks={navLinks} />
      </div>
    </nav>
  );
}
