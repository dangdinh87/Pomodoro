'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useMascotStore, type MascotEvent } from '@/stores/mascot-store';

interface MascotContextValue {
  triggerEvent: (event: MascotEvent) => void;
}

const MascotContext = createContext<MascotContextValue | null>(null);

interface MascotProviderProps {
  children: ReactNode;
}

export function MascotProvider({ children }: MascotProviderProps) {
  const handleEvent = useMascotStore((state) => state.handleEvent);

  const triggerEvent = useCallback(
    (event: MascotEvent) => {
      handleEvent(event);
    },
    [handleEvent]
  );

  return (
    <MascotContext.Provider value={{ triggerEvent }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error('useMascot must be used within MascotProvider');
  }
  return context;
}

// Export types for consumers
export type { MascotEvent };
