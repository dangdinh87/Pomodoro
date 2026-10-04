import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installMemoryStorage } from '@/test-utils/memory-storage';

const store = vi.hoisted(() => ({
  saveImage: vi.fn(),
  loadImage: vi.fn(),
  deleteImage: vi.fn(),
  readMeta: vi.fn(),
  writeMeta: vi.fn(),
}));
const processing = vi.hoisted(() => ({ compressImage: vi.fn() }));

vi.mock('@/lib/custom-background/image-store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/custom-background/image-store')>()),
  ...store,
}));
vi.mock('@/lib/custom-background/image-processing', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/custom-background/image-processing')>()),
  ...processing,
}));

import { useCustomBackgrounds } from './use-custom-backgrounds';

const png = (size = 1000) => new File([new Uint8Array(size)], 'me.png', { type: 'image/png' });
const ok = { ok: true, value: undefined };

function imageOf(outcome: { success: boolean; image?: unknown }) {
  if (!outcome.success) throw new Error('expected the add to succeed');
  return outcome.image as { id: string; name: string; value: string; previewUrl: string };
}

let urlSeq = 0;
beforeEach(() => {
  installMemoryStorage();
  vi.clearAllMocks();
  urlSeq = 0;
  URL.createObjectURL = vi.fn(() => `blob:preview-${++urlSeq}`);
  URL.revokeObjectURL = vi.fn();
  store.readMeta.mockReturnValue([]);
  store.writeMeta.mockReturnValue(true);
  store.saveImage.mockResolvedValue(ok);
  store.deleteImage.mockResolvedValue(ok);
  store.loadImage.mockResolvedValue({ ok: true, value: null });
  processing.compressImage.mockResolvedValue({ blob: new Blob(['px'], { type: 'image/webp' }), width: 1920, height: 1080 });
});

async function mounted() {
  const hook = renderHook(() => useCustomBackgrounds());
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('useCustomBackgrounds: loading', () => {
  it('starts empty', async () => {
    const { result } = await mounted();
    expect(result.current.images).toEqual([]);
  });

  it('turns a stored file into a preview URL and keeps an image link as it is', async () => {
    store.readMeta.mockReturnValue([{ id: 'f1', name: 'me.png' }]);
    store.loadImage.mockResolvedValue({ ok: true, value: { id: 'f1', name: 'me.png', blob: new Blob(['px']) } });
    const { result } = await mounted();
    expect(result.current.images).toEqual([
      { id: 'f1', name: 'me.png', value: 'custom:f1', previewUrl: 'blob:preview-1' },
    ]);

    store.readMeta.mockReturnValue([{ id: 'u1', name: 'a.jpg', url: 'https://example.com/a.jpg' }]);
    const second = await mounted();
    expect(second.result.current.images).toEqual([
      { id: 'u1', name: 'a.jpg', value: 'https://example.com/a.jpg', previewUrl: 'https://example.com/a.jpg' },
    ]);
  });

  it('drops a listed file that is gone from IndexedDB', async () => {
    store.readMeta.mockReturnValue([{ id: 'f1', name: 'me.png' }]);
    store.loadImage.mockResolvedValue({ ok: true, value: null });
    const { result } = await mounted();
    expect(result.current.images).toEqual([]);
  });

  it('still shows an old base64 entry that has not been migrated yet', async () => {
    store.readMeta.mockReturnValue([{ id: 'old', name: 'me.png', dataUrl: 'data:image/png;base64,AAAA' }]);
    const { result } = await mounted();
    expect(result.current.images[0]).toMatchObject({ value: 'data:image/png;base64,AAAA' });
  });
});

describe('useCustomBackgrounds: addImage', () => {
  it('compresses, stores in IndexedDB and keeps only a reference in localStorage', async () => {
    const { result } = await mounted();
    let outcome!: Awaited<ReturnType<typeof result.current.addImage>>;
    await act(async () => {
      outcome = await result.current.addImage(png());
    });

    expect(outcome.success).toBe(true);
    const id = imageOf(outcome).id;
    expect(imageOf(outcome)).toMatchObject({ value: `custom:${id}`, previewUrl: 'blob:preview-1' });
    expect(store.saveImage).toHaveBeenCalledWith(expect.objectContaining({ id, name: 'me.png', width: 1920 }));
    expect(store.writeMeta).toHaveBeenCalledWith([{ id, name: 'me.png' }]);
    expect(JSON.stringify(store.writeMeta.mock.calls)).not.toContain('base64');
    expect(result.current.images).toHaveLength(1);
  });

  it('replaces the previous image: the new one is saved first, then the old one removed', async () => {
    store.readMeta.mockReturnValue([{ id: 'f1', name: 'old.png' }]);
    store.loadImage.mockResolvedValue({ ok: true, value: { id: 'f1', name: 'old.png', blob: new Blob(['px']) } });
    const { result } = await mounted();

    await act(async () => {
      await result.current.addImage(png());
    });

    expect(store.deleteImage).toHaveBeenCalledWith('f1');
    expect(store.saveImage.mock.invocationCallOrder[0]).toBeLessThan(store.deleteImage.mock.invocationCallOrder[0]);
    expect(result.current.images).toHaveLength(1);
    expect(result.current.images[0].id).not.toBe('f1');
  });

  it.each([
    ['not an image', new File(['x'], 'a.pdf', { type: 'application/pdf' }), 'invalidType'],
    ['too large', png(3 * 1024 * 1024), 'fileTooLarge'],
  ])('rejects %s without touching storage', async (_name, file, error) => {
    const { result } = await mounted();
    let outcome!: Awaited<ReturnType<typeof result.current.addImage>>;
    await act(async () => {
      outcome = await result.current.addImage(file);
    });
    expect(outcome).toEqual({ success: false, error });
    expect(processing.compressImage).not.toHaveBeenCalled();
    expect(store.saveImage).not.toHaveBeenCalled();
  });

  it('reports a full disk instead of a false success', async () => {
    store.saveImage.mockResolvedValue({ ok: false, reason: 'quota' });
    const { result } = await mounted();
    let outcome!: Awaited<ReturnType<typeof result.current.addImage>>;
    await act(async () => {
      outcome = await result.current.addImage(png());
    });

    expect(outcome).toEqual({ success: false, error: 'storageFull' });
    expect(store.writeMeta).not.toHaveBeenCalled();
    expect(result.current.images).toEqual([]);
  });

  it('reports a browser that cannot store files as a processing error', async () => {
    store.saveImage.mockResolvedValue({ ok: false, reason: 'unavailable' });
    const { result } = await mounted();
    let outcome!: Awaited<ReturnType<typeof result.current.addImage>>;
    await act(async () => {
      outcome = await result.current.addImage(png());
    });
    expect(outcome).toEqual({ success: false, error: 'processingError' });
  });

  it('maps compression failures to their messages', async () => {
    const { result } = await mounted();
    for (const [thrown, expected] of [
      ['fileTooLarge', 'fileTooLarge'],
      ['processingError', 'processingError'],
      ['something odd', 'processingError'],
    ]) {
      processing.compressImage.mockRejectedValueOnce(new Error(thrown));
      let outcome!: Awaited<ReturnType<typeof result.current.addImage>>;
      await act(async () => {
        outcome = await result.current.addImage(png());
      });
      expect(outcome).toEqual({ success: false, error: expected });
    }
  });

  it('undoes the stored file when the list cannot be written (localStorage full)', async () => {
    store.writeMeta.mockReturnValue(false);
    const { result } = await mounted();
    let outcome!: Awaited<ReturnType<typeof result.current.addImage>>;
    await act(async () => {
      outcome = await result.current.addImage(png());
    });

    expect(outcome).toEqual({ success: false, error: 'storageFull' });
    expect(store.deleteImage).toHaveBeenCalledTimes(1);
    expect(result.current.images).toEqual([]);
  });
});

describe('useCustomBackgrounds: addImageByUrl and removeImage', () => {
  it('rejects anything that is not an http(s) link', async () => {
    const { result } = await mounted();
    let outcome!: Awaited<ReturnType<typeof result.current.addImageByUrl>>;
    await act(async () => {
      outcome = await result.current.addImageByUrl('javascript:alert(1)');
    });
    expect(outcome).toEqual({ success: false, error: 'invalidUrl' });
  });

  it('keeps a link in the list (no pixels) and frees a previously stored file', async () => {
    store.readMeta.mockReturnValue([{ id: 'f1', name: 'old.png' }]);
    store.loadImage.mockResolvedValue({ ok: true, value: { id: 'f1', name: 'old.png', blob: new Blob(['px']) } });
    const { result } = await mounted();
    let outcome!: Awaited<ReturnType<typeof result.current.addImageByUrl>>;
    await act(async () => {
      outcome = await result.current.addImageByUrl('https://example.com/pics/sky.jpg');
    });

    expect(imageOf(outcome)).toMatchObject({ name: 'sky.jpg', value: 'https://example.com/pics/sky.jpg' });
    expect(store.writeMeta).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'sky.jpg', url: 'https://example.com/pics/sky.jpg' }),
    ]);
    expect(store.deleteImage).toHaveBeenCalledWith('f1');
  });

  it('removes an image from storage and from the list', async () => {
    store.readMeta.mockReturnValue([{ id: 'f1', name: 'old.png' }]);
    store.loadImage.mockResolvedValue({ ok: true, value: { id: 'f1', name: 'old.png', blob: new Blob(['px']) } });
    const { result } = await mounted();

    await act(async () => {
      result.current.removeImage('f1');
    });

    expect(store.deleteImage).toHaveBeenCalledWith('f1');
    expect(store.writeMeta).toHaveBeenCalledWith([]);
    expect(result.current.images).toEqual([]);
  });
});
