import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => ({ loadImage: vi.fn() }));
vi.mock('@/lib/custom-background/image-store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/custom-background/image-store')>()),
  ...store,
}));

import { useCustomImageUrl } from './use-custom-image-url';

beforeEach(() => {
  vi.clearAllMocks();
  URL.createObjectURL = vi.fn(() => 'blob:custom-1');
  URL.revokeObjectURL = vi.fn();
});

describe('useCustomImageUrl', () => {
  it('ignores values that are not stored files', () => {
    for (const value of ['aurora', 'https://example.com/a.jpg', 'data:image/png;base64,AAAA', '']) {
      const { result } = renderHook(() => useCustomImageUrl(value));
      expect(result.current).toEqual({ url: null, missing: false });
    }
    expect(store.loadImage).not.toHaveBeenCalled();
  });

  it('loads the stored file as an object URL and frees it afterwards', async () => {
    store.loadImage.mockResolvedValue({ ok: true, value: { blob: new Blob(['px']) } });
    const { result, unmount } = renderHook(() => useCustomImageUrl('custom:abc'));
    expect(result.current).toEqual({ url: null, missing: false }); // still loading

    await waitFor(() => expect(result.current.url).toBe('blob:custom-1'));
    expect(store.loadImage).toHaveBeenCalledWith('abc');

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:custom-1');
  });

  it('says missing when the database works but the image is gone', async () => {
    store.loadImage.mockResolvedValue({ ok: true, value: null });
    const { result } = renderHook(() => useCustomImageUrl('custom:abc'));
    await waitFor(() => expect(result.current.missing).toBe(true));
    expect(result.current.url).toBeNull();
  });

  it('does not call it missing when storage is just unavailable right now', async () => {
    store.loadImage.mockResolvedValue({ ok: false, reason: 'unavailable' });
    const { result } = renderHook(() => useCustomImageUrl('custom:abc'));
    await waitFor(() => expect(store.loadImage).toHaveBeenCalled());
    await Promise.resolve();
    expect(result.current).toEqual({ url: null, missing: false });
  });

  it('follows the value: a new image replaces (and frees) the old one', async () => {
    store.loadImage.mockResolvedValue({ ok: true, value: { blob: new Blob(['px']) } });
    (URL.createObjectURL as ReturnType<typeof vi.fn>).mockReturnValueOnce('blob:one').mockReturnValueOnce('blob:two');
    const { result, rerender } = renderHook(({ value }) => useCustomImageUrl(value), {
      initialProps: { value: 'custom:one' },
    });
    await waitFor(() => expect(result.current.url).toBe('blob:one'));

    rerender({ value: 'custom:two' });
    // never shows the previous image under the new id
    expect(result.current.url).toBeNull();
    await waitFor(() => expect(result.current.url).toBe('blob:two'));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:one');
  });
});
