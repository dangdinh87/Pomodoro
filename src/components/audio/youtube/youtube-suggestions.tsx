'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, DiceThree } from '@phosphor-icons/react/dist/ssr';
import { YouTubeSuggestion } from '@/data/youtube-suggestions';

interface YouTubeSuggestionsProps {
  suggestions: YouTubeSuggestion[];
  currentPlayingSuggestion: string;
  currentYoutubeUrl: string;
  currentSource: { videoId?: string; listId?: string } | null;
  onPlaySuggestion: (suggestion: YouTubeSuggestion) => void;
  onPickRandomSuggestion: () => void;
}

export const YouTubeSuggestions = memo(({
  suggestions,
  currentPlayingSuggestion,
  currentYoutubeUrl,
  currentSource,
  onPlaySuggestion,
  onPickRandomSuggestion,
}: YouTubeSuggestionsProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase text-ink-muted">
          Gợi ý phù hợp để học tập/làm việc
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onPickRandomSuggestion}
          className="h-8"
        >
          <DiceThree size={16} className="mr-1" />
          Random
        </Button>
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {suggestions.map((item) => {
          const isPlaying = Boolean(
            currentPlayingSuggestion === item.url ||
            (currentSource && currentYoutubeUrl === item.url)
          );

          return (
            <SuggestionCard
              key={item.url}
              suggestion={item}
              isPlaying={isPlaying}
              onPlay={() => onPlaySuggestion(item)}
            />
          );
        })}
      </div>
      <div className="text-xs text-ink-muted">
        Nhạc sẽ tiếp tục phát trong nền 🎧 khi bạn bấm Phát nền.
      </div>
    </div>
  );
});

YouTubeSuggestions.displayName = 'YouTubeSuggestions';

interface SuggestionCardProps {
  suggestion: YouTubeSuggestion;
  isPlaying: boolean;
  onPlay: () => void;
}

const SuggestionCard = memo(({ suggestion, isPlaying, onPlay }: SuggestionCardProps) => {
  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg border text-left transition-all',
        'bg-surface hover:bg-surface-hover',
        isPlaying ? 'border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]' : 'border-border'
      )}
    >
      <button
        type="button"
        onClick={onPlay}
        className="absolute inset-0 w-full h-full"
        title={`Phát: ${suggestion.label}`}
      />
      <div className="min-w-0 relative">
        <div className="text-sm font-medium text-ink line-clamp-2">
          {suggestion.label}
        </div>
        <div className="text-xs text-ink-muted line-clamp-3 mt-1">
          {suggestion.description}
        </div>
        <div className="text-xs text-ink-muted mt-1">
          YouTube
        </div>
        {/* Play button that appears on hover */}
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-full bg-surface hover:bg-surface-hover"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Play size={12} weight="fill" />
          </Button>
        </div>
        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute top-0 right-0">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        )}
      </div>
    </div>
  );
});

SuggestionCard.displayName = 'SuggestionCard';