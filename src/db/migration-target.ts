/**
 * Where `pnpm db:migrate` / `db:generate` point. Kept out of drizzle.config.ts so it is unit tested.
 * Plain module on purpose (no `server-only`, no `@/` alias): drizzle-kit loads it through the config.
 */

/** Same directory as LOCAL_DB_DIR in src/db/index.ts (the dev server's PGlite database). */
const LOCAL_DB_DIR = '.pglite';

export type MigrationTarget = { kind: 'postgres'; url: string } | { kind: 'pglite'; dir: string };

export function resolveMigrationTarget(env: Record<string, string | undefined>): MigrationTarget {
  const url = env.DATABASE_URL?.trim();

  if (!url) {
    // CI/CD must never "succeed" by migrating a throwaway local database.
    if (env.CI) {
      throw new Error(
        'DATABASE_URL is not set. CI migrates the real database: add the DATABASE_URL secret (Neon unpooled connection string).',
      );
    }
    return { kind: 'pglite', dir: LOCAL_DB_DIR };
  }

  // Neon's pooled endpoint (pgbouncer, transaction mode) is wrong for DDL and migration locks.
  if (env.CI && /-pooler\./i.test(url)) {
    throw new Error(
      'DATABASE_URL points at the pooled Neon endpoint ("-pooler"). Migrations need the unpooled (direct) connection string.',
    );
  }
  return { kind: 'postgres', url };
}
