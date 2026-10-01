export type ClockVisualState = 'idle' | 'running' | 'urgent' | 'critical' | 'complete';

export type ClockSizeKey = 'small' | 'medium' | 'large';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Share of the phase still left, 0..1. */
export function remainingFraction(timeLeft: number, total: number): number {
  if (!Number.isFinite(timeLeft) || !Number.isFinite(total) || total <= 0) return 0;
  return clamp01(timeLeft / total);
}

/** Share of the phase already spent, 0..1. */
export function elapsedFraction(timeLeft: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return 1 - remainingFraction(timeLeft, total);
}

/** Radians swept by an arc covering `fraction` of a full turn. */
export function fractionToAngle(fraction: number): number {
  return clamp01(fraction) * Math.PI * 2;
}

export function splitTime(timeLeft: number): { minutes: number; seconds: number; digits: [number, number, number, number] } {
  const safe = Number.isFinite(timeLeft) ? Math.max(0, Math.floor(timeLeft)) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  const mm = Math.min(99, minutes);
  return {
    minutes,
    seconds,
    digits: [Math.floor(mm / 10), mm % 10, Math.floor(seconds / 10), seconds % 10],
  };
}

export function formatClock(timeLeft: number): string {
  const { digits } = splitTime(timeLeft);
  return `${digits[0]}${digits[1]}:${digits[2]}${digits[3]}`;
}

/**
 * Low-time warning stages. When the warning is switched off the clock stays
 * calm: no colour shift and no pulse, whatever the time left.
 */
export function getClockVisualState(timeLeft: number, isRunning: boolean, warn = true): ClockVisualState {
  if (timeLeft <= 0) return 'complete';
  if (!isRunning) return 'idle';
  if (!warn) return 'running';
  if (timeLeft <= 10) return 'critical';
  if (timeLeft <= 60) return 'urgent';
  return 'running';
}

/**
 * The tomato is cut into `count` wedges. Returns each wedge's scale (1 = whole,
 * 0 = eaten) for the given remaining fraction; at most one wedge is partial.
 */
export function wedgeScales(remaining: number, count: number): number[] {
  const filled = clamp01(remaining) * count;
  return Array.from({ length: count }, (_, i) => clamp01(filled - i));
}

/** Seven-segment layout: a, b, c, d, e, f, g (top, top-right, bottom-right, bottom, bottom-left, top-left, middle). */
const SEGMENTS: Record<number, readonly boolean[]> = {
  0: [true, true, true, true, true, true, false],
  1: [false, true, true, false, false, false, false],
  2: [true, true, false, true, true, false, true],
  3: [true, true, true, true, false, false, true],
  4: [false, true, true, false, false, true, true],
  5: [true, false, true, true, false, true, true],
  6: [true, false, true, true, true, true, true],
  7: [true, true, true, false, false, false, false],
  8: [true, true, true, true, true, true, true],
  9: [true, true, true, true, false, true, true],
};

export function segmentsForDigit(digit: number): readonly boolean[] {
  return SEGMENTS[digit] ?? SEGMENTS[8].map(() => false);
}

/**
 * Stage width for a 3D clock, as a CSS `min()` so it never overflows a 390px
 * phone nor eats the whole height of a short window.
 */
export function stageWidth(size: ClockSizeKey, aspect: number): string {
  const rem = { small: 24, medium: 34, large: 44 }[size];
  const heightBudgetVh = { small: 24, medium: 32, large: 40 }[size];
  return `min(92vw, ${rem}rem, ${Math.round(heightBudgetVh * aspect)}vh)`;
}

/** Parses the browser's resolved colour string into 0..255 channels. */
export function parseCssColor(input: string): [number, number, number] | null {
  const s = input.trim().toLowerCase();
  const rgb = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const srgb = s.match(/^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255];
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  return null;
}

export function toHex([r, g, b]: [number, number, number]): string {
  const c = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
