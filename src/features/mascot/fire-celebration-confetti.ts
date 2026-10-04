import confetti from 'canvas-confetti';

/** The candy palette of the brand (tomato, mint, butter, lilac, sky, peach). */
const CANDY = ['#FF5A36', '#7BDCB5', '#FFD45C', '#C9B6FF', '#7CC8FF', '#FFB38A'];

/**
 * Two cannons from the bottom corners and a puff in the middle. Library-level `disableForReducedMotion`
 * is a second guard on top of the caller checking `useReducedMotion()`.
 */
export function fireCelebrationConfetti() {
  const shared = { colors: CANDY, zIndex: 9999, disableForReducedMotion: true, ticks: 240 };
  confetti({ ...shared, particleCount: 70, angle: 60, spread: 65, startVelocity: 55, origin: { x: 0, y: 0.85 } });
  confetti({ ...shared, particleCount: 70, angle: 120, spread: 65, startVelocity: 55, origin: { x: 1, y: 0.85 } });
  confetti({ ...shared, particleCount: 45, spread: 110, startVelocity: 35, scalar: 1.1, origin: { x: 0.5, y: 0.65 } });
}
