import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BackgroundSettings as BackgroundConfig } from '@/data/background-migration';
import BackgroundSettingsModal from './background-settings-modal';

const setBackground = vi.fn();
const setBackgroundTemp = vi.fn();
const SAVED: BackgroundConfig = { type: 'scene', value: 'aurora', opacity: 1, blur: 0, brightness: 100 };

vi.mock('@/contexts/i18n-context', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock('@/contexts/background-context', () => ({
  useBackground: () => ({ background: SAVED, setBackground, setBackgroundTemp }),
}));
vi.mock('@/hooks/use-custom-backgrounds', () => ({
  useCustomBackgrounds: () => ({
    images: [],
    addImage: vi.fn(),
    addImageByUrl: vi.fn(),
    canAddMore: true,
  }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/features/scenes/components/scene-card', () => ({
  DefaultSceneCard: ({ label, onSelect }: { label: string; onSelect: () => void }) => (
    <button onClick={onSelect}>{label}</button>
  ),
  GalleryCard: ({ label, onSelect }: { label: string; onSelect: () => void }) => (
    <button onClick={onSelect}>{label}</button>
  ),
  SceneCard: ({ scene, label, onSelect }: { scene: { id: string }; label: string; onSelect: (s: unknown) => void }) => (
    <button onClick={() => onSelect(scene)}>{label}</button>
  ),
}));

const lastTemp = () => setBackgroundTemp.mock.calls.at(-1)?.[0];

describe('BackgroundSettingsModal', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it('is a named dialog (no missing-title console error)', () => {
    render(<BackgroundSettingsModal isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'scenes.title' })).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('opens with focus on the dialog, not on "Save changes" (Space would save and close the panel)', () => {
    render(<BackgroundSettingsModal isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'scenes.title' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'settings.background.saveChanges' })).not.toHaveFocus();
  });

  it('Esc puts the saved background back and closes', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<BackgroundSettingsModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'scenes.names.rain' })); // preview
    expect(lastTemp()).toMatchObject({ type: 'scene', value: 'rain' });

    await user.keyboard('{Escape}');

    expect(lastTemp()).toEqual(SAVED);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(setBackground).not.toHaveBeenCalled();
  });

  it('the Close button also reverts', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<BackgroundSettingsModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'scenes.names.rain' }));
    const visibleTitle = screen
      .getAllByRole('heading', { name: 'scenes.title' })
      .find((h) => !h.className.includes('sr-only'))!;
    const header = visibleTitle.parentElement!;
    await user.click(within(header).getByRole('button', { name: 'common.close' }));

    expect(lastTemp()).toEqual(SAVED);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closing from outside (browser Back closes the panel) reverts the preview too', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<BackgroundSettingsModal isOpen onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'scenes.names.rain' }));

    rerender(<BackgroundSettingsModal isOpen={false} onClose={vi.fn()} />);

    expect(lastTemp()).toEqual(SAVED);
  });

  it('Save keeps the choice: nothing is reverted afterwards', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<BackgroundSettingsModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'scenes.names.rain' }));
    await user.click(screen.getByRole('button', { name: 'settings.background.saveChanges' }));
    const previews = setBackgroundTemp.mock.calls.length;
    rerender(<BackgroundSettingsModal isOpen={false} onClose={onClose} />);

    expect(setBackground).toHaveBeenCalledWith(expect.objectContaining({ type: 'scene', value: 'rain' }));
    expect(setBackgroundTemp.mock.calls.length).toBe(previews);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
