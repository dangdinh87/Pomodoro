import type { Instrumentation } from 'next';
import { buildServerErrorReport, reportError } from '@/lib/observability/error-reporter';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { db, isLocalDatabase, MIGRATIONS_FOLDER } = await import('@/db');
  // Neon is migrated by .github/workflows/db-migrate.yml (`pnpm db:migrate`); local PGlite migrates itself.
  if (!isLocalDatabase()) return;
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
