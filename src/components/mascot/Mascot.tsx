'use client';

import { useMascotStore, type MascotState } from '@/stores/mascot-store';
import { useReducedMotion } from 'framer-motion';
import { lazy, Suspense, useEffect, ComponentType } from 'react';
import { cn } from '@/lib/utils';

// Lazy load expressions for code splitting
const expressions: Record<MascotState, ComponentType<{ className?: string }>> = {
  happy: lazy(() =>
    import('./expressions/HappyMascot').then((m) => ({ default: m.HappyMascot }))
  ),
  focused: lazy(() =>
    import('./expressions/FocusedMascot').then((m) => ({ default: m.FocusedMascot }))
  ),
  encouraging: lazy(() =>
    import('./expressions/EncouragingMascot').then((m) => ({ default: m.EncouragingMascot }))
  ),
  sleepy: lazy(() =>
    import('./expressions/SleepyMascot').then((m) => ({ default: m.SleepyMascot }))
  ),
  excited: lazy(() =>
    import('./expressions/ExcitedMascot').then((m) => ({ default: m.ExcitedMascot }))
  ),
  worried: lazy(() =>
    import('./expressions/WorriedMascot').then((m) => ({ default: m.WorriedMascot }))
  ),
  sad: lazy(() =>
    import('./expressions/SadMascot').then((m) => ({ default: m.SadMascot }))
  ),
  celebrating: lazy(() =>
    import('./expressions/CelebratingMascot').then((m) => ({ default: m.CelebratingMascot }))
  ),
};

interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  override?: MascotState;
}

const sizeMap = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

export function Mascot({ size = 'md', className, override }: MascotProps) {
  const { currentState, setReducedMotion } = useMascotStore();
  const shouldReduceMotion = useReducedMotion();

  // Sync reduced motion preference
  useEffect(() => {
    setReducedMotion(!!shouldReduceMotion);
  }, [shouldReduceMotion, setReducedMotion]);

  const state = override ?? currentState;
  const Expression = expressions[state];

  return (
    <div className={cn(sizeMap[size], 'relative', className)}>
      <Suspense fallback={<MascotSkeleton size={size} />}>
        <Expression className="w-full h-full" />
      </Suspense>
    </div>
  );
}

function MascotSkeleton({ size }: { size: keyof typeof sizeMap }) {
  return (
    <div
      className={cn(
        sizeMap[size],
        'rounded-full bg-gradient-to-br from-amber-200 to-amber-300 animate-pulse'
      )}
    />
  );
}

// Export for direct imports
export { expressions };
