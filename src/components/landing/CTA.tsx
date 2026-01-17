'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/i18n-context';

export function CTA() {
    const { t } = useTranslation();

    return (
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                {/* Gradient mesh */}
                <div className="absolute inset-0 bg-slate-50 dark:bg-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-violet-600/10 to-purple-600/10 dark:from-blue-600/20 dark:via-violet-600/20 dark:to-purple-600/20" />

                {/* Animated orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.4, 0.3],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 blur-3xl"
                />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='currentColor'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
                    }}
                />
            </div>

            <div className="mx-auto max-w-4xl relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 0.6 }
                        }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 dark:bg-white/10 backdrop-blur-sm border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-sm font-medium mb-8"
                    >
                        <Zap className="w-4 h-4 text-amber-500 dark:text-yellow-400" />
                        <span>{t('landing.cta.badge')}</span>
                    </motion.div>

                    {/* Headline */}
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                        {t('landing.cta.title')}
                        <span className="block mt-2 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 dark:from-blue-300 dark:via-violet-300 dark:to-purple-300 bg-clip-text text-transparent">
                            {t('landing.cta.titleHighlight')}
                        </span>
                    </h2>

                    <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-white/70 max-w-2xl mx-auto leading-relaxed">
                        {t('landing.cta.subtitle')}
                    </p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/signup">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90 shadow-xl shadow-slate-200 dark:shadow-white/20 text-base px-8 py-6 cursor-pointer group rounded-xl font-semibold"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {t('landing.cta.getStarted')}
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </motion.div>
                        </Link>
                        <Link href="/timer">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto text-base px-8 py-6 cursor-pointer rounded-xl border-slate-300 dark:border-white/30 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                                >
                                    {t('landing.cta.tryDemo')}
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* Trust indicators */}
                    {/* Trust indicators */}
                    {/* <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 flex items-center justify-center gap-8 text-slate-500 dark:text-white/50 text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-slate-900"
                                    />
                                ))}
                            </div>
                            <span>{t('landing.cta.trustedByMany')}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="ml-1">{t('landing.cta.rating')}</span>
                        </div>
                    </motion.div> */}
                </motion.div>
            </div>
        </section>
    );
}
