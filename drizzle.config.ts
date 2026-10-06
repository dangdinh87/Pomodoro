import { defineConfig } from 'drizzle-kit';
import { resolveMigrationTarget } from './src/db/migration-target';

// drizzle-kit does not read Next's env files; DATABASE_URL lives in .env.local.
try {
  process.loadEnvFile('.env.local');
} catch {}

// No DATABASE_URL: local PGlite (.pglite/). In CI a missing or pooled URL throws instead.
const target = resolveMigrationTarget(process.env);

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  ...(target.kind === 'postgres'
    ? { dbCredentials: { url: target.url } }
    : { driver: 'pglite', dbCredentials: { url: target.dir } }),
});
