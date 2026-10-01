'use client';

import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { openPanel, type PanelId } from '@/features/app-shell/panel-store';

/**
 * Link into an app panel. On `/` the panel opens in place; from any other page
 * it is a normal navigation to `/?panel=…`, which the app opens on load.
 */
export function PanelLink({ panel, className, children }: { panel: PanelId; className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openPanel(panel);
  };
  return (
    <Link href={`/?panel=${panel}`} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
