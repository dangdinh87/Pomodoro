'use client';

import { Button } from '@/components/ui/button';
import { LampContainer } from '@/components/ui/lamp';
import { useI18n } from '@/contexts/i18n-context';
import { Home, Timer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <LampContainer className="!bg-background">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: 'easeInOut',
        }}
        className="flex flex-col items-center text-center space-y-8"
      >
        {/* 404 Number */}
        <h1 className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-br from-foreground via-foreground/80 to-foreground/40 bg-clip-text text-transparent">
          404
        </h1>

        {/* Message */}
        <div className="space-y-3 max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('notFound.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('notFound.description')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Go Back */}
          <Button
            onClick={() => window.history.back()}
            className="gap-2 rounded-xl"
            variant="ghost"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('notFound.goBack')}
          </Button>
          <Button
            className="gap-2 rounded-xl"
            onClick={() => window.location.href = '/'}
          >
            <Home className="w-5 h-5" />
            {t('notFound.home')}
          </Button>
        </div>


      </motion.div>
    </LampContainer>
  );
}