/** iPhone Safari has no Fullscreen API for pages: offering the button there would do nothing. */
export function canFullscreen(): boolean {
  return typeof document !== 'undefined' && typeof document.documentElement.requestFullscreen === 'function';
}

/**
 * Enters or leaves browser fullscreen. Focus mode follows the `fullscreenchange` event (see AppDock),
 * so this never touches the store: Esc or the OS can leave fullscreen without going through here.
 */
export async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch (error) {
    console.error('Fullscreen toggle failed', error);
  }
}
