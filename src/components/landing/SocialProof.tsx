'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, Target, Trophy, Zap } from 'lucide-react';
import { useTranslation } from '@/contexts/i18n-context';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
};

const logos = [
    { name: 'Google', opacity: 0.6 },
    { name: 'Microsoft', opacity: 0.6 },
    { name: 'Apple', opacity: 0.6 },
    { name: 'Amazon', opacity: 0.6 },
    { name: 'Meta', opacity: 0.6 },
    { name: 'Netflix', opacity: 0.6 },
];

export function SocialProof() {
    const { t } = useTranslation();

    const stats = [
        {
            icon: Users,
            value: '50K+',
            label: t('landing.socialProof.stats.activeUsers'),
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Clock,
            value: '2M+',
            label: t('landing.socialProof.stats.focusHours'),
            color: 'from-violet-500 to-purple-500',
        },
        {
            icon: Target,
            value: '10M+',
            label: t('landing.socialProof.stats.tasksCompleted'),
            color: 'from-orange-500 to-red-500',
        },
        {
            icon: Trophy,
            value: '4.9',
            label: t('landing.socialProof.stats.userRating'),
            color: 'from-yellow-500 to-amber-500',
        },
    ];

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-y border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="mx-auto max-w-6xl">
                {/* Stats Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="text-center group cursor-pointer"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg mb-4`}
                            >
                                <stat.icon className="h-6 w-6 text-white" />
                            </motion.div>
                            <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                                {stat.value}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trusted By */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                        {t('landing.socialProof.trustedBy')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        {logos.map((logo, index) => (
                            <motion.div
                                key={logo.name}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: logo.opacity }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ opacity: 1, scale: 1.05 }}
                                className="text-xl font-bold text-slate-400 dark:text-slate-500 cursor-pointer transition-all"
                            >
                                {logo.name}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Highlight Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-16 relative"
                >
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-purple-600/10 border border-blue-500/20 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex-shrink-0">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-violet-500/30"
                                >
                                    <TrendingUp className="h-8 w-8 text-white" />
                                </motion.div>
                            </div>
                            <div className="text-center sm:text-left flex-1">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    {t('landing.socialProof.highlight.title')}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {t('landing.socialProof.highlight.description')}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {t('landing.socialProof.highlight.verified')}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
