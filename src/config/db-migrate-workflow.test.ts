/** @vitest-environment node */
import { readFileSync } from 'node:fs';

// The production database secret must never be reachable from a pull request or a fork.
const workflow = readFileSync('.github/workflows/db-migrate.yml', 'utf8');
const triggers = workflow.slice(workflow.indexOf('\non:'), workflow.indexOf('\nconcurrency:'));

describe('db-migrate workflow', () => {
  it('has no pull request trigger of any kind', () => {
    expect(triggers).not.toMatch(/pull_request/);
    expect(triggers).not.toMatch(/workflow_run/);
  });

  it('runs on a push to master that touches drizzle/**, or by hand', () => {
    expect(triggers).toMatch(/push:\s+branches: \[master\]\s+paths:\s+- 'drizzle\/\*\*'/);
    expect(triggers).toMatch(/workflow_dispatch:/);
  });

  it('refuses to run from any other branch, even when started by hand', () => {
    expect(workflow).toContain("if: github.ref == 'refs/heads/master'");
  });

  it('never runs two migrations at once, and never cancels one halfway', () => {
    expect(workflow).toMatch(/concurrency:\s+group: db-migrate\s+cancel-in-progress: false/);
  });

  it('takes the connection string from the DATABASE_URL secret and migrates with the repo script', () => {
    expect(workflow).toContain('DATABASE_URL: ${{ secrets.DATABASE_URL }}');
    expect(workflow).toContain('run: pnpm db:migrate');
    expect(workflow).toContain('pnpm install --frozen-lockfile');
  });

  it('uses the same Node and pnpm setup as CI', () => {
    const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
    for (const line of ['node-version: 22', 'version: 10', 'pnpm/action-setup@v4', 'actions/setup-node@v4']) {
      expect(ci).toContain(line);
      expect(workflow).toContain(line);
    }
  });
});
