'use client';

import { memo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { MusicNotes, ImageSquare, Clock, ArrowsOut, ArrowsIn } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';
import { useSystemStore } from '@/stores/system-store';
import { useAudioStore } from '@/stores/audio-store';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import { TimerSettingsModal } from '@/components/settings/timer-settings-modal';
import { AudioSidebar } from '@/components/audio/audio-sidebar';
import BackgroundSettingsModal from '@/components/settings/background-settings-modal';

const DOCK_BUTTON =
    'h-10 w-10 rounded-full border border-border bg-surface/60 text-ink-secondary backdrop-blur-md hover:bg-surface-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-brand';

export const TimerSettingsDock = memo(function TimerSettingsDock() {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();
    const { isFocusMode, setFocusMode, isTimerSettingsOpen, setTimerSettingsOpen } = useSystemStore();
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Store access
    const currentlyPlaying = useAudioStore((state) => state.currentlyPlaying);
    const activeAmbientSounds = useAudioStore((state) => state.activeAmbientSounds);
    const activeAmbientWithVolume = activeAmbientSounds.filter(s => s.volume > 0);
    const isAudioPlaying = (currentlyPlaying?.isPlaying ?? false) || activeAmbientWithVolume.length > 0;
    const hasActiveAudio = !!currentlyPlaying || activeAmbientWithVolume.length > 0;

    // Local Modal States
    const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
    const [backgroundSettingsOpen, setBackgroundSettingsOpen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
                setFocusMode(true);
            }).catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                    setFocusMode(false);
                });
            }
        }
    };

    return (
        <>
            <div data-chrome className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
                <TooltipProvider>
                    {!isFocusMode && (
                        <>
                            {/* Music Button */}
                            <Tooltip side="top">
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t('timerComponents.enhancedTimer.soundSettings')}
                                        className={cn(
                                            DOCK_BUTTON,
                                            hasActiveAudio && "border-transparent bg-primary text-white hover:bg-primary/90"
                                        )}
                                        onClick={() => setAudioSettingsOpen(true)}
                                    >
                                        {hasActiveAudio ? (
                                            <div className="flex items-center justify-center relative w-full h-full">
                                                {currentlyPlaying?.type === 'youtube' ? (
                                                    <>
                                                        {/* Icon - Animated only when playing */}
                                                        <motion.svg
                                                            className="relative z-10 h-5 w-5 fill-current text-white"
                                                            viewBox="0 0 24 24"
                                                            aria-hidden="true"
                                                            animate={isAudioPlaying && !reduceMotion ? {
                                                                scale: [1, 1.15, 1],
                                                            } : undefined}
                                                            transition={isAudioPlaying && !reduceMotion ? {
                                                                duration: 1.2,
                                                                repeat: Infinity,
                                                                ease: "easeInOut",
                                                            } : undefined}
                                                        >
                                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                        </motion.svg>
                                                    </>
                                                ) : (
                                                    <AudioLines size={20} animate={isAudioPlaying && !reduceMotion} className="text-white" aria-hidden="true" />
                                                )}
                                            </div>
                                        ) : (
                                            <MusicNotes size={20} aria-hidden="true" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {hasActiveAudio && currentlyPlaying ? (
                                        <div className="flex items-center gap-2">
                                            {currentlyPlaying.type === 'youtube' ? (
                                                <svg className="h-4 w-4 shrink-0 text-danger" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                            ) : (
                                                <AudioLines size={16} className="shrink-0" animate={isAudioPlaying} />
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="max-w-[180px] truncate">{currentlyPlaying.name}</span>
                                                {activeAmbientWithVolume.length > 0 && currentlyPlaying.type !== 'ambient' && (
                                                    <span className="text-[0.6875rem] font-medium text-ink-muted">
                                                        {t('timerUi.dock.moreAmbient').replace('{count}', String(activeAmbientWithVolume.length))}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : activeAmbientWithVolume.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <AudioLines size={16} className="shrink-0" animate={true} />
                                            <span className="max-w-[180px] truncate">
                                                {activeAmbientWithVolume.length === 1
                                                    ? t('timerUi.dock.ambientPlaying')
                                                    : t('timerUi.dock.ambientMix').replace('{count}', String(activeAmbientWithVolume.length))}
                                            </span>
                                        </div>
                                    ) : (
                                        <p>{t('timerUi.dock.sounds')}</p>
                                    )}
                                </TooltipContent>
                            </Tooltip>

                            {/* Background Button */}
                            <Tooltip side="top">
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t('timerComponents.enhancedTimer.backgroundSettings')}
                                        className={DOCK_BUTTON}
                                        onClick={() => setBackgroundSettingsOpen(true)}
                                    >
                                        <ImageSquare size={20} aria-hidden="true" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('timerUi.dock.scene')}</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Settings Button */}
                            <Tooltip side="top">
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t('timerComponents.enhancedTimer.timerSettings')}
                                        className={DOCK_BUTTON}
                                        onClick={() => setTimerSettingsOpen(true)}
                                    >
                                        <Clock size={20} aria-hidden="true" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('timerUi.dock.timer')}</p>
                                </TooltipContent>
                            </Tooltip>
                        </>
                    )}

                    {/* Fullscreen Button */}
                    <Tooltip side="top">
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={isFullscreen ? t('timerComponents.enhancedTimer.exitFocus') : t('timerComponents.enhancedTimer.enterFocus')}
                                className={DOCK_BUTTON}
                                onClick={toggleFullscreen}
                            >
                                {isFullscreen ? (
                                    <ArrowsIn size={20} aria-hidden="true" />
                                ) : (
                                    <ArrowsOut size={20} aria-hidden="true" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isFullscreen ? t('timerUi.dock.exitFocus') : t('timerUi.dock.focus')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TimerSettingsModal
                    isOpen={isTimerSettingsOpen}
                    onClose={() => setTimerSettingsOpen(false)}
                />

                <AudioSidebar
                    open={audioSettingsOpen}
                    onOpenChange={setAudioSettingsOpen}
                />

                <BackgroundSettingsModal
                    isOpen={backgroundSettingsOpen}
                    onClose={() => setBackgroundSettingsOpen(false)}
                />
            </div>
        </>
    );
});
