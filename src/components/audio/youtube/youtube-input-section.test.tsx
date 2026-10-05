import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '@/test-utils/i18n';
import type { YouTubeOEmbedResponse } from '@/lib/youtube-utils';
import { YouTubeInputSection } from './youtube-input-section';
import { YouTubeThumbnail } from './youtube-thumbnail';

const details = { title: 'Lofi Girl - beats to sleep/chill to' } as YouTubeOEmbedResponse;

function renderSection(playerStatus: 'playing' | 'paused', thumbnailUrl?: string) {
  return render(
    <I18nProvider initialLang="en">
      <YouTubeInputSection
        youtubeUrl="https://www.youtube.com/watch?v=rUxyKA_-grg"
        onUrlChange={() => {}}
        parsedUrl={{ videoId: 'rUxyKA_-grg', listId: null, isChannel: false } as never}
        playerStatus={playerStatus}
        currentSource={{ videoId: 'rUxyKA_-grg' } as never}
        onTogglePlayback={() => {}}
        onStop={() => {}}
        playingVideoDetails={details}
        thumbnailUrl={thumbnailUrl}
      />
    </I18nProvider>,
  );
}

describe('YouTubeInputSection: the now-playing card', () => {
  it('names the video while it plays', () => {
    renderSection('playing');
    expect(screen.getByText(details.title)).toBeInTheDocument();
    expect(screen.getByText('Playing')).toBeInTheDocument();
  });

  it('still names the video while paused (it used to say "Sound settings")', () => {
    renderSection('paused');
    expect(screen.getByText(details.title)).toBeInTheDocument();
    expect(screen.queryByText('Sound settings')).not.toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('shows the Play placeholder instead of a broken image when the thumbnail fails', () => {
    const { container } = renderSection('playing', 'https://img.youtube.com/vi/gone/hqdefault.jpg');
    const img = container.querySelector('img')!;
    expect(img).toBeInTheDocument();
    fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('YouTubeThumbnail', () => {
  it('falls back for the address that failed, and tries a different video again', () => {
    const fallback = <span>fallback</span>;
    const { container, rerender } = render(<YouTubeThumbnail src="https://x/a.jpg" fallback={fallback} />);
    fireEvent.error(container.querySelector('img')!);
    expect(screen.getByText('fallback')).toBeInTheDocument();

    rerender(<YouTubeThumbnail src="https://x/b.jpg" fallback={fallback} />);
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://x/b.jpg');
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('shows the fallback when there is no address at all', () => {
    render(<YouTubeThumbnail src={null} fallback={<span>fallback</span>} />);
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });
});
