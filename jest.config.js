const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  // Ignore build output and sibling worktrees (duplicate test copies)
  testPathIgnorePatterns: ['/node_modules/', '/.kilo/', '/.claude/', '/.next/'],
  modulePathIgnorePatterns: ['/.kilo/', '/.claude/', '/.next/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.test.{ts,tsx}'],
  // Ratchet: set to measured values; raise as coverage grows
  coverageThreshold: {
    // Ratchet: set just below the measured coverage; raise it as tests are added.
    global: { statements: 14, branches: 13, functions: 11, lines: 14 },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)