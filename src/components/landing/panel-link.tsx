'use client';

import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/contexts/i18n-context';
import { openPanel, type PanelId } from '@/features/app-shell/panel-store';
import { localePath, pathWithoutLocale } from '@/lib/i18n/locale-path';

/**
 * Link into an app panel. On the app's own page (`/`, `/vi`, `/ja`) the panel opens in place;
 * from any other page it is a normal navigation to `/<lang>?panel=…`, which the app opens on load.
 */
export function PanelLink({ panel, className, children }: { panel: PanelId; className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const { lang } = useI18n();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathWithoutLocale(pathname) !== '/' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openPanel(panel);
  };
  return (
    <Link href={localePath(lang, `/?panel=${panel}`)} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
