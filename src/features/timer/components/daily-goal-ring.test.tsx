import { render } from '@testing-library/react';
import { DailyGoalRing } from './daily-goal-ring';

const CIRCUMFERENCE = 2 * Math.PI * 13;

function progressCircle(container: HTMLElement) {
  return container.querySelectorAll('circle')[1];
}

describe('DailyGoalRing', () => {
  it('draws no progress at 0%', () => {
    const { container } = render(<DailyGoalRing percent={0} />);
    const [filled] = progressCircle(container).getAttribute('stroke-dasharray')!.split(' ').map(Number);
    expect(filled).toBeCloseTo(0, 5);
  });

  it('draws the full ring at 100%', () => {
    const { container } = render(<DailyGoalRing percent={1} />);
    const [filled] = progressCircle(container).getAttribute('stroke-dasharray')!.split(' ').map(Number);
    expect(filled).toBeCloseTo(CIRCUMFERENCE, 5);
  });

  it('clamps above 100%', () => {
    const { container } = render(<DailyGoalRing percent={1.5} />);
    const [filled] = progressCircle(container).getAttribute('stroke-dasharray')!.split(' ').map(Number);
    expect(filled).toBeCloseTo(CIRCUMFERENCE, 5);
  });

  it('clamps negative percent to 0', () => {
    const { container } = render(<DailyGoalRing percent={-0.5} />);
    const [filled] = progressCircle(container).getAttribute('stroke-dasharray')!.split(' ').map(Number);
    expect(filled).toBeCloseTo(0, 5);
  });
});
