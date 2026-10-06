import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from '@/test-utils/memory-storage';
import {
  META_KEY,
  customImageValue,
  deleteImage,
  isQuotaError,
  loadImage,
  migrateLegacyCustomImages,
  parseCustomImageValue,
  readMeta,
  saveImage,
  writeMeta,
  type StoredImage,
} from './image-store';

/** Just enough of IndexedDB for the thin wrapper: one object store, event-handler style. */
function fakeIndexedDb(opts: { putError?: string; openError?: boolean } = {}) {
  const rows = new Map<string, unknown>();
  const factory = {
    open() {
      const request: Record<string, unknown> = {};
      queueMicrotask(() => {
        if (opts.openError) {
          request.error = new DOMException('denied', 'SecurityError');
          (request.onerror as () => void)?.();
          return;
        }
        const db = {
          objectStoreNames: { contains: () => false },
          createObjectStore: () => ({}),
          close: () => {},
          transaction() {
            const tx: Record<string, unknown> = {};
            tx.objectStore = () => ({
              put(value: { id: string }) {
                return settle(tx, () => {
                  if (opts.putError) throw new DOMException('full', opts.putError);
                  rows.set(value.id, value);
                });
              },
              get: (id: string) => settle(tx, () => rows.get(id)),
              delete: (id: string) => settle(tx, () => void rows.delete(id)),
            });
            return tx;
          },
        };
        request.result = db;
        (request.onupgradeneeded as () => void)?.();
        (request.onsuccess as () => void)?.();
      });
      return request;
    },
  } as unknown as IDBFactory;

  function settle(tx: Record<string, unknown>, work: () => unknown) {
    const request: Record<string, unknown> = {};
    queueMicrotask(() => {
      try {
        request.result = work();
        (tx.oncomplete as () => void)?.();
      } catch (error) {
        tx.error = error;
        request.error = error;
        (tx.onabort as () => void)?.();
      }
    });
    return request as unknown as IDBRequest;
  }

  return { factory, rows };
}

const image = (id = 'a'): StoredImage => ({ id, name: 'photo.png', blob: new Blob(['px']), width: 10, height: 10 });

describe('image store', () => {
  it('saves, loads and deletes an image', async () => {
    const { factory, rows } = fakeIndexedDb();

    expect(await saveImage(image(), factory)).toEqual({ ok: true, value: undefined });
    expect(rows.has('a')).toBe(true);

    const loaded = await loadImage('a', factory);
    expect(loaded.ok && loaded.value?.name).toBe('photo.png');

    await deleteImage('a', factory);
    expect(await loadImage('a', factory)).toEqual({ ok: true, value: null });
  });

  it('reports a full disk as quota, not as a success', async () => {
    const { factory, rows } = fakeIndexedDb({ putError: 'QuotaExceededError' });
    expect(await saveImage(image(), factory)).toEqual({ ok: false, reason: 'quota' });
    expect(rows.size).toBe(0);
  });

  it('reports any other failure as unavailable', async () => {
    expect(await saveImage(image(), fakeIndexedDb({ putError: 'DataError' }).factory)).toEqual({
      ok: false,
      reason: 'unavailable',
    });
    expect(await saveImage(image(), fakeIndexedDb({ openError: true }).factory)).toEqual({
      ok: false,
      reason: 'unavailable',
    });
  });

  it('is unavailable (never throws) when the browser has no IndexedDB', async () => {
    expect(await saveImage(image(), null)).toEqual({ ok: false, reason: 'unavailable' });
    expect(await loadImage('a', null)).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('recognises quota errors across browsers', () => {
    expect(isQuotaError(new DOMException('x', 'QuotaExceededError'))).toBe(true);
    expect(isQuotaError({ code: 22 })).toBe(true);
    expect(isQuotaError(new Error('x'))).toBe(false);
    expect(isQuotaError(null)).toBe(false);
  });
});

describe('background value for a stored file', () => {
  it('round-trips and ignores every other kind of value', () => {
    expect(parseCustomImageValue(customImageValue('abc'))).toBe('abc');
    expect(parseCustomImageValue('https://example.com/a.png')).toBeNull();
    expect(parseCustomImageValue('aurora')).toBeNull();
    expect(parseCustomImageValue('data:image/png;base64,AAAA')).toBeNull();
  });
});

describe('image list in localStorage', () => {
  beforeEach(() => void installMemoryStorage());

  it('reads nothing from empty or corrupt storage', () => {
    expect(readMeta()).toEqual([]);
    localStorage.setItem(META_KEY, '{oops');
    expect(readMeta()).toEqual([]);
    localStorage.setItem(META_KEY, JSON.stringify([{ nope: 1 }, { id: 'a', name: 'x' }]));
    expect(readMeta()).toEqual([{ id: 'a', name: 'x' }]);
  });

  it('says so when the browser refuses the write', () => {
    expect(writeMeta([{ id: 'a', name: 'x' }])).toBe(true);
    const { storage } = installMemoryStorage();
    storage.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
    expect(writeMeta([{ id: 'a', name: 'x' }])).toBe(false);
  });
});

describe('migrateLegacyCustomImages', () => {
  const DATA = 'data:image/png;base64,aGVsbG8=';
  beforeEach(() => void installMemoryStorage());

  const seed = (backgroundValue = DATA) => {
    localStorage.setItem(META_KEY, JSON.stringify([{ id: 'old', name: 'me.png', dataUrl: DATA }]));
    localStorage.setItem(
      'background-settings',
      JSON.stringify({ type: 'image', value: backgroundValue, opacity: 0.8, blur: 0, brightness: 100 }),
    );
  };

  it('moves the base64 into IndexedDB and leaves only a reference in localStorage', async () => {
    seed();
    const { factory, rows } = fakeIndexedDb();

    await migrateLegacyCustomImages(factory);

    expect(rows.has('old')).toBe(true);
    expect(readMeta()).toEqual([{ id: 'old', name: 'me.png' }]);
    expect(JSON.parse(localStorage.getItem('background-settings')!).value).toBe('custom:old');
    expect(localStorage.getItem(META_KEY)).not.toContain('base64');
  });

  it('leaves a background that points elsewhere alone', async () => {
    seed('aurora');
    await migrateLegacyCustomImages(fakeIndexedDb().factory);
    expect(JSON.parse(localStorage.getItem('background-settings')!).value).toBe('aurora');
  });

  it('changes nothing when IndexedDB refuses, so the old image keeps working', async () => {
    seed();
    await migrateLegacyCustomImages(fakeIndexedDb({ putError: 'QuotaExceededError' }).factory);
    expect(readMeta()[0].dataUrl).toBe(DATA);
    expect(JSON.parse(localStorage.getItem('background-settings')!).value).toBe(DATA);
  });

  it('does nothing when there is no legacy entry (or no IndexedDB)', async () => {
    localStorage.setItem(META_KEY, JSON.stringify([{ id: 'u', name: 'x', url: 'https://example.com/a.jpg' }]));
    await migrateLegacyCustomImages(fakeIndexedDb().factory);
    expect(readMeta()).toEqual([{ id: 'u', name: 'x', url: 'https://example.com/a.jpg' }]);

    seed();
    await migrateLegacyCustomImages(null);
    expect(readMeta()[0].dataUrl).toBe(DATA);
  });
});
