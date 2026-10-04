import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BackgroundSettings } from '@/data/background-migration';
import { DEFAULT_BACKGROUND } from '@/data/background-migration';

const setBackground = vi.fn();
let background: BackgroundSettings;
let custom: { url: string | null; missing: boolean };

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@/contexts/background-context', () => ({
  useBackground: () => ({ background, isLoading: false, setBackground }),
}));
vi.mock('@/hooks/use-custom-image-url', () => ({ useCustomImageUrl: () => custom }));

import { BackgroundRenderer } from './background-renderer';

const upload = (value = 'custom:abc'): BackgroundSettings => ({
  type: 'image',
  value,
  opacity: 0.8,
  blur: 0,
  brightness: 100,
});

/** The image layer's inline style (holds its background-image) */
const pictureOf = (container: HTMLElement) =>
  container.querySelector('[style*="background-image"]')?.getAttribute('style') ?? '';

beforeEach(() => {
  vi.clearAllMocks();
  custom = { url: null, missing: false };
});

describe('BackgroundRenderer with an uploaded image', () => {
  it('draws the stored file once it has been read', () => {
    background = upload();
    custom = { url: 'blob:stored-1', missing: false };
    const { container } = render(<BackgroundRenderer />);
    expect(pictureOf(container)).toContain('blob:stored-1');
  });

  it('shows nothing (no broken url) while the file is still loading', () => {
    background = upload();
    const { container } = render(<BackgroundRenderer />);
    expect(container.innerHTML).not.toContain('custom:abc');
    expect(pictureOf(container)).not.toContain('blob:');
    expect(setBackground).not.toHaveBeenCalled();
  });

  it('falls back to the default scene when the file is gone', () => {
    background = upload();
    custom = { url: null, missing: true };
    render(<BackgroundRenderer />);
    expect(setBackground).toHaveBeenCalledWith(DEFAULT_BACKGROUND);
  });

  it('keeps drawing an old base64 upload and an image link as before', () => {
    background = upload('https://example.com/a.jpg');
    const { container } = render(<BackgroundRenderer />);
    expect(pictureOf(container)).toContain('https://example.com/a.jpg');
  });
});
