'use client';

import { motion } from 'framer-motion';
import { Timer, ListTodo, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/contexts/i18n-context';

export function HowItWorks() {
    const { t } = useTranslation();

    const steps = [
        {
            number: '1',
            icon: ListTodo,
            title: t('landing.howItWorks.steps.step1.title'),
            description: t('landing.howItWorks.steps.step1.description'),
            color: 'bg-orange-500',
        },
        {
            number: '2',
            icon: Timer,
            title: t('landing.howItWorks.steps.step2.title'),
            description: t('landing.howItWorks.steps.step2.description'),
            color: 'bg-blue-500',
        },
        {
            number: '3',
            icon: BarChart3,
            title: t('landing.howItWorks.steps.step3.title'),
            description: t('landing.howItWorks.steps.step3.description'),
            color: 'bg-violet-500',
        },
    ];

    return (
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                {/* Header - compact */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t('landing.howItWorks.title')}{' '}
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                            {t('landing.howItWorks.titleHighlight')}
                        </span>
                    </h2>
                </motion.div>

                {/* Steps - horizontal on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors cursor-pointer group"
                        >
                            {/* Step number badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center">
                                {step.number}
                            </div>

                            {/* Icon */}
                            <div className={`${step.color} p-3 rounded-xl mb-4 mt-2`}>
                                <step.icon className="h-6 w-6 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                {step.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
