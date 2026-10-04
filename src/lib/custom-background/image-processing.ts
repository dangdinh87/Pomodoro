/**
 * Resize and compress an uploaded background before it is stored: a phone photo is
 * often 4000 px wide, far more than any screen shows, and the decoded copy costs memory too.
 */

export const MAX_EDGE = 1920;
/** Largest file the picker accepts, before compression. */
export const MAX_INPUT_BYTES = 2 * 1024 * 1024;
/** Largest compressed image we keep (guards against a pathological encode). */
export const MAX_STORED_BYTES = 3 * 1024 * 1024;
const QUALITIES = [0.85, 0.7, 0.55];

/** Keys under `settings.background.customImages.*` */
export type ImageErrorKey = 'invalidType' | 'fileTooLarge' | 'processingError';

export function validateImageFile(file: { type: string; size: number }): ImageErrorKey | null {
  if (!file.type.startsWith('image/')) return 'invalidType';
  if (file.size > MAX_INPUT_BYTES) return 'fileTooLarge';
  return null;
}

/** Scale down so the longer side is at most `maxEdge`; never enlarges. */
export function fitWithin(width: number, height: number, maxEdge = MAX_EDGE): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** `data:<mime>;base64,<payload>` -> Blob, or null if it is anything else. */
export function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(dataUrl);
  if (!match) return null;
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: match[1] });
  } catch {
    return null;
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Decode, scale to at most 1920 px and encode as WebP (JPEG where WebP cannot be encoded). */
export async function compressImage(file: Blob): Promise<{ blob: Blob; width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('processingError');
  }

  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('processingError');
    ctx.drawImage(bitmap, 0, 0, width, height);

    let type = 'image/webp';
    for (const quality of QUALITIES) {
      let blob = await toBlob(canvas, type, quality);
      // A browser that cannot encode WebP hands back PNG: use JPEG instead
      if (blob && type === 'image/webp' && blob.type !== 'image/webp') {
        type = 'image/jpeg';
        blob = await toBlob(canvas, type, quality);
      }
      if (!blob) throw new Error('processingError');
      if (blob.size <= MAX_STORED_BYTES) return { blob, width, height };
    }
    throw new Error('fileTooLarge');
  } finally {
    bitmap.close?.();
  }
}
