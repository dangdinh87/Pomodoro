'use client';

import { Button } from '@/components/ui/button';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useTranslation } from '@/contexts/i18n-context';

export function Navbar() {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '#features', label: t('landing.nav.features') },
        { href: '#pricing', label: t('landing.nav.pricing') },
        { href: '/feedback', label: t('landing.nav.contact') },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl rounded-2xl border transition-all duration-500 ${isScrolled
                    ? 'bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-xl shadow-black/5'
                    : 'bg-white/5 dark:bg-white/[0.02] backdrop-blur-lg border-white/10'
                    }`}
            >
                <div className="flex items-center justify-between px-5 py-3">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="flex h-9 w-9 items-center justify-center"
                        >
                            <Image
                                src="/images/logo.png"
                                alt="Improcode"
                                width={36}
                                height={36}
                                className="drop-shadow-lg"
                            />
                        </motion.div>
                        <span className="text-lg font-bold tracking-tight">Improcode</span>
                    </Link>

                    {/* Desktop Nav */}
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

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <AnimatedThemeToggler />
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="cursor-pointer text-sm font-medium">
                                {t('auth.login')}
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    size="sm"
                                    className="relative bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white shadow-lg shadow-violet-500/20 cursor-pointer text-sm font-medium rounded-lg px-4 group overflow-hidden"
                                >
                                    {t('landing.hero.getStarted')}
                                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                    <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-white to-transparent h-px" />
                                </Button>
                            </motion.div>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        <motion.div
                            initial={false}
                            animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </motion.div>
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
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
                                        <span className="text-sm font-medium text-muted-foreground">{t('common.language')}</span>
                                        <LanguageSwitcher className="w-[140px]" />
                                    </div>
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-center cursor-pointer">
                                            {t('auth.login')}
                                        </Button>
                                    </Link>
                                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
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
