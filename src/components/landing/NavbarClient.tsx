'use client';

/**
 * Client-side interactive parts of Navbar
 * Mobile menu, scroll effects
 */
import { useState } from 'react';
import { List, X, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useTranslation } from '@/contexts/i18n-context';

interface NavbarClientProps {
  navLinks: { href: string; label: string }[];
}

export function NavbarClient({ navLinks }: NavbarClientProps) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button - rendered in parent but controlled here */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-lg text-ink hover:bg-surface-hover transition-colors cursor-pointer absolute right-4"
        aria-label="Toggle menu"
      >
        <motion.div
          initial={false}
          animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <List size={20} />}
        </motion.div>
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden rounded-lg bg-surface border border-border p-4"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-ink-secondary hover:text-ink hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-secondary">
                      {t('common.language')}
                    </span>
                    <LanguageSwitcher className="w-[140px]" />
                  </div>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('auth.login')}
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/timer" onClick={() => setIsMobileMenuOpen(false)}>
                      {t('landing.hero.getStarted')}
                      <ArrowRight size={16} weight="bold" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
