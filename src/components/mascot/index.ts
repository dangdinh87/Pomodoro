// Main components
export { Mascot } from './Mascot';
export { MascotProvider, useMascot } from './MascotProvider';
export { LottieMascot } from './LottieMascot';
export { SpeechBubble } from './SpeechBubble';
export { MascotFloating, useMascotCelebration } from './MascotFloating';

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

// Messages
export * from './messages';

// Types
export type { MascotEvent } from './MascotProvider';
export type { MascotState, MascotMessage, MessageType } from '@/stores/mascot-store';
