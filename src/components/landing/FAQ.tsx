'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';

interface FAQItemProps {
    question: string;
    answer: string;
    index: number;
}

function FAQItem({ question, answer, index }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                'border-b border-slate-200 dark:border-white/10 last:border-0',
                'hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors'
            )}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 px-6 flex items-center justify-between text-left cursor-pointer group"
            >
                <span className="font-medium text-slate-900 dark:text-white pr-8 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                >
                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </motion.div>
            </button>
            <motion.div
                initial={false}
                animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
            >
                <p className="pb-6 px-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {answer}
                </p>
            </motion.div>
        </motion.div>
    );
}

export function FAQ() {
    const { t } = useTranslation();

    const faqs = [
        { question: t('landing.faq.items.q1.question'), answer: t('landing.faq.items.q1.answer') },
        { question: t('landing.faq.items.q2.question'), answer: t('landing.faq.items.q2.answer') },
        { question: t('landing.faq.items.q3.question'), answer: t('landing.faq.items.q3.answer') },
        { question: t('landing.faq.items.q4.question'), answer: t('landing.faq.items.q4.answer') },
        { question: t('landing.faq.items.q5.question'), answer: t('landing.faq.items.q5.answer') },
        { question: t('landing.faq.items.q6.question'), answer: t('landing.faq.items.q6.answer') },
    ];

    return (
        <section id="faq" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-b from-blue-500/5 to-transparent blur-3xl" />
            </div>

            <div className="mx-auto max-w-3xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {t('landing.faq.badge')}
                    </motion.div>

                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t('landing.faq.title')}
                        <span className="block mt-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                            {t('landing.faq.titleHighlight')}
                        </span>
                    </h2>
                    <p className="mt-6 text-lg text-muted-foreground">
                        {t('landing.faq.subtitle')}
                    </p>
                </motion.div>

                {/* FAQ List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden"
                >
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
                    ))}
                </motion.div>

                {/* Still have questions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <p className="text-muted-foreground">
                        {t('landing.faq.stillHaveQuestions')}{' '}
                        <a
                            href="/feedback"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            {t('landing.faq.sendMessage')}
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
