// @vitest-environment node
/**
 * PGlite (about 10 MB of WASM) is the local-only database. It must not be loaded where
 * DATABASE_URL points at Neon: that would slow every serverless cold start for nothing.
 * The real PGlite is never started here (the dev server owns `.pglite`); both packages are mocked.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import nextConfig from '../../next.config';

vi.mock('server-only', () => ({}));

const pgliteLoaded = vi.fn();
const createPglite = vi.fn();
const drizzlePglite = vi.fn((config: { client: unknown }) => ({ kind: 'pglite', client: config.client }));

function mockPglite() {
  vi.doMock('@electric-sql/pglite', () => {
    pgliteLoaded('@electric-sql/pglite');
    return {
      PGlite: class {
        constructor(dir: string) {
          createPglite(dir);
        }
      },
    };
  });
  vi.doMock('drizzle-orm/pglite', () => {
    pgliteLoaded('drizzle-orm/pglite');
    return { drizzle: drizzlePglite };
  });
}

const globalForDb = globalThis as { __studyBroDb?: unknown };

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  delete globalForDb.__studyBroDb;
  pgliteLoaded.mockClear();
  createPglite.mockClear();
  drizzlePglite.mockClear();
  mockPglite();
});

describe('database module', () => {
  it('has no static import of PGlite or its drizzle adapter (the dynamic import is what keeps it lazy)', () => {
    const source = readFileSync(join(process.cwd(), 'src/db/index.ts'), 'utf8');
    expect(source).not.toMatch(/^import\s+(?!type\b)[^;]*from\s+['"]@electric-sql\/pglite['"]/m);
    expect(source).not.toMatch(/^import\s+(?!type\b)[^;]*from\s+['"]drizzle-orm\/pglite['"]/m);
    expect(source).toContain("import('@electric-sql/pglite')");
  });

  it('tells the file tracer to leave PGlite out of the serverless functions (it follows literal dynamic imports too)', () => {
    const excludes = nextConfig.outputFileTracingExcludes?.['/*'] ?? [];
    expect(excludes.join(' ')).toContain('@electric-sql/pglite');
    expect(excludes.join(' ')).toContain('.pnpm/@electric-sql+pglite');
  });

  it('never loads PGlite when DATABASE_URL is set (production, preview)', async () => {
    vi.stubEnv('DATABASE_URL', 'postgres://user:pass@localhost:5432/app');
    const { db, isLocalDatabase } = await import('./index');
    expect(isLocalDatabase()).toBe(false);
    expect(typeof db.select).toBe('function');
    expect(pgliteLoaded).not.toHaveBeenCalled();
    expect(createPglite).not.toHaveBeenCalled();
  });

  it('never loads PGlite on Vercel, and says why the database is missing instead of crashing at import', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('VERCEL', '1');
    const { db } = await import('./index');
    expect(pgliteLoaded).not.toHaveBeenCalled();
    expect(() => db.select).toThrow(/DATABASE_URL is required on Vercel/);
  });

  it('loads PGlite for a local run, but only creates the database on first use, once', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('VERCEL', '');
    const { db, LOCAL_DB_DIR } = await import('./index');
    expect(pgliteLoaded).toHaveBeenCalledWith('@electric-sql/pglite');
    expect(pgliteLoaded).toHaveBeenCalledWith('drizzle-orm/pglite');
    // Importing the module must not open the database directory (next build imports it from several workers)
    expect(createPglite).not.toHaveBeenCalled();

    const local = db as unknown as { kind: string; client: unknown };
    expect(local.kind).toBe('pglite');
    expect(local.client).toBeDefined();
    expect(createPglite).toHaveBeenCalledTimes(1);
    expect(createPglite).toHaveBeenCalledWith(LOCAL_DB_DIR);
    expect(drizzlePglite).toHaveBeenCalledTimes(1);
  });
});
