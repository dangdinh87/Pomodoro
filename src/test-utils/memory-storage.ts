/** Installs a Map-backed window.localStorage (jest.setup stubs it with no-ops). */
export function installMemoryStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => (mem.has(k) ? (mem.get(k) as string) : null),
    setItem: (k: string, v: string) => void mem.set(k, String(v)),
    removeItem: (k: string) => void mem.delete(k),
    clear: () => mem.clear(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
  return { mem, storage };
}
