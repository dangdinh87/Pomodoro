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
import { Timer, ShieldCheck, LinkSimple, Gear, CaretRight, Hourglass, ArrowsClockwise, CheckSquare, Lightning } from '@phosphor-icons/react/dist/ssr';
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
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="brand">
              Quick Start
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {t('timerGuide.title')} <span className="text-2xl">🍅</span>
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            {t('timerGuide.subtitle')}
          </p>
        </div>

        {/* Content - Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-0 divide-x divide-border">
          {/* Left Column */}
          <div className="p-6 space-y-5">
            {/* Work Cycle */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-ink">
                <Timer size={16} className="text-ink-faint" />
                {t('timerGuide.modes.title')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">🍅</span>
                  <span className="font-medium text-ink">{t('timerGuide.modes.work')}</span>
                  <span className="text-ink-muted">— {t('timerGuide.modes.workDesc')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">☕</span>
                  <span className="font-medium text-ink">{t('timerGuide.modes.shortBreak')}</span>
                  <span className="text-ink-muted">— {t('timerGuide.modes.shortBreakDesc')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">🍊</span>
                  <span className="font-medium text-ink">{t('timerGuide.modes.longBreak')}</span>
                  <span className="text-ink-muted">— {t('timerGuide.modes.longBreakDesc')}</span>
                </div>
              </div>
            </section>

            {/* Valid Session */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-ink">
                  <ShieldCheck size={16} className="text-ink-faint" />
                  {t('timerGuide.validSession.title')}
                </h3>
                <span className="text-xs text-ink-muted">{t('timerGuide.validSession.subtitle')} 😏</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">✅</span>
                  <span className="font-medium text-ink">{t('timerGuide.validSession.rule')}</span>
                  <span className="text-ink-muted">→ {t('timerGuide.validSession.ruleDesc')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-base">🚫</span>
                  <span className="font-medium text-ink">{t('timerGuide.validSession.skip')}</span>
                  <span className="text-ink-muted">→ {t('timerGuide.validSession.skipDesc')}</span>
                </div>
              </div>
              <Badge variant="outline">
                {t('timerGuide.validSession.badge')}
              </Badge>
            </section>

            {/* Task Linking */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-ink">
                <LinkSimple size={16} className="text-ink-faint" />
                {t('timerGuide.task.title')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckSquare size={16} className="text-ink-faint" />
                  <span className="text-ink-muted">{t('timerGuide.task.select')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowsClockwise size={16} className="text-ink-faint" />
                  <span className="text-ink-muted">{t('timerGuide.task.auto')}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="p-6 space-y-5 bg-surface-raised">
            {/* Quick Tips - Keyboard */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-ink">
                <Lightning size={16} className="text-ink-faint" />
                {t('timerGuide.keyboard.title')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-surface">
                  <kbd className="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-border-strong bg-surface-raised text-ink">
                    Space
                  </kbd>
                  <span className="text-sm text-ink-muted">{t('timerGuide.keyboard.space')}</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-surface">
                  <kbd className="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 text-xs font-mono font-medium rounded-md border border-border-strong bg-surface-raised text-ink">
                    R
                  </kbd>
                  <span className="text-sm text-ink-muted">{t('timerGuide.keyboard.reset')}</span>
                </div>
              </div>
            </section>

            {/* Settings */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-ink">
                <Gear size={16} className="text-ink-faint" />
                {t('timerGuide.settings.title')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Hourglass size={16} className="text-ink-faint" />
                  <span className="text-ink-muted">{t('timerGuide.settings.customize')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowsClockwise size={16} className="text-ink-faint" />
                  <span className="text-ink-muted">{t('timerGuide.settings.autoStart')}</span>
                </div>
              </div>
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-brand transition-colors"
                onClick={() => onClose(dontShowAgain)}
              >
                {t('timerGuide.settings.openSettings')}
                <CaretRight size={12} />
              </Link>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-center gap-2.5 text-sm text-ink-muted cursor-pointer select-none group">
              <Checkbox
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <span className="group-hover:text-ink transition-colors">
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
