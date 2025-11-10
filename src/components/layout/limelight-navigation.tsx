'use client';

import AudioSettingsModal from '@/components/settings/audio-settings-modal';
import BackgroundSettingsModal from '@/components/settings/background-settings-modal';
import ThemeSettingsModal from '@/components/settings/theme-settings-modal';
import TimerSettingsModal from '@/components/settings/timer-settings-modal';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Button } from '@/components/ui/button';
import { LimelightNav, NavItem } from '@/components/ui/shadcn-io/limelight-nav';
import {
  BarChart3,
  CheckSquare,
  Image,
  Music,
  Palette,
  Shield,
  Timer,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import audioManager from '@/lib/audio/audio-manager';

export function LimelightNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Poll lightweight playback state (AudioManager, YouTube, or any <audio> elements)
  useEffect(() => {
    const check = () => {
      try {
        if (audioManager.isPlaying) return true;
      } catch {}
      try {
        const w = window as any;
        const yt = w.__globalYTPlayer;
        // 1 === YT.PlayerState.PLAYING
        if (yt && typeof yt.getPlayerState === 'function' && yt.getPlayerState() === 1) {
          return true;
        }
      } catch {}
      try {
        const audios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
        if (audios.some(a => !a.paused && !a.ended && a.currentTime > 0)) return true;
      } catch {}
      return false;
    };
    const tick = () => setIsAudioPlaying(check());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const navigationItems: NavItem[] = [
    {
      id: 'timer',
      icon: <Timer className="w-6 h-6" />,
      label: 'Timer',
      onClick: () => router.push('/timer'),
    },
    {
      id: 'focus',
      icon: <Shield className="w-6 h-6" />,
      label: 'Focus Mode',
      onClick: () => router.push('/focus'),
    },
    {
      id: 'tasks',
      icon: <CheckSquare className="w-6 h-6" />,
      label: 'Tasks',
      onClick: () => router.push('/tasks'),
    },
    {
      id: 'progress',
      icon: <BarChart3 className="w-6 h-6" />,
      label: 'Progress',
      onClick: () => router.push('/progress'),
    },
  ];

  const getActiveIndex = () => {
    const path = pathname.replace('/', '');
    const activePath = path || 'timer';

    const index = navigationItems.findIndex((item) => item.id === activePath);
    return index >= 0 ? index : 0;
  };

  const [activeIndex, setActiveIndex] = useState(getActiveIndex());

  useEffect(() => {
    setActiveIndex(getActiveIndex());
  }, [pathname]);

  return (
    <>
      {/* Top Center Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
        <LimelightNav
          items={navigationItems}
          defaultActiveIndex={activeIndex}
          onTabChange={(index) => {
            setActiveIndex(index);
            // Don't call onClick here, let the component handle the navigation
            // We'll handle it in the navigation items themselves
          }}
          className="bg-background/10 backdrop-blur-sm border-border/20 shadow-lg"
          limelightClassName="bg-primary/80 shadow-[0_50px_15px_var(--primary)]"
          iconContainerClassName=""
        />
      </div>
      {/* Top Right Controls (vertical): Darkmode, Timer Settings, Theme, Background, Audio */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          title="Toggle theme"
          className="bg-background/10 backdrop-blur-sm border border-border/20 shadow-lg"
          asChild
        >
          <AnimatedThemeToggler />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Timer settings"
          className="bg-background/10 backdrop-blur-sm border border-border/20 shadow-lg"
          onClick={() => setIsTimerSettingsOpen(true)}
        >
          <Timer className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Theme settings"
          className="bg-background/10 backdrop-blur-sm border border-border/20 shadow-lg"
          onClick={() => setIsThemeOpen(true)}
        >
          <Palette className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Background setup"
          className="bg-background/10 backdrop-blur-sm border border-border/20 shadow-lg"
          onClick={() => setIsBackgroundOpen(true)}
        >
          <Image className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Focus music / Nature sounds"
          className="bg-background/10 backdrop-blur-sm border border-border/20 shadow-lg"
          onClick={() => setIsAudioOpen(true)}
        >
          {isAudioPlaying ? (
            <AnimateIcon animate>
              <AudioLines size={20} />
            </AnimateIcon>
          ) : (
            <Music className="w-5 h-5" />
          )}
        </Button>
      </div>

      <ThemeSettingsModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />
      <TimerSettingsModal
        isOpen={isTimerSettingsOpen}
        onClose={() => setIsTimerSettingsOpen(false)}
      />
      <AudioSettingsModal
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
      />
      <BackgroundSettingsModal
        isOpen={isBackgroundOpen}
        onClose={() => setIsBackgroundOpen(false)}
      />
    </>
  );
}
