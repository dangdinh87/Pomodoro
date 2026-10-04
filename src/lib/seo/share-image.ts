/**
 * The one Open Graph / Twitter share image (src/app/opengraph-image.tsx). Next does not carry a
 * parent's file-based image into a page that sets its own `openGraph`, so buildPageMetadata
 * names it explicitly; both read the same constants.
 */
export const SHARE_IMAGE_PATH = '/opengraph-image';
export const SHARE_IMAGE_ALT = 'Study Bro: free Pomodoro timer with tasks and focus sounds';
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };
