import { act, fireEvent, render, screen } from '@testing-library/react';
import { Lightning } from '@phosphor-icons/react/dist/ssr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { I18nProvider, type Lang } from '@/contexts/i18n-context';
import { useTimerStore } from '@/stores/timer-store';
import { ArcadeMiniTimer } from './arcade-mini-timer';
import { useGameSession } from './game-kit';
import { GameFrame } from './game-overlay';

const closePanel = vi.fn();
vi.mock('@/features/app-shell/panel-store', () => ({ closePanel: () => closePanel() }));

const setTimer = (state: Partial<ReturnType<typeof useTimerStore.getState>>) => act(() => useTimerStore.setState(state));

const inI18n = (ui: React.ReactElement, lang: Lang = 'en') => <I18nProvider initialLang={lang}>{ui}</I18nProvider>;

beforeEach(() => {
  vi.clearAllMocks();
  useTimerStore.setState({ mode: 'shortBreak', timeLeft: 192, isRunning: true });
});

describe('ArcadeMiniTimer', () => {
  it('shows the phase and the time left, in the same mm:ss as the timer', () => {
    render(inI18n(<ArcadeMiniTimer />));

    const timer = screen.getByRole('timer', { name: 'Short break: 03:12 left' });
    expect(timer).toHaveTextContent('Short break');
    expect(timer).toHaveTextContent('03:12');
  });

  it('follows the store as the break counts down', () => {
    render(inI18n(<ArcadeMiniTimer />));

    setTimer({ timeLeft: 191 });

    expect(screen.getByRole('timer', { name: 'Short break: 03:11 left' })).toHaveTextContent('03:11');
  });

  it('says so when the timer is not running', () => {
    setTimer({ isRunning: false });
    render(inI18n(<ArcadeMiniTimer />));

    expect(screen.getByRole('timer', { name: 'Short break: 03:12 left, timer paused' })).toBeInTheDocument();
  });

  it.each([
    ['vi', 'Nghỉ ngắn: còn 03:12'],
    ['ja', '短い休憩：残り03:12'],
  ] as const)('is named in %s', (lang, name) => {
    render(inI18n(<ArcadeMiniTimer />, lang));

    expect(screen.getByRole('timer', { name })).toBeInTheDocument();
  });
});

describe('GameFrame when the timer phase changes', () => {
  function Harness() {
    const session = useGameSession({ best: 0, onGameEnd: () => {}, onClose: () => {} });
    return (
      <GameFrame
        title="Snake"
        icon={Lightning}
        description="Eat and grow."
        hint="Arrows to move"
        session={session}
        onRestart={session.toReady}
      >
        <div />
      </GameFrame>
    );
  }

  const startGame = () => {
    render(inI18n(<Harness />));
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.queryByText('Paused')).toBeNull();
  };

  it('carries the mini timer in the game frame', () => {
    startGame();

    expect(screen.getByRole('timer', { name: 'Short break: 03:12 left' })).toBeInTheDocument();
  });

  it('keeps playing while the same phase ticks down', () => {
    startGame();

    setTimer({ timeLeft: 100 });

    expect(screen.queryByText('Paused')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('pauses the run and says the break is over when a focus phase takes over', () => {
    startGame();

    setTimer({ mode: 'work', timeLeft: 1500, isRunning: true });

    expect(screen.getByRole('heading', { name: 'Paused' })).toBeInTheDocument();
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent("Break's over. Time to get back to focus.");
    expect(notice).toHaveTextContent('The game is paused.');
    expect(screen.getByRole('timer', { name: 'Focus: 25:00 left' })).toBeInTheDocument();
  });

  it('also pauses when focus ends and a break begins', () => {
    useTimerStore.setState({ mode: 'work', timeLeft: 3, isRunning: true });
    startGame();

    setTimer({ mode: 'shortBreak', timeLeft: 300 });

    expect(screen.getByRole('heading', { name: 'Paused' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Focus is done. Enjoy your break.');
  });

  it('"Back to the timer" leaves the arcade; "Got it" only dismisses the notice', () => {
    startGame();
    setTimer({ mode: 'work', timeLeft: 1500 });

    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Paused' })).toBeInTheDocument();
    expect(closePanel).not.toHaveBeenCalled();

    setTimer({ mode: 'shortBreak', timeLeft: 300 });
    fireEvent.click(screen.getByRole('button', { name: 'Back to the timer' }));
    expect(closePanel).toHaveBeenCalledTimes(1);
  });

  it('a game opened during a phase does not start with a notice', () => {
    startGame();

    expect(screen.queryByRole('status')).toBeNull();
  });
});
