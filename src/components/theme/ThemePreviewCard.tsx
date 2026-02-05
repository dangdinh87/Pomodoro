'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ThemeVars } from '@/config/themes';
import { cn } from '@/lib/utils';

interface ThemePreviewCardProps {
  theme: ThemeVars;
  isSelected: boolean;
  onSelect: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemePreviewCard({
  theme,
  isSelected,
  onSelect,
  size = 'md',
}: ThemePreviewCardProps) {
  const sizeStyles = {
    sm: {
      card: 'p-2',
      emoji: 'text-xl',
      swatches: 'w-3 h-3',
      name: 'text-xs',
    },
    md: {
      card: 'p-3',
      emoji: 'text-2xl',
      swatches: 'w-4 h-4',
      name: 'text-sm',
    },
    lg: {
      card: 'p-4',
      emoji: 'text-3xl',
      swatches: 'w-5 h-5',
      name: 'text-base',
    },
  };

  const styles = sizeStyles[size];

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-full rounded-xl border-2 transition-all text-left',
        styles.card,
        isSelected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
          : 'border-border hover:border-primary/50 bg-card'
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-primary-foreground" />
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {/* Theme emoji */}
        <span className={styles.emoji}>{theme.emoji}</span>

        <div className="flex-1 min-w-0">
          {/* Theme name */}
          <p className={cn('font-medium truncate', styles.name)}>
            {theme.name}
          </p>

          {/* Color swatches */}
          <div className="flex gap-1 mt-1">
            <div
              className={cn(styles.swatches, 'rounded-full border border-border/50')}
              style={{ backgroundColor: `hsl(${theme.light.primary})` }}
              title="Primary"
            />
            <div
              className={cn(styles.swatches, 'rounded-full border border-border/50')}
              style={{ backgroundColor: `hsl(${theme.light.secondary})` }}
              title="Secondary"
            />
            <div
              className={cn(styles.swatches, 'rounded-full border border-border/50')}
              style={{ backgroundColor: `hsl(${theme.light.accent})` }}
              title="Accent"
            />
          </div>
        </div>

        {/* Mascot variant badge */}
        {theme.mascotVariant && theme.mascotVariant !== 'normal' && (
          <span className="text-xs text-muted-foreground capitalize">
            {theme.mascotVariant}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// Grid component for theme selection
interface ThemeGridProps {
  themes: ThemeVars[];
  selectedKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export function ThemeGrid({
  themes,
  selectedKey,
  onSelect,
  className,
}: ThemeGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {themes.map((theme) => (
        <ThemePreviewCard
          key={theme.key}
          theme={theme}
          isSelected={theme.key === selectedKey}
          onSelect={() => onSelect(theme.key)}
          size="sm"
        />
      ))}
    </div>
  );
}
