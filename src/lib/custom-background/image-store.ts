/**
 * Where the user's own background image lives: the compressed Blob in IndexedDB
 * (localStorage is capped near 5 MB, shared with every store of the app), and a tiny
 * list in localStorage with its name. Kept thin: all the logic worth testing is in
 * image-processing.ts and in the callers.
 */

import { dataUrlToBlob } from './image-processing';

const DB_NAME = 'study-bro-media';
const STORE = 'custom-backgrounds';
export const META_KEY = 'custom-background-images';
const BACKGROUND_KEY = 'background-settings';
const CUSTOM_PREFIX = 'custom:';

export interface StoredImage {
  id: string;
  name: string;
  blob: Blob;
  width: number;
  height: number;
}

/** What localStorage keeps: no pixels. `url` = an image added by link; otherwise the file is in IndexedDB. */
export interface ImageMeta {
  id: string;
  name: string;
  url?: string;
  /** Pre-IndexedDB entries kept the whole image here as base64; migrated away on startup. */
  dataUrl?: string;
}

export type StoreFailure = 'quota' | 'unavailable';
export type StoreResult<T> = { ok: true; value: T } | { ok: false; reason: StoreFailure };

/** Background `value` that points at the stored file. */
export const customImageValue = (id: string) => `${CUSTOM_PREFIX}${id}`;
export const parseCustomImageValue = (value: string): string | null =>
  value.startsWith(CUSTOM_PREFIX) ? value.slice(CUSTOM_PREFIX.length) : null;

export function isQuotaError(error: unknown): boolean {
  const e = error as { name?: string; code?: number } | null;
  return e?.name === 'QuotaExceededError' || e?.code === 22;
}

const fail = (error: unknown): { ok: false; reason: StoreFailure } => ({
  ok: false,
  reason: isQuotaError(error) ? 'quota' : 'unavailable',
});

function defaultFactory(): IDBFactory | null {
  try {
    return typeof indexedDB === 'undefined' ? null : indexedDB;
  } catch {
    return null; // some browsers throw when storage is blocked
  }
}

function openDb(factory: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = factory.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('blocked'));
  });
}

/** One transaction; resolves with the request's result once the transaction has committed. */
async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
  factory: IDBFactory | null,
): Promise<StoreResult<T>> {
  if (!factory) return { ok: false, reason: 'unavailable' };
  let db: IDBDatabase | null = null;
  try {
    db = await openDb(factory);
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    const value = await new Promise<T>((resolve, reject) => {
      tx.oncomplete = () => resolve(request.result);
      // A failed request aborts the transaction, and `tx.error` then holds the real cause
      // (QuotaExceededError included), so this is the only failure handler needed.
      tx.onabort = () => reject(tx.error ?? request.error);
    });
    return { ok: true, value };
  } catch (error) {
    return fail(error);
  } finally {
    db?.close();
  }
}

export function saveImage(image: StoredImage, factory = defaultFactory()): Promise<StoreResult<unknown>> {
  return run('readwrite', (store) => store.put(image), factory);
}

/** `value: null` = the database works but holds no such image. */
export function loadImage(id: string, factory = defaultFactory()): Promise<StoreResult<StoredImage | null>> {
  return run<StoredImage | undefined>('readonly', (store) => store.get(id), factory).then((r) =>
    r.ok ? { ok: true, value: r.value ?? null } : r,
  );
}

export function deleteImage(id: string, factory = defaultFactory()): Promise<StoreResult<unknown>> {
  return run('readwrite', (store) => store.delete(id), factory);
}

// --- Small list in localStorage ---

export function readMeta(): ImageMeta[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(META_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((m) => m && typeof m.id === 'string') : [];
  } catch {
    return [];
  }
}

/** false when the browser refused the write (storage full). */
export function writeMeta(list: ImageMeta[]): boolean {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/**
 * Older versions stored the uploaded image as a base64 data URL twice in localStorage
 * (the image list and the saved background), which could fill the quota. Move it into
 * IndexedDB once; if anything fails the old entries are left exactly as they were.
 */
export async function migrateLegacyCustomImages(factory = defaultFactory()): Promise<void> {
  const list = readMeta();
  const legacy = list.find((m) => m.dataUrl?.startsWith('data:'));
  if (!legacy?.dataUrl) return;

  const blob = dataUrlToBlob(legacy.dataUrl);
  if (!blob) return;
  const saved = await saveImage({ id: legacy.id, name: legacy.name, blob, width: 0, height: 0 }, factory);
  if (!saved.ok) return;

  try {
    const migrated = list.map((m) => (m.id === legacy.id ? { id: m.id, name: m.name } : m));
    localStorage.setItem(META_KEY, JSON.stringify(migrated));
    const bg = localStorage.getItem(BACKGROUND_KEY);
    if (bg) {
      const parsed = JSON.parse(bg);
      if (parsed?.value === legacy.dataUrl) {
        localStorage.setItem(BACKGROUND_KEY, JSON.stringify({ ...parsed, value: customImageValue(legacy.id) }));
      }
    }
  } catch {
    // Storage refused the rewrite: the legacy entry still works, and the next start retries
  }
}
