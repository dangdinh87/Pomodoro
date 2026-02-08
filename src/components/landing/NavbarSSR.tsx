/**
 * SSR-compatible Navbar component for SEO
 * Static links rendered on server, interactive parts handled by client component
 */
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
    <nav className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl rounded-2xl border bg-white/5 dark:bg-white/[0.02] backdrop-blur-lg border-white/10 transition-all duration-500">
      <div className="flex items-center justify-between px-5 py-3">
        {/* Logo - Static */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="flex h-9 w-9 items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Study Bro"
              width={36}
              height={36}
              className="drop-shadow-lg"
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-tight">Study Bro</span>
        </Link>

        {/* Desktop Nav - Static links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/10 transition-all cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions - Static */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle handled by client component */}
          <NavbarClient navLinks={navLinks} />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="cursor-pointer text-sm font-medium">
              {t('auth.login')}
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="relative bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white shadow-lg shadow-violet-500/20 cursor-pointer text-sm font-medium rounded-lg px-4 group overflow-hidden"
            >
              {t('landing.hero.getStarted')}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-white to-transparent h-px" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu handled by client component */}
      </div>
    </nav>
  );
}
