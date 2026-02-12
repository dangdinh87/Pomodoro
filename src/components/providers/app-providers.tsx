'use client';

/**
 * Consolidated app providers wrapper
 * Used for authenticated app sections (main, auth) - NOT for landing page
 * This allows landing page to be SSR while app sections remain CSR
 */
import { ThemeProvider } from '@/components/layout/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { I18nProvider } from '@/contexts/i18n-context';
import { SupabaseAuthProvider } from '@/components/providers/supabase-auth-provider';
import { BackgroundRenderer } from '@/components/background/background-renderer';
import { ThemeRestorer } from '@/components/providers/theme-restorer';
import { AudioCleanupProvider } from '@/components/providers/audio-cleanup-provider';
import { FloatingPlayerBar } from '@/components/audio/youtube/floating-player-bar';
import { useYouTubePlayer } from '@/hooks/use-youtube-player';
import { useAudioStore } from '@/stores/audio-store';
import { getYouTubeThumbnailUrl } from '@/data/youtube-suggestions';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NextTopLoader from 'nextjs-toploader';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * YouTube Floating Player - renders the floating player bar at the bottom
 * Must be inside QueryProvider to use hooks
 */
function YouTubeFloatingPlayer() {
  const { playerState, togglePlayback } = useYouTubePlayer();
  const currentlyPlaying = useAudioStore((s) => s.currentlyPlaying);
  const audioSettings = useAudioStore((s) => s.audioSettings);
  const updateVolume = useAudioStore((s) => s.updateVolume);

  // Only show when YouTube is active and has a source
  const isVisible =
    currentlyPlaying?.type === 'youtube' &&
    playerState.currentSource !== null &&
    playerState.status !== 'stopped';

  // Get video title and thumbnail
  const title = currentlyPlaying?.name || 'YouTube';
  const thumbnailUrl = playerState.currentSource?.videoId
    ? getYouTubeThumbnailUrl(playerState.currentSource.videoId)
    : undefined;

  const isPlaying = playerState.status === 'playing';

  return (
    <FloatingPlayerBar
      isVisible={isVisible}
      title={title}
      thumbnailUrl={thumbnailUrl}
      isPlaying={isPlaying}
      volume={audioSettings.masterVolume}
      onTogglePlay={() => {
        const source = playerState.currentSource;
        if (source) {
          togglePlayback(source.videoId, source.listId, source.isChannel);
        }
      }}
      onVolumeChange={updateVolume}
    />
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <NextTopLoader
        color="hsl(var(--primary))"
        showSpinner={false}
        height={3}
        crawlSpeed={200}
        speed={200}
      />
      <I18nProvider>
        <TooltipProvider>
          <QueryProvider>
            <SupabaseAuthProvider />
            <ThemeRestorer />
            <AudioCleanupProvider />
            <BackgroundRenderer />
            {children}
            <Toaster />
            {/* <YouTubeFloatingPlayer /> */}
          </QueryProvider>
        </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
