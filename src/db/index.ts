import 'server-only';
import { Pool } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const MIGRATIONS_FOLDER = 'drizzle';
/** Local Postgres (PGlite) used whenever DATABASE_URL is unset: dev server, harness, scripts. */
export const LOCAL_DB_DIR = '.pglite';

export const isLocalDatabase = () => !process.env.DATABASE_URL;

/**
 * PGlite is ~10 MB of WASM and only ever runs locally, so it is loaded with a dynamic import in
 * the local branch alone. A static import would evaluate it on every serverless cold start even
 * with DATABASE_URL set. (The dynamic import does not keep it out of the traced files, because
 * the file tracer follows string-literal imports too: that is `outputFileTracingExcludes` in
 * next.config.ts.) Both packages are loaded together: the drizzle adapter imports PGlite itself.
 */
async function loadLocalDriver() {
  const [{ PGlite }, { drizzle }] = await Promise.all([import('@electric-sql/pglite'), import('drizzle-orm/pglite')]);
  return { PGlite, drizzle };
}

// Top-level await keeps the `db` export synchronous. It only loads the two modules; no database
// is opened here (see createDatabase), so importing this file stays side-effect free.
const localDriver = isLocalDatabase() && !process.env.VERCEL ? await loadLocalDriver() : null;

function createDatabase(): Database {
  const url = process.env.DATABASE_URL;
  if (url) return drizzleNeon({ client: new Pool({ connectionString: url }), schema });
  if (!localDriver) throw new Error('DATABASE_URL is required on Vercel (PGlite needs a writable disk).');
  return localDriver.drizzle({ client: new localDriver.PGlite(LOCAL_DB_DIR), schema });
}

// One instance per process, created on first use: route bundles and
// instrumentation load this module separately, `next build` imports it from
// several workers at once, and two PGlite instances on one directory corrupt it.
const globalForDb = globalThis as unknown as { __studyBroDb?: Database };
const getDatabase = () => (globalForDb.__studyBroDb ??= createDatabase());

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDatabase();
    const value = Reflect.get(real, prop, real);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
