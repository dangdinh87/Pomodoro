# Phase 05: Repo hygiene & docs

## Context links
- Report §5, §6: [review-261001-0847-project-gap-analysis.md](../reports/review-261001-0847-project-gap-analysis.md)
- Plan: [plan.md](plan.md)

## Overview
- Date: 2026-10-01 | Priority: P2 | Status: pending | Effort: ~0.5d

## Key insights
- README và `.env.example` mô tả một stack khác (Prisma, NextAuth, WebSockets, Spotify). Người mới không setup nổi.
- 7 dependency không có import nào. 2 thư viện motion trùng chức năng.

## Requirements
1. Gỡ file rác khỏi git, cập nhật `.gitignore`.
2. Xoá dependency không dùng. Hợp nhất thư viện motion và icon.
3. Viết lại README và `.env.example` theo stack thật. Thêm LICENSE.
4. Docs: setup Supabase (dựa trên phase 02), bảng env, sơ đồ kiến trúc hiện tại.

## Architecture
N/A. Chỉ dọn dẹp và viết tài liệu.

## Related code files
- Root: `build.log`, `fix_use_client.py`, `modify_task_item.py`, `modify_sortable_task_item.py`, `test_task_item.py`, `fix_sessions_rls.sql`, `supabase_schema.sql`, `backgrounds-source/`, `.agent`, `.claude`, `.cursor`, `.gemini`, `.jules`
- `package.json`, `README.md`, `.env.example`, `docs/ARCHITECTURE.md`, `docs/index.md`

## Implementation steps
1. `git rm --cached` file rác. Thêm `*.log`, `*.py` (root), các thư mục AI tool (tuỳ quyết định câu hỏi 6) vào `.gitignore`.
2. `backgrounds-source/`: chuyển sang Git LFS hoặc storage ngoài nếu là ảnh gốc lớn. Nếu `prebuild` cần thì giữ.
3. `pnpm remove crypto-js @types/crypto-js idb react-use use-debounce svg-dotted-map react-hot-toast @radix-ui/react-toast`.
4. Chuyển 14 file `framer-motion` sang `motion/react`, rồi remove `framer-motion`.
   - Icon: **bỏ bước này**. `feat/design-system` đang đổi lucide → Phosphor. Sau khi nhánh đó merge, chỉ cần gỡ `lucide-react`/`@tabler/icons-react` còn sót.
   - Làm bước này sau khi `feat/design-system` merge để tránh conflict.
5. `.env.example` chỉ giữ biến thật, mỗi biến 1 dòng comment:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `MEGALLM_API_KEY`
   - `NEXT_PUBLIC_GA_ID`
6. README:
   - Stack thật (Supabase, AI chat, Zustand, TanStack Query, i18n en/vi/ja).
   - Lệnh `pnpm`, setup DB bằng `supabase start` / `db reset`.
   - Link docs.
   - Xoá các claim chưa có (PWA, WebSockets, Spotify, focus blocking) cho tới khi làm thật.
7. Thêm `LICENSE` (MIT, đúng như README ghi) hoặc xoá dòng license.
8. Cập nhật `docs/ARCHITECTURE.md` (mermaid route groups, data flow timer → API → Supabase).

## Todo list
- [ ] Gỡ file rác + .gitignore
- [ ] Gỡ dependency không dùng
- [ ] Hợp nhất motion và icon
- [ ] .env.example
- [ ] README
- [ ] LICENSE
- [ ] ARCHITECTURE.md

## Success criteria
- `git ls-files` không còn file rác. `pnpm build` pass sau khi gỡ dependency.
- Người mới clone repo và chạy được local chỉ bằng README.

## Risk assessment
- Gỡ `framer-motion` có thể lệch API (v10 sang v12). Test thủ công landing và timer animation.
- `git rm` thư mục AI tool có thể làm vỡ workflow của tool đó. Hỏi user trước (câu hỏi 6).

## Security considerations
- Kiểm `git log --all -- .env` một lần nữa (hiện tại sạch). Không đưa giá trị thật vào `.env.example`.

## Next steps
Phase 06.
