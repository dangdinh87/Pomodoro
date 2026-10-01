---
phase: 00
title: "Nền móng & hợp nhất nhánh"
status: done (trừ xoá lịch sử git — chờ xác nhận)
estimate: 1.5 ngày
depends_on: — (chủ dự án đã đồng ý commit + merge, làm chung một nhánh)
---

# Phase 00 — Nền móng & hợp nhất nhánh

## Mục tiêu
Có một nhánh duy nhất, sạch, chứa cả phần UI (feat/design-system) lẫn phần bảo mật/CI (fix/security-and-quality-gates), làm điểm xuất phát cho v2.

## Các bước
1. Commit feat/design-system theo nhóm logic (design system & token; khung app; timer; tasks; history/arcade/settings; landing/auth; i18n). Backup đã có ở `refs/backup/design-redo-261001-1521`.
2. Dời 10 file plan chưa track (sẽ chặn merge) vào đúng chỗ hoặc commit chúng trước.
3. Merge `origin/fix/security-and-quality-gates`. 46 đường dẫn trùng; xử lý theo thứ tự rủi ro:
   - `task-management.tsx`, `timer-controls.tsx`: giữ UI mới, áp lại logic sửa lỗi của nhánh kia (ghi phiên tin cậy, optimistic update).
   - 2 layout: giữ khung mới + skip link + `main#main-content` + GlobalChat chỉ nạp khi bật cờ.
   - `globals.css`, 3 file locale: hợp nhất thủ công, chạy kiểm tra JSON hợp lệ.
   - 6 file bị xoá một bên/sửa bên kia: theo ghi chú merge ở `plans/reports/implementation-261001-1000-gap-remediation.md`.
4. Tiếp tục làm trên chính nhánh `feat/design-system` (không tách nhánh mới).
5. Dọn: xoá ~35 file không ai import (danh sách trong báo cáo inventory), 6 file task cũ, gỡ 8 dependency thừa (gồm `recharts`), gỡ `.kilo/worktrees` khỏi phạm vi jest.
6. Gỡ `backgrounds-source/` (181 MB) khỏi cây làm việc; chuyển tài sản gốc ra kho riêng (quyết định ở phase 06). Không viết lại lịch sử git khi chưa hỏi.

## File chính
`src/components/tasks/task-management.tsx`, `src/app/(main)/timer/components/timer-controls.tsx`, `src/app/(main)/layout.tsx`, `src/app/(landing)/layout.tsx`, `src/app/globals.css`, `src/i18n/locales/*.json`, `package.json`, `jest.config.js`.

## Tiêu chí xong
- Nhánh `feat/design-system` chứa cả hai phần; `pnpm build` chạy; test xanh; không còn import tới file đã xoá.
- Soát nhanh bằng harness: `/timer`, `/tasks` khi đăng nhập giả và khi là khách.

## Rủi ro
- Merge `task-management.tsx` mất logic sửa lỗi → so diff từng hunk với commit `58d9280`.
- Xoá nhầm file đang dùng → kiểm tra importer bằng script trước khi xoá.

## Câu hỏi còn lại
- Xoá 181 MB ảnh gốc khỏi **lịch sử** git cần force-push mọi nhánh → người cộng tác phải clone lại. Chỉ làm khi chủ dự án xác nhận riêng.

## Kết quả (2026-10-01)
- Commit theo nhóm: `bda270d` design system → `1b76543` các trang, `c5919e1` plan; merge `2f8dbf6` (20 xung đột, giữ UI mới + áp lại logic ghi phiên của nhánh fix).
- Dọn `767ffb8`: xoá ~35 file chết, 11 dependency thừa, script `.py`, `build.log`; menu lọc theo cờ.
- `backgrounds-source/`: mới xoá các bộ không dùng (classic, travelling, video anime-cozy). Phần còn lại vẫn là nguồn của `prebuild` → gỡ hẳn ở phase 06.
- Kiểm tra: tsc 0 lỗi, jest 226/226, build bật gate type/lint, harness `/timer` `/tasks` `/history` `/settings` + khách không lỗi bước.
- **Còn treo:** xoá 181 MB khỏi lịch sử git (force-push) — chờ chủ dự án xác nhận riêng.
