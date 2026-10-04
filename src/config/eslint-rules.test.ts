/** @vitest-environment node */
import { ESLint } from 'eslint';

// Loads the real eslint.config.mjs (Next presets included), so allow for a slow first lint.
vi.setConfig({ testTimeout: 60_000 });
const eslint = new ESLint({ cwd: process.cwd() });
const ICONS = '@phosphor-icons/react/dist/ssr';

async function restrictedImports(code: string) {
  const [result] = await eslint.lintText(code, { filePath: 'src/components/example.tsx' });
  return result.messages.filter((m) => m.ruleId === 'no-restricted-imports');
}

describe('Phosphor icon imports (modularizeImports in next.config.ts)', () => {
  it('allows the plain icon names', async () => {
    expect(await restrictedImports(`import { Armchair, Timer } from '${ICONS}';\nexport const a = [Armchair, Timer];\n`)).toEqual([]);
  });

  it('allows the Icon type', async () => {
    expect(await restrictedImports("import type { Icon } from '@phosphor-icons/react';\nexport type A = Icon;\n")).toEqual([]);
    expect(await restrictedImports(`import { Armchair, type Icon } from '${ICONS}';\nexport const a: Icon = Armchair;\n`)).toEqual([]);
  });

  it('rejects the *Icon aliases that break the build, with a message that says what to do', async () => {
    const found = await restrictedImports(`import { ArmchairIcon } from '${ICONS}';\nexport const a = ArmchairIcon;\n`);
    expect(found).toHaveLength(1);
    expect(found[0].message).toMatch(/plain name/);
  });

  it('rejects the alias in a mixed import and in a re-export, but not a local rename', async () => {
    expect(await restrictedImports(`import { Timer, CaretDownIcon } from '${ICONS}';\nexport { Timer, CaretDownIcon };\n`)).toHaveLength(1);
    expect(await restrictedImports(`export { TimerIcon } from '${ICONS}';\n`)).toHaveLength(1);
    expect(await restrictedImports(`import { Timer as TimerIcon } from '${ICONS}';\nexport { TimerIcon };\n`)).toEqual([]);
  });
});
