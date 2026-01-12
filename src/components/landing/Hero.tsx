'use client';

import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';
import { ArrowRight, Play, Sparkles as SparklesIcon, Clock, Target, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const stats = [
    { icon: Clock, value: '25min', label: 'Focus Sessions' },
    { icon: Target, value: '10x', label: 'More Productive' },
    { icon: TrendingUp, value: '50K+', label: 'Active Users' },
];

// Animated gradient mesh background
function GradientMesh() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
            {/* Primary mesh gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%]"
                style={{
                    background: `
                        radial-gradient(ellipse at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 20%, rgba(168, 85, 247, 0.12) 0%, transparent 45%),
                        radial-gradient(ellipse at 40% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 40%)
                    `,
                }}
            />
            {/* Secondary animated layer */}
            <motion.div
                animate={{
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse at 60% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)
                    `,
                }}
            />
        </div>
    );
}

// Floating decorative elements
function FloatingElements() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated gradient orbs */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl"
            />
            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -5, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-40 right-[5%] w-96 h-96 rounded-full bg-gradient-to-br from-orange-500/15 to-pink-500/15 blur-3xl"
            />
            <motion.div
                animate={{
                    y: [0, 15, 0],
                    x: [0, 10, 0],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-20 left-[20%] w-64 h-64 rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-500/15 blur-3xl"
            />

            {/* Floating UI elements */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute top-32 right-[15%] hidden lg:block"
            >
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium">Focus Mode Active</span>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute bottom-40 left-[8%] hidden lg:block"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="px-4 py-3 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Today's Focus</div>
                            <div className="text-sm font-semibold">4h 32m</div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* New: Achievement notification */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute top-1/2 right-[8%] hidden xl:block"
            >
                <motion.div
                    animate={{ y: [0, -5, 0], scale: [1, 1.02, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="px-4 py-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 shadow-2xl"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">Achievement!</div>
                            <div className="text-sm font-semibold">7-day streak 🔥</div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export function Hero() {
    return (
        <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center">
            {/* Gradient Mesh Background */}
            <GradientMesh />

            {/* Aceternity Spotlight Effect */}
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="rgba(99, 102, 241, 0.15)"
            />
            <Spotlight
                className="top-10 left-full -translate-x-1/2 opacity-75"
                fill="rgba(168, 85, 247, 0.12)"
            />

            <FloatingElements />

            <div className="mx-auto max-w-6xl relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-8"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-sm font-medium cursor-pointer backdrop-blur-sm"
                    >
                        <SparklesIcon className="h-4 w-4" />
                        <span>Introducing Study Bro 2.0</span>
                        <ArrowRight className="h-3 w-3" />
                    </motion.div>
                </motion.div>

                {/* Headline with enhanced animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                        <motion.span
                            className="block"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Master Your
                        </motion.span>
                        <span className="relative inline-block mt-2">
                            <motion.span
                                className="relative z-10 bg-gradient-to-r from-blue-600 via-violet-600 to-orange-500 bg-clip-text text-transparent"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                Focus
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
                    The smart Pomodoro timer that adapts to your workflow. Track focus sessions,
                    manage tasks, and boost productivity with{' '}
                    <span className="text-foreground font-medium">ambient sounds</span> and{' '}
                    <span className="text-foreground font-medium">analytics</span>.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/signup">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 text-base px-8 py-6 cursor-pointer group rounded-xl"
                        >
                            Start Free Trial
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto text-base px-8 py-6 cursor-pointer group rounded-xl bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10"
                    >
                        <Play className="mr-2 h-4 w-4" />
                        Watch Demo
                    </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="text-center cursor-pointer group"
                        >
                            <div className="flex justify-center mb-3">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 group-hover:border-blue-500/30 transition-colors">
                                    <stat.icon className="h-5 w-5 text-blue-500" />
                                </div>
                            </div>
                            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Product Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="mt-24 relative"
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-x-10 inset-y-10 bg-gradient-to-tr from-blue-500/30 via-purple-500/30 to-orange-500/30 rounded-3xl blur-3xl opacity-50" />
                    </div>

                    {/* Mock browser */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="relative rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                        {/* Browser header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5 dark:bg-white/[0.02]">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="px-4 py-1.5 rounded-lg bg-white/10 dark:bg-white/5 text-xs text-muted-foreground flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    studybro.app
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 sm:p-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                            <div className="flex flex-col items-center justify-center">
                                {/* Timer Display */}
                                <div className="relative">
                                    {/* Glow behind timer */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />

                                    <motion.div
                                        animate={{ scale: [1, 1.02, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        className="relative text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter font-space-grotesk"
                                    >
                                        <span className="bg-gradient-to-b from-foreground via-foreground to-muted-foreground/50 bg-clip-text text-transparent">
                                            25:00
                                        </span>
                                    </motion.div>
                                </div>

                                <div className="mt-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Focus Session</p>
                                </div>

                                {/* Control buttons */}
                                <div className="mt-8 flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-violet-500/30 cursor-pointer"
                                    >
                                        <Play className="h-6 w-6 text-white ml-1" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
