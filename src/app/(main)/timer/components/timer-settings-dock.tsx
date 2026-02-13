'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Music, Wallpaper, Clock, Maximize2, Minimize2 } from 'lucide-react';
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
import { useSidebar } from '@/components/ui/sidebar';

export const TimerSettingsDock = memo(function TimerSettingsDock() {
    const { t } = useTranslation();
    const { isFocusMode, setFocusMode } = useSystemStore();
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Store access
    const { setOpen: setSidebarOpen } = useSidebar();
    const currentlyPlaying = useAudioStore((state) => state.currentlyPlaying);
    const activeAmbientSounds = useAudioStore((state) => state.activeAmbientSounds);
    const activeAmbientWithVolume = activeAmbientSounds.filter(s => s.volume > 0);
    const isAudioPlaying = (currentlyPlaying?.isPlaying ?? false) || activeAmbientWithVolume.length > 0;
    const hasActiveAudio = !!currentlyPlaying || activeAmbientWithVolume.length > 0;

    // Local Modal States
    const [timerSettingsOpen, setTimerSettingsOpen] = useState(false);
    const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
    const [backgroundSettingsOpen, setBackgroundSettingsOpen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
                setFocusMode(true);
                setSidebarOpen(false);
            }).catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                    setFocusMode(false);
                    setSidebarOpen(true);
                });
            }
        }
    };

    return (
        <>
            <div className="absolute bottom-0 left-0 z-10 flex gap-2 items-center ps-4">
                <TooltipProvider>
                    {!isFocusMode && (
                        <>
                            {/* Music Button */}
                            <Tooltip side="top">
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-10 w-10 rounded-full backdrop-blur-sm border transition-all relative overflow-visible",
                                            hasActiveAudio
                                                ? currentlyPlaying?.type === 'youtube'
                                                    ? isAudioPlaying
                                                        ? "bg-red-500/90 border-red-500/50 text-white hover:bg-red-500 shadow-lg shadow-red-500/25 pulse-red"
                                                        : "bg-red-500/60 border-red-500/40 text-white hover:bg-red-500/80 shadow-md shadow-red-500/20"
                                                    : "bg-gradient-to-br from-primary/80 to-primary border-primary/50 text-primary-foreground hover:from-primary hover:to-primary/90 shadow-lg shadow-primary/25"
                                                : "bg-background/20 hover:bg-background/40 border-white/10 text-foreground"
                                        )}
                                        onClick={() => setAudioSettingsOpen(true)}
                                        aria-label={t('timerComponents.enhancedTimer.soundSettings')}
                                    >
                                        {hasActiveAudio ? (
                                            <div className="flex items-center justify-center relative w-full h-full">
                                                {currentlyPlaying?.type === 'youtube' ? (
                                                    <>
                                                        {/* Ripple/Glow Effect - Only when playing */}
                                                        {isAudioPlaying && (
                                                            <motion.div
                                                                className="absolute inset-0 rounded-full border-2 border-white/80"
                                                                animate={{
                                                                    scale: [1, 1.3, 1],
                                                                    opacity: [0.8, 0, 0.8],
                                                                }}
                                                                transition={{
                                                                    duration: 1.2,
                                                                    repeat: Infinity,
                                                                    ease: "easeInOut",
                                                                }}
                                                            />
                                                        )}
                                                        {/* Icon - Animated only when playing */}
                                                        <motion.svg
                                                            className="h-5 w-5 text-white fill-current relative z-10"
                                                            viewBox="0 0 24 24"
                                                            animate={isAudioPlaying ? {
                                                                scale: [1, 1.2, 1],
                                                            } : undefined}
                                                            transition={isAudioPlaying ? {
                                                                duration: 1.2,
                                                                repeat: Infinity,
                                                                ease: "easeInOut",
                                                            } : undefined}
                                                        >
                                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                        </motion.svg>
                                                    </>
                                                ) : (
                                                    <AudioLines size={20} animate={isAudioPlaying} className="text-background" />
                                                )}
                                            </div>
                                        ) : (
                                            <Music className="h-5 w-5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {hasActiveAudio && currentlyPlaying ? (
                                        <div className="flex items-center gap-2">
                                            {currentlyPlaying.type === 'youtube' ? (
                                                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="#ff0000">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                            ) : (
                                                <AudioLines size={16} className="shrink-0" animate={isAudioPlaying} />
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="max-w-[180px] truncate">{currentlyPlaying.name}</span>
                                                {activeAmbientWithVolume.length > 0 && currentlyPlaying.type !== 'ambient' && (
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        + {activeAmbientWithVolume.length} ambient sound{activeAmbientWithVolume.length > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : activeAmbientWithVolume.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <AudioLines size={16} className="shrink-0" animate={true} />
                                            <span className="max-w-[180px] truncate">
                                                {activeAmbientWithVolume.length === 1
                                                    ? "Ambient Sound Playing"
                                                    : `Mixed Ambient (${activeAmbientWithVolume.length} sounds)`}
                                            </span>
                                        </div>
                                    ) : (
                                        <p>{t('timerComponents.enhancedTimer.soundSettings')}</p>
                                    )}
                                </TooltipContent>
                            </Tooltip>

                            {/* Background Button */}
                            <Tooltip side="top">
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 border border-white/10 text-foreground"
                                        onClick={() => setBackgroundSettingsOpen(true)}
                                        aria-label={t('timerComponents.enhancedTimer.backgroundSettings')}
                                    >
                                        <Wallpaper className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('timerComponents.enhancedTimer.backgroundSettings')}</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Settings Button */}
                            <Tooltip side="top">
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 border border-white/10 text-foreground"
                                        onClick={() => setTimerSettingsOpen(true)}
                                        aria-label={t('timerComponents.enhancedTimer.timerSettings')}
                                    >
                                        <Clock className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('timerComponents.enhancedTimer.timerSettings')}</p>
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
                                className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 border border-white/10 text-foreground"
                                onClick={toggleFullscreen}
                                aria-label={isFullscreen ? t('timerComponents.enhancedTimer.exitFocus') : t('timerComponents.enhancedTimer.enterFocus')}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-5 w-5" />
                                ) : (
                                    <Maximize2 className="h-5 w-5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isFullscreen ? t('timerComponents.enhancedTimer.exitFocus') : t('timerComponents.enhancedTimer.enterFocus')}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TimerSettingsModal
                    isOpen={timerSettingsOpen}
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
