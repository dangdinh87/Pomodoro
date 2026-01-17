'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import {
    Timer,
    BarChart3,
    ListTodo,
    Music,
    Palette,
    Flame,
} from 'lucide-react';

export function Features() {
    const { t } = useTranslation();

    const features = [
        {
            icon: Timer,
            title: t('landing.features.items.timer.title'),
            description: t('landing.features.items.timer.description'),
            color: 'bg-blue-600',
            bgGlow: 'from-blue-600/20 to-transparent',
        },
        {
            icon: ListTodo,
            title: t('landing.features.items.tasks.title'),
            description: t('landing.features.items.tasks.description'),
            color: 'bg-orange-600',
            bgGlow: 'from-orange-600/20 to-transparent',
        },
        {
            icon: BarChart3,
            title: t('landing.features.items.analytics.title'),
            description: t('landing.features.items.analytics.description'),
            color: 'bg-purple-600',
            bgGlow: 'from-purple-600/20 to-transparent',
        },
        {
            icon: Music,
            title: t('landing.features.items.sounds.title'),
            description: t('landing.features.items.sounds.description'),
            color: 'bg-green-600',
            bgGlow: 'from-green-600/20 to-transparent',
        },
        {
            icon: Flame,
            title: t('landing.features.items.streaks.title'),
            description: t('landing.features.items.streaks.description'),
            color: 'bg-red-600',
            bgGlow: 'from-red-600/20 to-transparent',
        },
        {
            icon: Palette,
            title: t('landing.features.items.themes.title'),
            description: t('landing.features.items.themes.description'),
            color: 'bg-pink-600',
            bgGlow: 'from-pink-600/20 to-transparent',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    return (
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
            <div className="mx-auto max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16"
                >
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                        {t('landing.features.title')} {t('landing.features.titleHighlight')}
                    </h2>
                    <p className="text-slate-600 dark:text-neutral-400 max-w-2xl text-lg">
                        {t('landing.features.subtitle')}
                    </p>
                </motion.div>

                {/* Grid Layout matching image */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group relative flex flex-col p-8 rounded-[2.5rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/[0.05] transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-white/[0.1] cursor-default"
                        >
                            {/* Icon with colored container */}
                            <div className={cn(
                                'h-12 w-12 rounded-xl flex items-center justify-center mb-8 shadow-lg ring-1 ring-white/10 transition-transform group-hover:scale-110 duration-300',
                                feature.color
                            )}>
                                <feature.icon className="h-6 w-6 text-white" />
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-neutral-500 leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Subtle background glow on hover */}
                            <div className={cn(
                                'absolute inset-0 rounded-[2.5rem] bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none',
                                feature.bgGlow
                            )} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
