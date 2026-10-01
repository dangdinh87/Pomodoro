import 'server-only';
import { Pool } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema';

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const MIGRATIONS_FOLDER = 'drizzle';
/** Local Postgres (PGlite) used whenever DATABASE_URL is unset: dev server, harness, scripts. */
export const LOCAL_DB_DIR = '.pglite';

export const isLocalDatabase = () => !process.env.DATABASE_URL;

function createDatabase(): Database {
  const url = process.env.DATABASE_URL;
  if (url) return drizzleNeon({ client: new Pool({ connectionString: url }), schema });
  if (process.env.VERCEL) {
    throw new Error('DATABASE_URL is required on Vercel (PGlite needs a writable disk).');
  }
  return drizzlePglite({ client: new PGlite(LOCAL_DB_DIR), schema });
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
