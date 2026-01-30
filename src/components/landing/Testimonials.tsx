'use client';

import { motion } from 'framer-motion';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';
import { useTranslation } from '@/contexts/i18n-context';

const testimonials = [
    {
        name: 'Sarah Chen',
        designation: 'Software Engineer at Google',
        quote: "Improcode transformed how I work. The focus analytics helped me identify my most productive hours. I'm now shipping features 3x faster.",
        src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=400&fit=crop',
    },
    {
        name: 'Alex Rivera',
        designation: 'Product Designer at Figma',
        quote: "The ambient sounds feature is a game-changer. I can finally focus in open offices. My productivity has skyrocketed since using this app.",
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&fit=crop',
    },
    {
        name: 'David Kim',
        designation: 'Indie Developer',
        quote: "Cloud sync across devices is a game-changer. I start a session on my Mac and continue on my iPad seamlessly. Perfect for my workflow.",
        src: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?q=80&w=400&h=400&fit=crop',
    },
    {
        name: 'Lisa Thompson',
        designation: 'Medical Student at Johns Hopkins',
        quote: "Studying for boards requires intense focus. Improcode's analytics showed me my peak hours and helped me study smarter, not harder.",
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&fit=crop',
    },
    {
        name: 'Marcus Johnson',
        designation: 'Freelance Writer',
        quote: "As a writer, distractions are my enemy. Improcode has been instrumental in helping me meet deadlines. The Pomodoro technique works wonders!",
        src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400&fit=crop',
    },
];

export function Testimonials() {
    const { t } = useTranslation();

    return (
        <section id="testimonials" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-purple-500/5 to-blue-500/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-blue-500/5 to-cyan-500/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-xs font-medium mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        {t('landing.testimonials.badge')}
                    </motion.div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                        {t('landing.testimonials.title')}
                        <span className="block mt-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                            {t('landing.testimonials.titleHighlight')}
                        </span>
                    </h2>
                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('landing.testimonials.subtitle')}
                    </p>
                </motion.div>

                {/* Aceternity Animated Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
                </motion.div>
            </div>
        </section>
    );
}
