'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Pause,
    Play,
    RotateCcw,
    SkipForwardIcon,
} from 'lucide-react';
import { useTranslation } from '@/contexts/i18n-context';

interface TimerControlsProps {
    isRunning: boolean;
    toggleTimer: () => void;
    resetTimer: () => void;
    handleSessionComplete: () => void;
    isProcessing: boolean;
}

export const TimerControls = memo(
    ({
        isRunning,
        toggleTimer,
        resetTimer,
        handleSessionComplete,
        isProcessing,
    }: TimerControlsProps) => {
        const { t } = useTranslation();

        return (
            <div className="flex justify-center gap-3">
                <Button
                    onClick={toggleTimer}
                    disabled={isProcessing}
                    aria-label={
                        isRunning
                            ? t('timer.controls.aria.pause')
                            : t('timer.controls.aria.start')
                    }
                    aria-pressed={isRunning}
                    title={
                        isRunning
                            ? t('timer.controls.pause_hint')
                            : t('timer.controls.start_hint')
                    }
                    className="min-w-[100px]"
                >
                    {isRunning ? (
                        <span className="inline-flex items-center gap-2">
                            <Pause size={18} /> {t('timer.controls.pause')}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            <Play size={18} /> {t('timer.controls.start')}
                        </span>
                    )}
                </Button>
                <Button
                    onClick={resetTimer}
                    disabled={isProcessing}
                    aria-label={t('timer.controls.aria.reset')}
                    title={t('timer.controls.reset_hint')}
                    variant="outline"
                >
                    <span className="inline-flex items-center gap-2">
                        <RotateCcw size={18} />
                    </span>
                </Button>

                <Button
                    onClick={handleSessionComplete}
                    disabled={isProcessing}
                    variant="outline"
                    title={t('timer.controls.skip_hint')}
                >
                    <span className="inline-flex items-center gap-2">
                        <SkipForwardIcon size={18} />
                    </span>
                </Button>
            </div>
        );
    }
);

TimerControls.displayName = 'TimerControls';
