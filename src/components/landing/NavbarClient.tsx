'use client';

/**
 * Client-side interactive parts of Navbar
 * Theme toggle, mobile menu, scroll effects
 */
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useTranslation } from '@/contexts/i18n-context';

interface NavbarClientProps {
  navLinks: { href: string; label: string }[];
}

export function NavbarClient({ navLinks }: NavbarClientProps) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder for theme toggle
  }

  return (
    <>
      {/* Theme toggle for desktop */}
      <AnimatedThemeToggler />

      {/* Mobile menu button - rendered in parent but controlled here */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer absolute right-4"
        aria-label="Toggle menu"
      >
        <motion.div
          initial={false}
          animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden rounded-2xl bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-6"
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
                      className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="border-t border-white/10 dark:border-white/5 pt-4 mt-2 flex flex-col gap-2">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('common.language')}
                    </span>
                    <LanguageSwitcher className="w-[140px]" />
                  </div>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center cursor-pointer">
                      {t('auth.login')}
                    </Button>
                  </Link>
                  <Link href="/timer" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white cursor-pointer">
                      {t('landing.hero.getStarted')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
