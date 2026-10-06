/** Apple platforms use ⌘; everything else (Windows, Linux, ChromeOS) uses Ctrl. */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** "⌘K" on Apple platforms, "Ctrl K" elsewhere. */
export function modShortcut(key: string): string {
  return isApplePlatform() ? `⌘${key}` : `Ctrl ${key}`;
}
