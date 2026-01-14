'use client';

import { Button } from '@/components/ui/button';
import { Home, Timer, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useI18n } from '@/contexts/i18n-context';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Number with Animation and Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative">
            <div className="text-9xl font-bold text-primary/20 animate-pulse">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-9xl font-bold text-primary bg-clip-text bg-gradient-to-b from-primary to-primary/60">
                404
              </div>
            </div>
          </div>
        </div>

        {/* Error Message with Enhanced Styling */}
        <div className="space-y-4 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur"></div>
          <div className="relative bg-background/60 backdrop-blur-sm border border-border/20 rounded-lg p-6 space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Search className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{t('notFound.title')}</h1>
            <p className="text-muted-foreground text-lg">
              {t('notFound.description')}
            </p>
          </div>
        </div>

        {/* Action Buttons with Glassmorphism */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2 bg-primary/80 backdrop-blur-sm hover:bg-primary/90">
            <Link href="/timer">
              <Timer className="w-5 h-5" />
              {t('notFound.backToTimer')}
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2 bg-background/40 backdrop-blur-sm border-border/30 hover:bg-background/60" asChild>
            <Link href="/">
              <Home className="w-5 h-5" />
              {t('notFound.home')}
            </Link>
          </Button>
        </div>

        {/* Go Back Button */}
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-background/40"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('notFound.goBack')}
          </Button>
        </div>
      </div>
    </main>
  );
}