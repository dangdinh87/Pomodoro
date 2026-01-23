'use client';

import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { useTranslation } from '@/contexts/i18n-context';

export function Hero() {
    const { t } = useTranslation();



    return (
        <BackgroundBeamsWithCollision className="relative min-h-screen w-full flex items-center bg-gradient-to-b from-white via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-950/80 dark:to-neutral-900 border-b border-white/5">
            {/* Aceternity Spotlight Effect */}
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="rgba(99, 102, 241, 0.15)"
            />
            <Spotlight
                className="top-10 left-full -translate-x-1/2 opacity-75"
                fill="rgba(168, 85, 247, 0.12)"
            />

            <div className="mx-auto max-w-6xl relative z-10 w-full px-4 sm:px-6 lg:px-8 py-32">
                {/* Headline with enhanced animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-foreground">
                        <motion.span
                            className="block"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {t('landing.hero.title')}
                        </motion.span>
                        <span className="relative inline-block mt-2">
                            <motion.span
                                className="relative z-10 bg-gradient-to-r from-blue-600 via-violet-600 to-orange-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-violet-400 dark:to-orange-400"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                {t('landing.hero.titleHighlight')}
                            </motion.span>
                            {/* Underline decoration */}
                            <motion.svg
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
                                className="absolute -bottom-2 left-0 w-full h-4"
                                viewBox="0 0 200 12"
                                fill="none"
                            >
                                <motion.path
                                    d="M2 8 Q 50 2, 100 8 Q 150 14, 198 6"
                                    stroke="url(#gradient)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#f97316" />
                                    </linearGradient>
                                </defs>
                            </motion.svg>
                        </span>
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 text-lg sm:text-xl text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed"
                >
                    {t('landing.hero.subtitle')}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/signup">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 text-base px-8 py-6 cursor-pointer group rounded-xl"
                            >
                                {t('landing.hero.getStarted')}
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>



                {/* Product Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="mt-24 relative max-w-4xl mx-auto"
                >
                    {/* Mock browser */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                        {/* Browser header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    improcode.com
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 sm:p-16 bg-white dark:bg-neutral-950">
                            <div className="flex flex-col items-center justify-center">
                                {/* Timer Display */}
                                <div className="relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        className="relative text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter"
                                    >
                                        <span className="text-foreground">
                                            25:00
                                        </span>
                                    </motion.div>
                                </div>

                                <div className="mt-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-blue-400 text-sm font-medium">{t('landing.hero.timer')}</p>
                                </div>

                                {/* Control buttons */}
                                <div className="mt-8 flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-violet-500/30 cursor-pointer"
                                    >
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </BackgroundBeamsWithCollision>
    );
}
