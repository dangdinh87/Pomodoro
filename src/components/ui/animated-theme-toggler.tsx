'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<'button'> {
  duration?: number;
  showLabel?: boolean;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  showLabel = false,
  ...props
}: AnimatedThemeTogglerProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    const newTheme = isDark ? 'light' : 'dark';
    const doToggle = () => setTheme(newTheme);

    const docAny = document as any;
    if (
      docAny.startViewTransition &&
      typeof docAny.startViewTransition === 'function'
    ) {
      try {
        await docAny.startViewTransition(doToggle).ready;

        const { top, left, width, height } =
          buttonRef.current.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const maxRadius = Math.hypot(
          Math.max(left, window.innerWidth - left),
          Math.max(top, window.innerHeight - top),
        );

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      } catch {
        doToggle();
      }
    } else {
      doToggle();
    }
  }, [isDark, duration, setTheme]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      aria-pressed={mounted ? isDark : undefined}
      className={cn(className)}
      {...props}
    >
      {mounted ? (
        <>
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          {showLabel && (
            <span className="text-sm font-medium">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </>
      ) : null}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
