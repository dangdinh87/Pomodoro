# Phase 04: Quality gates & CI

## Context links
- Report §0, §5: [review-261001-0847-project-gap-analysis.md](../reports/review-261001-0847-project-gap-analysis.md)
- Plan: [plan.md](plan.md) | Testing template: `docs/ai/testing/README.md`

## Overview
- Date: 2026-10-01 | Priority: P1 | Status: pending | Effort: ~1.5d

## Key insights
- Baseline thật:
  - tsc: 129 lỗi (20 ở code chạy, 109 do thiếu `@types/jest`).
  - lint: exit 1 (3 error do rule chưa nạp).
  - jest: 1 test fail, chạy 2 lần vì quét `.kilo/worktrees`.
- `ignoreBuildErrors` làm lỗi type lọt lên production. Không có CI chặn lại.

## Requirements
1. tsc, lint và jest cùng xanh, sau đó bỏ `ignoreBuildErrors` và `ignoreDuringBuilds`.
2. GitHub Actions: install, type-check, lint, test (có coverage) trên mọi PR.
3. Jest config đúng: ignore worktrees, `collectCoverageFrom: src/**`, threshold khởi điểm 20% rồi nâng dần.
4. Test cho các unit rủi ro cao: timer-store, session-complete, tasks API, use-tasks.

## Architecture
- `.github/workflows/ci.yml`: Node 22 (hoặc 24), pnpm cache, `pnpm install --frozen-lockfile`, rồi `type-check`, `lint`, `test --coverage`.
- ESLint: `next/core-web-vitals` + `next/typescript`. `no-explicit-any: warn`, `no-console: [warn, {allow: [warn, error]}]`.
- Prettier: chọn 1 trong 2. Cài prettier + script `format` theo style hiện tại (2 space), **hoặc** xoá `.prettierrc`. Khuyến nghị: xoá (YAGNI) nếu không ai dùng.

## Related code files
- `next.config.js`, `tsconfig.json` (`target: es5` → `es2020`), `.eslintrc.json`, `jest.config.js`, `jest.setup.js`
- 20 file có lỗi TS (danh sách trong report §5): `task-list.tsx`, `subtask-list.tsx`, `app-providers.tsx`, `model-selector.tsx`, `theme-provider.tsx`, `animate-ui/*`, `focus-chart.tsx`, `use-custom-backgrounds.ts`, `audio-cleanup-provider.tsx`, `youtube-suggestions.ts`
- `src/app/(main)/timer/components/timer-settings-dock.test.tsx`

## Implementation steps
1. `pnpm add -D @types/jest`. `tsconfig` đổi target sang `es2020`, thêm `"types": ["jest", "@testing-library/jest-dom"]`.
2. `jest.config.js`:
   - `testPathIgnorePatterns: ['/node_modules/', '/.kilo/', '/.next/']`.
   - `modulePathIgnorePatterns: ['/.kilo/']`.
   - `collectCoverageFrom` + `coverageThreshold`.
3. `jest.setup.js`: mock `next/navigation` thay cho `next/router`.
4. Sửa test `timer-settings-dock` (aria-label phải là text đã dịch, không phải key).
5. Sửa 20 lỗi TS. Xoá `layout/navigation.tsx` và `focus/focus-mode.tsx` (dead) thay vì sửa.
6. Cài `@typescript-eslint` qua `next/typescript` để các `eslint-disable` hiện có hợp lệ. Sửa `exhaustive-deps` có chủ đích.
7. Viết test:
   - `timer-store` (rehydrate, transition).
   - `session-complete` (validate, auth).
   - `tasks` route (ownership, sanitize `q`).
   - `use-tasks` (optimistic).
   - `auth/callback` (open redirect).
8. CI workflow + branch protection trên `master`.
9. Bỏ `ignoreBuildErrors` và `ignoreDuringBuilds`. Chạy `pnpm build` local để xác nhận.
10. Thêm `.github/dependabot.yml` (npm hằng tuần, gom nhóm minor/patch).

## Todo list
- [ ] @types/jest + tsconfig target
- [ ] Jest config/setup
- [ ] Sửa test fail
- [ ] Sửa 20 lỗi TS / xoá file dead
- [ ] ESLint config
- [ ] Test cho unit rủi ro cao
- [ ] CI + branch protection
- [ ] Bỏ ignore flags, build pass
- [ ] Dependabot

## Success criteria
- CI xanh trên PR. `pnpm build` pass khi không còn ignore flags.
- Coverage ≥ 20% tính trên toàn `src`, threshold được enforce.

## Risk assessment
- Bỏ ignore flags có thể làm Vercel build fail nếu còn lỗi sót. Chỉ merge sau khi CI và `pnpm build` local đều pass.

## Security considerations
- CI không cần secret thật. Mock env bằng giá trị giả trong workflow.

## Next steps
Phase 06 dựa vào CI để tránh regression UI/i18n. Có thể thêm Playwright smoke (login, start timer, add task) sau.
