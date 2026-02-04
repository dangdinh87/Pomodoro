'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useMascotStore, type MascotState } from '@/stores/mascot-store';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { Mascot } from './Mascot';

// Map mascot states to Lottie animation URLs from LottieFiles CDN
// Using free Shiba Inu animations (placeholder - replace with actual Shiba assets)
const LOTTIE_SOURCES: Record<MascotState, string> = {
  happy: 'https://lottie.host/e0e82a86-c7f9-4a8c-bff1-0c8e05a7e1e5/FTxvWWXxVZ.lottie',
  focused: 'https://lottie.host/e0e82a86-c7f9-4a8c-bff1-0c8e05a7e1e5/FTxvWWXxVZ.lottie',
  encouraging: 'https://lottie.host/e0e82a86-c7f9-4a8c-bff1-0c8e05a7e1e5/FTxvWWXxVZ.lottie',
  sleepy: 'https://lottie.host/e0e82a86-c7f9-4a8c-bff1-0c8e05a7e1e5/FTxvWWXxVZ.lottie',
  excited: 'https://lottie.host/e0e82a86-c7f9-4a8c-bff1-0c8e05a7e1e5/FTxvWWXxVZ.lottie',
  worried: 'https://lottie.host/e0e82a86-c7f9-4a8c-bff1-0c8e05a7e1e5/FTxvWWXxVZ.lottie',
  sad: 'https://lottie.host/e0e82a86-c7f9-4a8c-bff1-0c8e05a7e1e5/FTxvWWXxVZ.lottie',
  celebrating: 'https://lottie.host/e0e82a86-c7f9-4a8c-bff1-0c8e05a7e1e5/FTxvWWXxVZ.lottie',
};

interface LottieMascotProps {
  size?: number;
  className?: string;
  state?: MascotState;
}

export function LottieMascot({ size = 120, className, state }: LottieMascotProps) {
  const { currentState, reducedMotion } = useMascotStore();
  const [hasError, setHasError] = useState(false);

  const mascotState = state ?? currentState;

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Fallback to SVG mascot if Lottie fails
  if (hasError) {
    const sizeClass = size <= 48 ? 'sm' : size <= 80 ? 'md' : size <= 128 ? 'lg' : 'xl';
    return <Mascot size={sizeClass} className={className} override={mascotState} />;
  }

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <DotLottieReact
        src={LOTTIE_SOURCES[mascotState]}
        loop
        autoplay={!reducedMotion}
        style={{ width: '100%', height: '100%' }}
        onError={handleError}
      />
    </div>
  );
}
