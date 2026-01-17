'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/i18n-context';
import Link from 'next/link';

export function AIChatIndicator() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
            <div className="mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative group p-8 sm:p-12 rounded-[3.5rem] bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10 border border-neutral-200 dark:border-white/10 overflow-hidden"
                >
                    {/* Glowing background elements */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Icon/Visual area */}
                        <div className="relative">
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/20"
                            >
                                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-2 -right-2"
                                >
                                    <Sparkles className="w-6 h-6 text-yellow-400" />
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Content area */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                {t('landing.aiChatHighlight.title')}
                            </h2>
                            <p className="text-slate-600 dark:text-neutral-400 text-lg mb-8 max-w-md mx-auto md:mx-0">
                                {t('landing.aiChatHighlight.subtitle')}
                            </p>
                            <Link href="/chat">
                                <Button
                                    size="lg"
                                    className="group bg-white hover:bg-neutral-200 text-black rounded-full px-8 cursor-pointer h-14 text-base font-semibold"
                                >
                                    {t('landing.aiChatHighlight.cta')}
                                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
