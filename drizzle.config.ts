import { defineConfig } from 'drizzle-kit';

// drizzle-kit does not read Next's env files; DATABASE_URL lives in .env.local.
try {
  process.loadEnvFile('.env.local');
} catch {}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  ...(process.env.DATABASE_URL
    ? { dbCredentials: { url: process.env.DATABASE_URL } }
    : { driver: 'pglite', dbCredentials: { url: './.pglite' } }),
});
