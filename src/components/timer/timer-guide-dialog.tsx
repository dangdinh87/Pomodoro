'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/contexts/i18n-context';
import {
  Timer,
  ShieldCheck,
  Link2,
  Settings,
  ChevronRight,
  Hourglass,
  RefreshCw,
  CheckSquare,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface TimerGuideDialogProps {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export function TimerGuideDialog({ open, onClose }: TimerGuideDialogProps) {
  const { t } = useI18n();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <Dialog open={open} onOpenChange={() => onClose(dontShowAgain)}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-border/50 bg-gradient-to-b from-background to-background/95">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/30">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="text-[10px] font-medium px-2.5 py-1 bg-primary/10 text-primary border-0">
              Quick Start
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {t('timerGuide.title')} <span className="text-2xl">🍅</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('timerGuide.subtitle')}
          </p>
        </div>

        {/* Content - Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-0 divide-x divide-border/30">
          {/* Left Column */}
          <div className="p-6 space-y-5">
            {/* Work Cycle */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Timer className="h-4 w-4 text-primary" />
                {t('timerGuide.modes.title')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">🍅</span>
                  <span className="font-medium text-red-400">{t('timerGuide.modes.work')}</span>
                  <span className="text-muted-foreground">— {t('timerGuide.modes.workDesc')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">☕</span>
                  <span className="font-medium text-emerald-400">{t('timerGuide.modes.shortBreak')}</span>
                  <span className="text-muted-foreground">— {t('timerGuide.modes.shortBreakDesc')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">🍊</span>
                  <span className="font-medium text-orange-400">{t('timerGuide.modes.longBreak')}</span>
                  <span className="text-muted-foreground">— {t('timerGuide.modes.longBreakDesc')}</span>
                </div>
              </div>
            </section>

            {/* Valid Session */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {t('timerGuide.validSession.title')}
                </h3>
                <span className="text-xs text-muted-foreground">{t('timerGuide.validSession.subtitle')} 😏</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">✅</span>
                  <span className="font-medium text-amber-400">{t('timerGuide.validSession.rule')}</span>
                  <span className="text-muted-foreground">→ {t('timerGuide.validSession.ruleDesc')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">🚫</span>
                  <span className="font-medium text-rose-400">{t('timerGuide.validSession.skip')}</span>
                  <span className="text-muted-foreground">→ {t('timerGuide.validSession.skipDesc')}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-muted-foreground/30 text-muted-foreground font-normal">
                {t('timerGuide.validSession.badge')} ✦
              </Badge>
            </section>

            {/* Task Linking */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Link2 className="h-4 w-4 text-primary" />
                {t('timerGuide.task.title')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckSquare className="h-4 w-4 text-emerald-500" />
                  <span className="text-muted-foreground">{t('timerGuide.task.select')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">{t('timerGuide.task.auto')}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="p-6 space-y-5 bg-muted/20">
            {/* Quick Tips - Keyboard */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Zap className="h-4 w-4 text-primary" />
                {t('timerGuide.keyboard.title')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-background/50">
                  <kbd className="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-border bg-muted/80 text-foreground shadow-sm">
                    Space
                  </kbd>
                  <span className="text-sm text-muted-foreground">{t('timerGuide.keyboard.space')}</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-background/50">
                  <kbd className="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-border bg-muted/80 text-foreground shadow-sm">
                    R
                  </kbd>
                  <span className="text-sm text-muted-foreground">{t('timerGuide.keyboard.reset')}</span>
                </div>
              </div>
            </section>

            {/* Settings */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Settings className="h-4 w-4 text-primary" />
                {t('timerGuide.settings.title')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Hourglass className="h-4 w-4 text-violet-500" />
                  <span className="text-muted-foreground">{t('timerGuide.settings.customize')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="h-4 w-4 text-cyan-500" />
                  <span className="text-muted-foreground">{t('timerGuide.settings.autoStart')}</span>
                </div>
              </div>
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={() => onClose(dontShowAgain)}
              >
                {t('timerGuide.settings.openSettings')}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/30 bg-muted/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer select-none group">
              <Checkbox
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="group-hover:text-foreground transition-colors">
                {t('timerGuide.dontShowAgain')}
              </span>
            </label>
            <Button
              onClick={() => onClose(dontShowAgain)}
            >
              {t('timerGuide.gotIt')} <span className="ml-1.5">🚀</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
