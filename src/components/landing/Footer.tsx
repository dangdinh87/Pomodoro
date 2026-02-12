/**
 * SSR Footer component - links and content rendered server-side for SEO
 * LanguageSwitcher remains client component
 */
import { Github, Twitter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { t } from '@/lib/server-translations';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

export function Footer() {
  return (
    <footer className="relative pt-12 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background border-t border-border">
      <div className="mx-auto max-w-6xl">
        {/* Simplified Footer Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          {/* Brand & Socials */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Study Bro"
                  width={32}
                  height={32}
                  className="drop-shadow-lg"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Study Bro</span>
            </Link>

            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/dangdinh87"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-4">
            <Link href="#features" className="text-sm font-medium text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              {t('landing.footer.links.features')}
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              {t('landing.footer.links.pricing')}
            </Link>
            <Link href="/privacy" className="text-sm font-medium text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              {t('landing.footer.links.privacy')}
            </Link>
            <Link href="/terms" className="text-sm font-medium text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              {t('landing.footer.links.terms')}
            </Link>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-neutral-500">
            © {new Date().getFullYear()} Study Bro. {t('landing.footer.rightsReserved')}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
