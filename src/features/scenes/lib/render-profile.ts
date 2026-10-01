export interface DeviceHints {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  saveData?: boolean;
  coarsePointer?: boolean;
}

export interface RenderProfile {
  lowPower: boolean;
  dprCap: number;
  /** Minimum ms between frames while animating. */
  frameInterval: number;
}

export function resolveRenderProfile(hints: DeviceHints): RenderProfile {
  const lowPower =
    !!hints.saveData ||
    (typeof hints.deviceMemory === 'number' && hints.deviceMemory <= 4) ||
    (typeof hints.hardwareConcurrency === 'number' && hints.hardwareConcurrency <= 4) ||
    !!hints.coarsePointer;
  return lowPower
    ? { lowPower, dprCap: 1, frameInterval: 1000 / 24 }
    : { lowPower, dprCap: 1.5, frameInterval: 1000 / 30 };
}

export function readRenderProfile(): RenderProfile {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return resolveRenderProfile({
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
    saveData: nav.connection?.saveData,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
  });
}
