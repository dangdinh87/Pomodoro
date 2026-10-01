import type { ClockType } from '@/stores/timer-store';

export type SelectableClockType = Exclude<ClockType, 'progress' | 'animated'>;

export interface ClockStyleMeta {
  id: SelectableClockType;
  /** i18n key (flat) for the picker label */
  labelKey: string;
  is3d: boolean;
  /** Aspect ratio (w / h) of the 3D stage; unused for 2D clocks */
  aspect: number;
}

/** Order here is the order in the settings gallery. */
export const CLOCK_STYLES: readonly ClockStyleMeta[] = [
  { id: 'digital', labelKey: 'timerSettings.labels.digital', is3d: false, aspect: 2.4 },
  { id: 'analog', labelKey: 'timerSettings.labels.analog', is3d: false, aspect: 1 },
  { id: 'flip', labelKey: 'timerSettings.labels.flip', is3d: false, aspect: 2.8 },
  { id: 'flip3d', labelKey: 'clockStyles.flip3d', is3d: true, aspect: 3 },
  { id: 'tomato', labelKey: 'clockStyles.tomato', is3d: true, aspect: 1 },
  { id: 'orbit', labelKey: 'clockStyles.orbit', is3d: true, aspect: 1 },
  { id: 'solid', labelKey: 'clockStyles.solid', is3d: true, aspect: 2.6 },
];

export function getClockStyle(id: string): ClockStyleMeta | undefined {
  return CLOCK_STYLES.find((c) => c.id === id);
}

/**
 * Persisted state may carry the retired 'progress' / 'animated' types (or
 * anything unknown); those render as the digital clock.
 */
export function resolveClockType(type: string | undefined): SelectableClockType {
  return getClockStyle(type ?? '')?.id ?? 'digital';
}

export function isThreeDClock(type: string | undefined): boolean {
  return getClockStyle(type ?? '')?.is3d ?? false;
}
