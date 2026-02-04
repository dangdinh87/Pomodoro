// Main components
export { Mascot } from './Mascot';
export { MascotProvider, useMascot } from './MascotProvider';

// Expression components (for direct usage if needed)
export { HappyMascot } from './expressions/HappyMascot';
export { FocusedMascot } from './expressions/FocusedMascot';
export { EncouragingMascot } from './expressions/EncouragingMascot';
export { SleepyMascot } from './expressions/SleepyMascot';
export { ExcitedMascot } from './expressions/ExcitedMascot';
export { WorriedMascot } from './expressions/WorriedMascot';
export { SadMascot } from './expressions/SadMascot';
export { CelebratingMascot } from './expressions/CelebratingMascot';

// Base component and utilities
export { BaseMascot, MASCOT_COLORS, Nose, Blush } from './expressions/BaseMascot';

// Types
export type { MascotEvent } from './MascotProvider';
export type { MascotState } from '@/stores/mascot-store';
