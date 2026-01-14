'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const plans = [
    {
        name: 'Free',
        description: 'Perfect for getting started',
        icon: Zap,
        price: { monthly: 0, annually: 0 },
        features: [
            'Basic Pomodoro timer',
            'Up to 5 tasks',
            '7-day focus history',
            'Light & dark mode',
            'Basic statistics',
        ],
        cta: 'Get Started Free',
        popular: false,
        comingSoon: false,
        gradient: 'from-slate-500 to-slate-600',
    },
    {
        name: 'Pro',
        description: 'For serious productivity',
        icon: Sparkles,
        price: { monthly: 9, annually: 7 },
        features: [
            'Everything in Free',
            'Unlimited tasks',
            'Full focus history',
            'Ambient sounds library',
            'Advanced analytics',
            'Cloud sync across devices',
            'Custom themes',
            'Priority support',
        ],
        cta: 'Notify Me',
        popular: true,
        comingSoon: true,
        gradient: 'from-blue-500 via-violet-500 to-purple-500',
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-orange-500/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-4xl">
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
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        Pricing
                    </motion.div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                        Simple, Transparent
                        <span className="block mt-2 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                            Pricing
                        </span>
                    </h2>
                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Start free, upgrade when you're ready. No hidden fees.
                    </p>
                </motion.div>

                {/* Pricing Cards - 2 column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className={`relative p-8 rounded-3xl border transition-all duration-300 cursor-pointer ${plan.popular
                                ? 'border-violet-500/30 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent shadow-2xl shadow-violet-500/10'
                                : 'border-white/10 bg-white/5 dark:bg-white/[0.02] hover:border-white/20 hover:bg-white/10'
                                }`}
                        >
                            {/* Animated gradient border for coming soon */}
                            {plan.comingSoon && (
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 rounded-3xl opacity-40 blur-sm" />
                            )}

                            {/* Card content container */}
                            <div className={`relative ${plan.comingSoon ? 'z-10' : ''} h-full flex flex-col`}>
                                {/* Glow for popular */}
                                {plan.popular && (
                                    <div className="absolute -inset-px bg-gradient-to-b from-violet-500/20 to-transparent rounded-3xl blur-xl -z-10" />
                                )}

                                {/* Coming Soon badge */}
                                {plan.comingSoon && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -top-4 left-1/2 -translate-x-1/2"
                                    >
                                        <div className="relative">
                                            {/* Sparkle effects */}
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute -left-2 -top-1 w-2 h-2 rounded-full bg-yellow-400"
                                            />
                                            <motion.div
                                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                                className="absolute -right-2 top-0 w-1.5 h-1.5 rounded-full bg-blue-400"
                                            />
                                            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white text-xs font-semibold shadow-lg shadow-orange-500/25">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                Coming Soon
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Plan header */}
                                <div className={`flex items-center gap-3 mb-4 ${plan.comingSoon ? 'mt-4' : ''}`}>
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${plan.gradient}`}>
                                        <plan.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{plan.name}</h3>
                                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-6 pb-6 border-b border-white/10">
                                    {plan.comingSoon ? (
                                        <div className="flex flex-col items-start gap-2">
                                            <motion.div
                                                animate={{ opacity: [0.7, 1, 0.7] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="text-xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-transparent"
                                            >
                                                Something amazing
                                            </motion.div>
                                            <p className="text-sm text-muted-foreground">
                                                is brewing... Stay tuned!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-bold">$0</span>
                                            <span className="text-muted-foreground text-sm">/forever</span>
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 flex-1">
                                    {plan.features.map((feature, featureIndex) => (
                                        <motion.li
                                            key={featureIndex}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.05 * featureIndex }}
                                            className="flex items-start gap-3"
                                        >
                                            <div className={`mt-0.5 p-0.5 rounded-full bg-gradient-to-br ${plan.gradient}`}>
                                                <Check className="h-3.5 w-3.5 text-white" />
                                            </div>
                                            <span className={`text-sm ${plan.comingSoon ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                                                {feature}
                                            </span>
                                        </motion.li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <div className="mt-6">
                                    {plan.comingSoon ? (
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                className="w-full py-5 rounded-xl cursor-pointer font-medium bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:via-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/25 group"
                                            >
                                                <Bell className="mr-2 h-4 w-4" />
                                                {plan.cta}
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <Link href="/signup" className="block">
                                            <Button
                                                className="w-full py-5 rounded-xl cursor-pointer font-medium bg-white/10 hover:bg-white/20 text-foreground group"
                                                variant="ghost"
                                            >
                                                {plan.cta}
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
                >
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Free forever plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Cancel anytime</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
