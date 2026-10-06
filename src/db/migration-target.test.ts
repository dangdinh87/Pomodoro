/** @vitest-environment node */
import { resolveMigrationTarget } from './migration-target';

const NEON = 'postgresql://user:pw@ep-cool-123456.us-east-2.aws.neon.tech/neondb?sslmode=require';
const NEON_POOLED = 'postgresql://user:pw@ep-cool-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

describe('resolveMigrationTarget', () => {
  it('uses the local PGlite directory when DATABASE_URL is unset outside CI', () => {
    expect(resolveMigrationTarget({})).toEqual({ kind: 'pglite', dir: '.pglite' });
    expect(resolveMigrationTarget({ DATABASE_URL: '   ' })).toEqual({ kind: 'pglite', dir: '.pglite' });
  });

  it('targets Postgres whenever DATABASE_URL is set', () => {
    expect(resolveMigrationTarget({ DATABASE_URL: NEON })).toEqual({ kind: 'postgres', url: NEON });
    // A pooled URL is fine on a developer machine
    expect(resolveMigrationTarget({ DATABASE_URL: NEON_POOLED })).toEqual({ kind: 'postgres', url: NEON_POOLED });
  });

  it('fails loudly in CI instead of silently migrating a throwaway PGlite', () => {
    expect(() => resolveMigrationTarget({ CI: 'true' })).toThrow(/DATABASE_URL/);
    expect(() => resolveMigrationTarget({ CI: 'true', DATABASE_URL: '' })).toThrow(/DATABASE_URL/);
  });

  it('rejects a pooled (pgbouncer) URL in CI: DDL needs a direct connection', () => {
    expect(() => resolveMigrationTarget({ CI: 'true', DATABASE_URL: NEON_POOLED })).toThrow(/unpooled/i);
    expect(resolveMigrationTarget({ CI: 'true', DATABASE_URL: NEON })).toEqual({ kind: 'postgres', url: NEON });
  });
});
