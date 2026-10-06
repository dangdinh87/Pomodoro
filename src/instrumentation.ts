import type { Instrumentation } from 'next';
import { buildServerErrorReport, reportError } from '@/lib/observability/error-reporter';

/**
 * Only a local run (no DATABASE_URL, not on Vercel) migrates its own PGlite here; Neon is migrated by
 * .github/workflows/db-migrate.yml (`pnpm db:migrate`). Production returns before importing the
 * database layer at all, and the PGlite imports inside it are left out of the bundle
 * (`turbopackIgnore` in src/db/index.ts), so none of PGlite is traced into this file's function.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.DATABASE_URL || process.env.VERCEL) return;
  const { db, MIGRATIONS_FOLDER } = await import('@/db');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  await migrate(db as Parameters<typeof migrate>[0], { migrationsFolder: MIGRATIONS_FOLDER });
}

/**
 * Server errors Next catches (render, route handlers that throw, server actions, proxy) end up here.
 * Only the route pattern, method, digest and message are read; headers (cookies, auth) and bodies never are.
 * Handlers that catch their own errors report through `serverError` (src/lib/api/responses.ts).
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  await reportError(buildServerErrorReport(error, request, context));
};
