import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drives a horizontally-scrolling row's optional left/right arrow buttons: tracks whether there is
 * more content to either side (so a caller only renders an arrow when it would do something) and
 * exposes click handlers that scroll by a fixed step. Re-checks on scroll and on resize.
 */
export function useScrollArrows<T extends HTMLElement = HTMLDivElement>(step = 200) {
  const scrollRef = useRef<T>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -step, behavior: 'smooth' });
  }, [step]);

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: step, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    // Chip rows can change length without a resize (filters applied, items loaded): ResizeObserver
    // catches content width changes a plain resize listener would miss.
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
    };
  }, [checkScroll]);

  return { scrollRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight };
}
