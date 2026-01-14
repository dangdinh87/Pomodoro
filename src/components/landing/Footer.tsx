'use client';

import { Button } from '@/components/ui/button';
import { Github, Twitter, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

const footerLinks = {
    product: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Testimonials', href: '#testimonials' },
        { label: 'Download', href: '/download' },
    ],
    company: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
    ],
    legal: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookies', href: '/cookies' },
    ],
};

export function Footer() {
    const [email, setEmail] = useState('');

    return (
        <footer className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-t from-muted/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-blue-500/10 via-violet-500/10 to-transparent blur-3xl" />
            </div>

            <div className="mx-auto max-w-6xl">
                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative mb-20 p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-xl overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/20 to-pink-500/20 blur-3xl" />

                    <div className="relative z-10 text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4"
                        >
                            Ready to boost your
                            <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                                {' '}productivity?
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground mb-8 max-w-lg mx-auto"
                        >
                            Join thousands of focused professionals. Start your free trial today.
                        </motion.p>

                        {/* Email signup */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                        >
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 dark:bg-black/20 border border-white/10 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-sm placeholder:text-muted-foreground transition-all"
                                />
                            </div>
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 hover:from-blue-600 hover:via-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25 px-6 rounded-xl cursor-pointer group"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Footer Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-3 cursor-pointer mb-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="flex h-10 w-10 items-center justify-center"
                            >
                                <Image
                                    src="/images/logo.png"
                                    alt="Study Bro"
                                    width={40}
                                    height={40}
                                    className="drop-shadow-lg"
                                />
                            </motion.div>
                            <span className="text-xl font-bold tracking-tight">Study Bro</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                            The smart Pomodoro timer for maximum focus and productivity. Achieve more, stress less.
                        </p>
                        <div className="flex gap-2">
                            <motion.a
                                whileHover={{ scale: 1.1 }}
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                            >
                                <Twitter className="h-4 w-4 text-muted-foreground" />
                            </motion.a>
                            <motion.a
                                whileHover={{ scale: 1.1 }}
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                            >
                                <Github className="h-4 w-4 text-muted-foreground" />
                            </motion.a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Study Bro. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Made with{' '}
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-red-500"
                        >
                            ❤️
                        </motion.span>{' '}
                        for focused minds
                    </p>
                </div>
            </div>
        </footer>
    );
}
