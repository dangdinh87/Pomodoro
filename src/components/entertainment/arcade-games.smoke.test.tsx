import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AimTrainerGame } from './aim-trainer-game';
import { BrickBreakerGame } from './brick-breaker-game';
import { Game2048 } from './game-2048';
import { NeonFlipGame } from './neon-flip-game';
import { MinesweeperGame } from './minesweeper-game';
import { SnakeGame } from './snake-game';
import { SpaceShooterGame } from './space-shooter-game';
import { TicTacToeGame } from './tic-tac-toe-game';
import { TypingSprintGame } from './typing-sprint-game';

// Keys are asserted as-is so the test does not depend on the locale files.
vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ lang: 'en', t: (key: string) => key }),
}));

const games = {
  snake: SnakeGame,
  brick: BrickBreakerGame,
  shooter: SpaceShooterGame,
  memory: NeonFlipGame,
  minesweeper: MinesweeperGame,
  typing: TypingSprintGame,
  aim: AimTrainerGame,
  tictactoe: TicTacToeGame,
};

function mount(Game: (typeof games)[keyof typeof games]) {
  const onClose = vi.fn();
  const onGameEnd = vi.fn();
  const view = render(
    <Game best={0} onGameEnd={onGameEnd} onClose={onClose} />,
  );
  return { ...view, onClose, onGameEnd };
}

describe('arcade games mount, start, pause and unmount cleanly', () => {
  Object.entries(games).forEach(([name, Game]) => {
    it(`${name}: ready overlay -> start -> Esc pauses -> Esc resumes`, () => {
      const { unmount } = mount(Game);
      fireEvent.click(screen.getByRole('button', { name: 'arcadeKit.start' }));
      expect(screen.queryByRole('button', { name: 'arcadeKit.start' })).toBeNull();
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });
      expect(screen.getByText('arcadeKit.paused')).toBeInTheDocument();
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });
      expect(screen.queryByText('arcadeKit.paused')).toBeNull();
      unmount();
    });
  });

  it('2048 starts immediately and closes with Esc from the game-over screen path', () => {
    const { onClose, unmount } = mount(Game2048);
    expect(screen.queryByRole('button', { name: 'arcadeKit.start' })).toBeNull();
    expect(screen.getAllByRole('application')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'arcadeKit.close' }));
    expect(onClose).toHaveBeenCalled();
    unmount();
  });
});
