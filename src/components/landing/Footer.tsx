/**
 * SSR Footer component - links and content rendered server-side for SEO
 * LanguageSwitcher remains client component
 */
import { GithubLogo } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import Image from 'next/image';
import { getT } from '@/lib/server-translations';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

export async function Footer() {
  const t = await getT();
  return (
    <footer className="py-12 px-[clamp(16px,4vw,32px)] bg-surface-page border-t border-border">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Study Bro"
                  width={32}
                  height={32}
                  
                />
              </div>
              <span className="font-heading text-xl font-bold text-ink">Study Bro</span>
            </Link>

            <div className="flex gap-4">
              <a
                href="https://github.com/dangdinh87"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <GithubLogo size={20} aria-label="GitHub" />
              </a>
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-4">
            <Link href="/#features" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">
              {t('landing.footer.links.features')}
            </Link>
            <Link href="/guide" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">
              {t('nav.guide')}
            </Link>
            <Link href="/privacy" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">
              {t('landing.footer.links.privacy')}
            </Link>
            <Link href="/terms" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">
              {t('landing.footer.links.terms')}
            </Link>
          </nav>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-ink-muted">
            © {new Date().getFullYear()} Study Bro. {t('landing.footer.rightsReserved')}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
