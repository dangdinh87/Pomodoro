import { Baloo_2, Nunito, JetBrains_Mono } from 'next/font/google';

// Both are variable fonts (Baloo 2 uses 600-800, Nunito 500-800): leaving `weight` out ships one
// file per subset for every weight instead of one per weight. Japanese has no web font on
// purpose; globals.css falls back to the system rounded Gothic.
const baloo2 = Baloo_2({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-baloo-2',
});

const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-nunito',
});

// Only shortcut hints and code use it: do not preload.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  preload: false,
  variable: '--font-jetbrains-mono',
});

/** `className` for <html>: declares the three font CSS variables. */
export const fontVariables = `${baloo2.variable} ${nunito.variable} ${jetbrainsMono.variable}`;
