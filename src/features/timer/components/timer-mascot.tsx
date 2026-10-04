'use client';

import { memo } from 'react';
import { Tomo } from '@/components/brand/tomo';
import { TomoBubble } from '@/components/brand/tomo-bubble';
import { useI18n } from '@/contexts/i18n-context';
import { useTomoMood } from '@/features/mascot/use-tomo-mood';
import { useSystemStore } from '@/stores/system-store';
import { useActiveTask } from '../hooks/use-active-task';

/** Same height for both states, so starting the timer does not move the card. */
// The stage shrinks with the viewport height (see .stage-card in globals.css): Tomo and the gap below follow it.
const SLOT = 'mb-(--stage-mascot-mb) flex min-h-(--stage-tomo) w-full items-center justify-center';

/**
 * Top of the timer card (spec §4.2, §7.3). Idle or on a break: Tomo with a speech bubble (greeting, break tip,
 * a nudge for the streak or for sleep). While a focus session runs: Tomo goes quiet and small, next to the task.
 */
export const TimerMascot = memo(function TimerMascot() {
    const { t } = useI18n();
    const mood = useTomoMood();
    const activeTask = useActiveTask();
    const isFullscreenFocus = useSystemStore((state) => state.isFocusMode);

    if (isFullscreenFocus) return null;

    if (mood.face === 'focus') {
        return (
            <div className={SLOT} data-tomo-focus>
                <div className="flex max-w-full items-center gap-2.5">
                    <Tomo face="focus" size={44} tight className="shrink-0" />
                    <span className="truncate font-heading text-lg font-bold text-ink">
                        {activeTask ? activeTask.title : t('timerUi.mode.work')}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={SLOT}>
            {mood.lineKey ? (
                <TomoBubble id="timer-mood" face={mood.face} tomoSize={72} className="w-full justify-center [&_svg[data-face]]:size-(--stage-tomo)">
                    {t(mood.lineKey)}
                </TomoBubble>
            ) : (
                <Tomo face={mood.face} size={72} className="size-(--stage-tomo)" />
            )}
        </div>
    );
});
