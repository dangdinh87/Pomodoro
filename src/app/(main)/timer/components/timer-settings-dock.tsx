'use client';

import { memo, useState } from 'react';
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
import { AudioSettingsModal } from '@/components/settings/audio-settings-modal';
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
    const isAudioPlaying = (currentlyPlaying?.isPlaying ?? false) || activeAmbientSounds.length > 0;
    const hasActiveAudio = !!currentlyPlaying || activeAmbientSounds.length > 0;

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
                                                    ? "bg-red-500/90 border-red-500/50 text-white hover:bg-red-500 shadow-lg shadow-red-500/25 pulse-red"
                                                    : "bg-gradient-to-br from-primary/80 to-primary border-primary/50 text-primary-foreground hover:from-primary hover:to-primary/90 shadow-lg shadow-primary/25"
                                                : "bg-background/20 hover:bg-background/40 border-white/10 text-foreground"
                                        )}
                                        onClick={() => setAudioSettingsOpen(true)}
                                    >
                                        {hasActiveAudio ? (
                                            <div className="flex items-center justify-center">
                                                {currentlyPlaying?.type === 'youtube' ? (
                                                    <svg className="h-5 w-5 text-white fill-current" viewBox="0 0 24 24">
                                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                    </svg>
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
                                                {activeAmbientSounds.length > 0 && currentlyPlaying.type !== 'ambient' && (
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        + {activeAmbientSounds.length} ambient sound{activeAmbientSounds.length > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : activeAmbientSounds.length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <AudioLines size={16} className="shrink-0" animate={true} />
                                            <span className="max-w-[180px] truncate">
                                                {activeAmbientSounds.length === 1
                                                    ? "Ambient Sound Playing"
                                                    : `Mixed Ambient (${activeAmbientSounds.length} sounds)`}
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

                <AudioSettingsModal
                    isOpen={audioSettingsOpen}
                    onClose={() => setAudioSettingsOpen(false)}
                />

                <BackgroundSettingsModal
                    isOpen={backgroundSettingsOpen}
                    onClose={() => setBackgroundSettingsOpen(false)}
                />
            </div>
        </>
    );
});
