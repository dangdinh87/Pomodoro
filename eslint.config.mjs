import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  // Agent tooling folders hold worktrees and scratch copies of the app.
  globalIgnores([
    '.next/**',
    'coverage/**',
    'next-env.d.ts',
    '.kilo/**',
    '.claude/**',
    '.agent/**',
    '.shared/**',
    '.gemini/**',
    '.cursor/**',
    '.jules/**',
  ]),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'prefer-const': 'warn',
      // React Compiler rules (new in eslint-config-next 16). They flag code that
      // predates the upgrade and is being rewritten in the v2 shell; back to
      // 'error' once plans/261001-2241-study-bro-v2 phases 03-06 land.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    // next.config.ts maps `@phosphor-icons/react/dist/ssr` imports to one file per icon
    // (modularizeImports). The deprecated `*Icon` aliases (ArmchairIcon) have no file, so the
    // build fails with "Can't resolve .../ssr/ArmchairIcon" while tsc and the tests stay green.
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@phosphor-icons/react/dist/ssr'],
              importNamePattern: '^.+Icon$',
              message:
                'Import the icon by its plain name (Armchair, not ArmchairIcon): modularizeImports in next.config.ts has no file for the *Icon aliases, so the build fails.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.config.js', 'jest.setup.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
]);
