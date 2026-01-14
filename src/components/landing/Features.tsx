'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Timer,
    BarChart3,
    ListTodo,
    Music,
    Palette,
    Cloud,
} from 'lucide-react';

const features = [
    {
        icon: Timer,
        title: 'Smart Timer',
        description: 'Customizable Pomodoro sessions with automatic break reminders and smart notifications.',
        gradient: 'from-blue-500 to-cyan-500',
        className: 'md:col-span-2',
    },
    {
        icon: BarChart3,
        title: 'Focus Analytics',
        description: 'Track productivity with detailed statistics and insights.',
        gradient: 'from-purple-500 to-pink-500',
        className: 'md:col-span-1',
    },
    {
        icon: ListTodo,
        title: 'Task Management',
        description: 'Organize and link tasks to focus sessions.',
        gradient: 'from-orange-500 to-red-500',
        className: 'md:col-span-1',
    },
    {
        icon: Music,
        title: 'Ambient Sounds',
        description: 'Curated soundscapes and lo-fi beats to enhance your concentration and boost creativity.',
        gradient: 'from-green-500 to-emerald-500',
        className: 'md:col-span-2',
    },
    {
        icon: Palette,
        title: 'Beautiful Themes',
        description: 'Light and dark modes with custom colors.',
        gradient: 'from-violet-500 to-purple-500',
        className: 'md:col-span-1',
    },
    {
        icon: Cloud,
        title: 'Cloud Sync',
        description: 'Access your data anywhere, anytime across all devices.',
        gradient: 'from-sky-500 to-blue-500',
        className: 'md:col-span-1',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

export function Features() {
    return (
        <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-medium mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Features
                    </motion.div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                        Everything You Need to
                        <span className="block mt-2 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Stay Focused
                        </span>
                    </h2>
                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Powerful features designed to help you achieve deep work and maximize your productivity.
                    </p>
                </motion.div>

                {/* Aceternity-style Bento Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[18rem]"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className={cn(
                                'group/bento relative row-span-1 flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-white dark:bg-neutral-950 p-6 transition duration-200 hover:shadow-xl dark:shadow-none cursor-pointer overflow-hidden',
                                feature.className
                            )}
                        >
                            {/* Gradient overlay on hover */}
                            <div className={cn(
                                'absolute inset-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 bg-gradient-to-br',
                                feature.gradient,
                                'opacity-[0.03] dark:opacity-[0.05]'
                            )} />

                            {/* Glow effect on hover */}
                            <div className={cn(
                                'absolute -inset-px opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500 rounded-xl blur-2xl -z-10 bg-gradient-to-br',
                                feature.gradient,
                                'opacity-20'
                            )} />

                            {/* Header with animated icon */}
                            <div className="relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={cn(
                                        'inline-flex p-3 rounded-xl bg-gradient-to-br shadow-lg w-fit',
                                        feature.gradient
                                    )}
                                >
                                    <feature.icon className="h-6 w-6 text-white" />
                                </motion.div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 transition duration-200 group-hover/bento:translate-x-2">
                                <div className="mt-2 mb-2 font-bold text-lg text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                                    {feature.title}
                                </div>
                                <div className="text-sm font-normal text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {feature.description}
                                </div>
                            </div>

                            {/* Corner decoration */}
                            <div className={cn(
                                'absolute -bottom-2 -right-2 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover/bento:opacity-30 bg-gradient-to-br',
                                feature.gradient
                            )} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
