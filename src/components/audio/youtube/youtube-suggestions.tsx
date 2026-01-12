'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, Dice3 } from 'lucide-react';
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
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Gợi ý phù hợp để học tập/làm việc
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onPickRandomSuggestion}
          className="h-8"
        >
          <Dice3 className="h-4 w-4 mr-1" />
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
      <div className="text-xs text-muted-foreground">
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
        'hover:border-[#ff0000] hover:bg-[#ff0000]/5',
        isPlaying ? 'border-[#ff0000] bg-[#ff0000]/10' : 'border-transparent bg-background/80'
      )}
    >
      <button
        type="button"
        onClick={onPlay}
        className="absolute inset-0 w-full h-full"
        title={`Phát: ${suggestion.label}`}
      />
      <div className="min-w-0 relative">
        <div className="text-sm font-medium line-clamp-2">
          {suggestion.label}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-3 mt-1">
          {suggestion.description}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          YouTube
        </div>
        {/* Play button that appears on hover */}
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-full bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Play className="h-3 w-3" />
          </Button>
        </div>
        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute top-0 right-0">
            <div className="h-2 w-2 rounded-full bg-[#ff0000] animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
});

SuggestionCard.displayName = 'SuggestionCard';