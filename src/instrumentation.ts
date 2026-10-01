export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { db, isLocalDatabase, MIGRATIONS_FOLDER } = await import('@/db');
  // Neon is migrated by `pnpm db:migrate` in the deploy step; local PGlite migrates itself.
  if (!isLocalDatabase()) return;
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  await migrate(db as Parameters<typeof migrate>[0], { migrationsFolder: MIGRATIONS_FOLDER });
}
