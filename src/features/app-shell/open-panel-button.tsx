'use client';

import type { ReactNode } from 'react';
import { openPanel, type PanelId } from './panel-store';

/** Lets server-rendered content on `/` open an app panel in place. */
export function OpenPanelButton({ panel, className, children }: { panel: PanelId; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => openPanel(panel)}>
      {children}
    </button>
  );
}
