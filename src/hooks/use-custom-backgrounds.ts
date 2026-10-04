'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  compressImage,
  validateImageFile,
  type ImageErrorKey,
} from '@/lib/custom-background/image-processing';
import {
  customImageValue,
  deleteImage,
  loadImage,
  readMeta,
  saveImage,
  writeMeta,
  type ImageMeta,
} from '@/lib/custom-background/image-store';

/** Keys under `settings.background.customImages.*` */
export type CustomImageError = ImageErrorKey | 'invalidUrl' | 'storageFull';

export interface CustomImage {
  id: string;
  name: string;
  /** What `background.value` holds when this image is the background. */
  value: string;
  /** Something an <img> can show now: an object URL for a stored file, the link itself otherwise. */
  previewUrl: string;
}

type AddResult = { success: true; image: CustomImage } | { success: false; error: CustomImageError };

interface UseCustomBackgroundsReturn {
  images: CustomImage[];
  isLoading: boolean;
  addImage: (file: File) => Promise<AddResult>;
  addImageByUrl: (url: string) => Promise<AddResult>;
  removeImage: (id: string) => void;
  canAddMore: boolean;
}

function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * The user's own background image (one slot: a new one replaces the old).
 * The file is compressed and kept in IndexedDB; localStorage only lists it by name.
 */
export function useCustomBackgrounds(): UseCustomBackgroundsReturn {
  const [images, setImages] = useState<CustomImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Mirror of `images` for the callbacks (they must not do side effects inside setState updaters)
  const imagesRef = useRef<CustomImage[]>([]);
  const commit = useCallback((next: CustomImage[]) => {
    imagesRef.current = next;
    setImages(next);
  }, []);
  // Object URLs handed out for stored files, released when replaced or on unmount
  const objectUrls = useRef<string[]>([]);

  const makeObjectUrl = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    objectUrls.current.push(url);
    return url;
  }, []);

  const releaseObjectUrls = useCallback(() => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current = [];
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      const loaded: CustomImage[] = [];
      for (const meta of readMeta()) {
        if (meta.dataUrl) {
          // Not migrated yet (see migrateLegacyCustomImages): still shows and still works
          loaded.push({ id: meta.id, name: meta.name, value: meta.dataUrl, previewUrl: meta.dataUrl });
        } else if (meta.url) {
          loaded.push({ id: meta.id, name: meta.name, value: meta.url, previewUrl: meta.url });
        } else {
          const stored = await loadImage(meta.id);
          if (stored.ok && stored.value && live) {
            loaded.push({
              id: meta.id,
              name: meta.name,
              value: customImageValue(meta.id),
              previewUrl: makeObjectUrl(stored.value.blob),
            });
          }
        }
      }
      if (!live) return;
      commit(loaded);
      setIsLoading(false);
    })();
    return () => {
      live = false;
      releaseObjectUrls();
    };
  }, [commit, makeObjectUrl, releaseObjectUrls]);

  /** Single slot: the file stored before (and its preview) is no longer needed. */
  const discard = useCallback((previous: CustomImage[]) => {
    for (const image of previous) {
      if (image.value === customImageValue(image.id)) void deleteImage(image.id);
      if (image.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(image.previewUrl);
        objectUrls.current = objectUrls.current.filter((url) => url !== image.previewUrl);
      }
    }
  }, []);

  const addImage = useCallback(
    async (file: File): Promise<AddResult> => {
      const invalid = validateImageFile(file);
      if (invalid) return { success: false, error: invalid };

      let compressed: Awaited<ReturnType<typeof compressImage>>;
      try {
        compressed = await compressImage(file);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return { success: false, error: message === 'fileTooLarge' ? 'fileTooLarge' : 'processingError' };
      }

      const id = generateId();
      const saved = await saveImage({ id, name: file.name, blob: compressed.blob, width: compressed.width, height: compressed.height });
      if (!saved.ok) {
        return { success: false, error: saved.reason === 'quota' ? 'storageFull' : 'processingError' };
      }

      if (!writeMeta([{ id, name: file.name }])) {
        // The list is what makes the file reachable: without it the file is dead weight
        void deleteImage(id);
        return { success: false, error: 'storageFull' };
      }

      const image: CustomImage = { id, name: file.name, value: customImageValue(id), previewUrl: makeObjectUrl(compressed.blob) };
      discard(imagesRef.current);
      commit([image]);
      return { success: true, image };
    },
    [commit, discard, makeObjectUrl],
  );

  const addImageByUrl = useCallback(async (url: string): Promise<AddResult> => {
    if (!isValidImageUrl(url)) return { success: false, error: 'invalidUrl' };

    const pathParts = new URL(url).pathname.split('/');
    const name = pathParts[pathParts.length - 1] || 'image';
    const id = generateId();
    if (!writeMeta([{ id, name, url }])) return { success: false, error: 'storageFull' };

    const image: CustomImage = { id, name, value: url, previewUrl: url };
    discard(imagesRef.current);
    commit([image]);
    return { success: true, image };
  }, [commit, discard]);

  const removeImage = useCallback(
    (id: string) => {
      const previous = imagesRef.current;
      const remaining = previous.filter((image) => image.id !== id);
      discard(previous.filter((image) => image.id === id));
      writeMeta(remaining.map((image) => toMeta(image)));
      commit(remaining);
    },
    [commit, discard],
  );

  return {
    images,
    isLoading,
    addImage,
    addImageByUrl,
    removeImage,
    canAddMore: true, // one slot: adding replaces
  };
}

function toMeta(image: CustomImage): ImageMeta {
  if (image.value === customImageValue(image.id)) return { id: image.id, name: image.name };
  if (image.value.startsWith('data:')) return { id: image.id, name: image.name, dataUrl: image.value };
  return { id: image.id, name: image.name, url: image.value };
}
