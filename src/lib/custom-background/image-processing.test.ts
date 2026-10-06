import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_EDGE,
  MAX_INPUT_BYTES,
  MAX_STORED_BYTES,
  compressImage,
  dataUrlToBlob,
  fitWithin,
  validateImageFile,
} from './image-processing';

describe('validateImageFile', () => {
  it('accepts images up to the size limit', () => {
    expect(validateImageFile({ type: 'image/png', size: 1000 })).toBeNull();
    expect(validateImageFile({ type: 'image/jpeg', size: MAX_INPUT_BYTES })).toBeNull();
  });

  it('rejects other file types', () => {
    expect(validateImageFile({ type: 'application/pdf', size: 10 })).toBe('invalidType');
    expect(validateImageFile({ type: '', size: 10 })).toBe('invalidType');
  });

  it('rejects files over the limit', () => {
    expect(validateImageFile({ type: 'image/png', size: MAX_INPUT_BYTES + 1 })).toBe('fileTooLarge');
  });
});

describe('fitWithin', () => {
  it('shrinks the long edge to the limit and keeps the aspect ratio', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: MAX_EDGE, height: 1440 });
    expect(fitWithin(3000, 6000)).toEqual({ width: 960, height: MAX_EDGE });
  });

  it('never enlarges a small image', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(MAX_EDGE, 1080)).toEqual({ width: MAX_EDGE, height: 1080 });
  });

  it('never returns a zero side', () => {
    expect(fitWithin(10_000, 1)).toEqual({ width: MAX_EDGE, height: 1 });
  });
});

describe('dataUrlToBlob', () => {
  it('decodes a base64 data URL with its mime type', async () => {
    const blob = dataUrlToBlob('data:image/png;base64,aGVsbG8=');
    expect(blob?.type).toBe('image/png');
    expect(blob?.size).toBe(5);
  });

  it('returns null for anything else', () => {
    expect(dataUrlToBlob('https://example.com/a.png')).toBeNull();
    expect(dataUrlToBlob('data:image/png,not-base64')).toBeNull();
    expect(dataUrlToBlob('data:image/png;base64,@@@')).toBeNull();
  });
});

describe('compressImage', () => {
  const drawImage = vi.fn();
  const close = vi.fn();
  let encoded: { type?: string; quality?: number }[];
  let sizes: number[]; // bytes produced per encode call, in order
  let webpSupported: boolean;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob;

  beforeEach(() => {
    vi.clearAllMocks();
    encoded = [];
    sizes = [300_000];
    webpSupported = true;
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 4000, height: 3000, close })));
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage })) as never;
    HTMLCanvasElement.prototype.toBlob = function (cb: BlobCallback, type?: string, quality?: number) {
      encoded.push({ type, quality });
      // browsers that cannot encode WebP silently return PNG
      const actual = type === 'image/webp' && !webpSupported ? 'image/png' : (type ?? 'image/png');
      const bytes = sizes[Math.min(encoded.length - 1, sizes.length - 1)];
      cb(new Blob([new Uint8Array(bytes)], { type: actual }));
    } as never;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  const file = new File(['x'], 'photo.png', { type: 'image/png' });

  it('draws the image at no more than 1920 px and returns a WebP', async () => {
    const out = await compressImage(file);

    expect(out.width).toBe(MAX_EDGE);
    expect(out.height).toBe(1440);
    expect(out.blob.type).toBe('image/webp');
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, MAX_EDGE, 1440);
    expect(close).toHaveBeenCalled(); // frees the decoded bitmap
  });

  it('falls back to JPEG where the browser cannot encode WebP', async () => {
    webpSupported = false;
    const out = await compressImage(file);
    expect(out.blob.type).toBe('image/jpeg');
    expect(encoded.map((e) => e.type)).toEqual(['image/webp', 'image/jpeg']);
  });

  it('lowers the quality until the result fits the stored-size guard', async () => {
    sizes = [MAX_STORED_BYTES + 1, MAX_STORED_BYTES + 1, 500_000];
    const out = await compressImage(file);
    expect(out.blob.size).toBe(500_000);
    expect(encoded.map((e) => e.quality)).toEqual([0.85, 0.7, 0.55]);
  });

  it('gives up with fileTooLarge when even the lowest quality is too big', async () => {
    sizes = [MAX_STORED_BYTES + 1];
    await expect(compressImage(file)).rejects.toThrow('fileTooLarge');
  });

  it('rejects when the file cannot be decoded', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => Promise.reject(new Error('bad image'))));
    await expect(compressImage(file)).rejects.toThrow('processingError');
  });

  it('rejects when there is no 2D canvas', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
    await expect(compressImage(file)).rejects.toThrow('processingError');
  });
});
