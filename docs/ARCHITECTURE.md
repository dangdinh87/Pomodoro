# 🏗️ Tài liệu Phân tích Kiến trúc: Study Bro App

Chào mừng bạn đến với bản phân tích kỹ thuật chi tiết nhất về **Study Bro App**. Tài liệu này được thiết kế để cung cấp cái nhìn toàn diện về mọi khía cạnh: từ mã nguồn, quy trình xử lý dữ liệu, hệ thống AI cho đến các quy chuẩn thiết kế và cấu hình môi trường.

---

## � 1. Tổng quan Kỹ thuật (Technical Overview)

Study Bro App là một nền tảng năng suất hiện đại, kết hợp Pomodoro, quản lý tác vụ và trợ lý AI. Ứng dụng được xây dựng trên nền tảng **Next.js 14 (App Router)** để tận dụng tối đa Server Components và tối ưu hóa tốc độ tải trang (Initial Page Load).

### Các trụ cột công nghệ chính:

- **Framework**: `Next.js 14.0.4` (React 18).
- **Ngôn ngữ**: `TypeScript` (Type-strict).
- **Cơ sở dữ liệu & Auth**: `Supabase` (PostgreSQL + GoTrue).
- **Quản lý Trạng thái**: `Zustand` (Client-side) & `TanStack Query v5` (Server-side sync).
- **Giao diện**: `Tailwind CSS`, `Radix UI`, `Framer Motion`.

---

## 🛠️ 2. Hệ thống Thư viện & Package (Packages Analysis)

Hệ thống dependencies được chọn lọc kỹ lưỡng để đảm bảo hiệu suất:

- **Core UI**:
  - `@radix-ui/*`: Các thành phần primitive không kiểu dáng, đảm bảo tính truy cập (Accessibility).
  - `lucide-react` & `@tabler/icons-react`: Bộ icon vector SVG nhẹ và hiện đại.
  - `framer-motion`: Xử lý animation vật lý (Spring animations) và gesture.
- **AI & Chat**:
  - `@assistant-ui/react`: Framework chuyên biệt để xây dựng giao diện hội thoại (AI Chat).
  - `ai` (Vercel AI SDK): Hỗ trợ streaming dữ liệu từ LLM.
- **Data & Utils**:
  - `@tanstack/react-query`: Quản lý cache dữ liệu từ API, xử lý retry và optimistic updates.
  - `date-fns`: Xử lý thời gian và định dạng ngày tháng chính xác.
  - `idb`: Lưu trữ dữ liệu cục bộ vào IndexedDB cho các tác vụ nặng (như Spotify/Youtube sync).

---

## 📁 3. Cấu trúc Thư mục & Quy chuẩn (Code Organization)

```text
src/
├── app/               # App Router: Routing, Layout, API Routes (Next.js 14)
├── components/        # UI Components chia theo tính năng (timer, tasks, chat...)
│   ├── ui/            # Các component nền tảng (Button, Input, Card - Shadcn style)
│   ├── animate-ui/    # Các thành phần có hiệu ứng đặc biệt
├── stores/            # Zustand stores: Quản lý trạng thái toàn cục
├── hooks/             # Custom hooks: Tách biệt logic nghiệp vụ khỏi UI
├── lib/               # Cấu hình bên thứ 3 (Supabase Client, YouTube Utils)
├── contexts/          # React Contexts (I18n, Theme)
└── middleware.ts      # Xử lý Auth và bảo mật ở tầng Edge
```

---

## 🧠 4. Quản lý Trạng thái & Dữ liệu (State & Data Flow)

Ứng dụng sử dụng mô hình **Dual-Store Strategy**:

### A. Client-Side Persistent State (Zustand)

- **Timer Store**: Lưu trữ thời gian còn lại, trạng thái chạy/nghỉ. Đặc biệt sử dụng `deadlineAt` (Timestamp tuyệt đối) thay vì đếm ngược số giây đơn thuần để tránh sai lệch khi tab bị trình duyệt đưa vào chế độ ngủ (Background throttle).
- **User Store**: Lưu thông tin người dùng và các tùy chỉnh UI cá nhân.
- **Persistence**: Tất cả được đồng bộ với `localStorage` qua middleware `persist`.

### B. Server-Side Synced State (TanStack Query)

- Quản lý các dữ liệu từ Database: `tasks`, `sessions`, `chat history`.
- **Optimistic Updates**: Khi thêm/sửa task, UI cập nhật ngay lập tức trước khi API phản hồi, tạo cảm giác mượt mà (zero-latency).

---

## 🤖 5. Hệ thống AI (AI Environment)

Hệ thống AI được thiết kế linh hoạt qua gói **MegaLLM**:

- **Pipeline**: Frontend gọi `/api/chat` -> API Route xử lý Auth -> Gọi LLM (GPT-4o, Gemini, hoặc Claude) -> Streaming phản hồi về Client qua `assistant-ui`.
- **Model Switching**: Cho phép người dùng chuyển đổi giữa các mô hình khác nhau ngay trong lúc chat mà không mất ngữ cảnh.
- **Data Persistence**: Mọi cuộc hội thoại được lưu vào bảng `conversations` và `messages` trong Supabase để truy cập lại.

---

## 🎨 6. Phong cách & Định dạng (Style, Format & Design)

- **Typography**: Sử dụng **Be Vietnam Pro** (cho sự chuyên nghiệp tiếng Việt) và **Space Grotesk** (cho các con số và phong cách Tech).
- **Design System**:
  - Dựa trên hệ màu HSL linh hoạt (Primary, Secondary, Accent).
  - **Glassmorphism**: Sử dụng `backdrop-blur` mạnh kết hợp với border mờ tạo hiệu ứng lớp kính cao cấp.
  - **Dark Mode**: Hỗ trợ toàn diện qua `next-themes` và Tailwind `dark:` prefix.
- **Animations**: Quy chuẩn "Micro-interactions" - mọi tương tác (click, hover, chuyển trang) đều có phản hồi thị giác mượt mà.

---

## ⚙️ 7. Cấu hình & Môi trường (Config & Env)

### Môi trường (.env):

- `NEXT_PUBLIC_SUPABASE_URL`: Endpoint công khai của backend.
- `DATABASE_URL`: Kết nối PostgreSQL trực tiếp.
- `MEGALLM_API_KEY`: Key bí mật cho các tác vụ AI phía máy chủ.
- `SPOTIFY_CLIENT_ID`: Cấu hình tích hợp âm nhạc.

### Cấu hình Next.js & TypeScript:

- `next.config.js`: Được thiết kế để bỏ qua lỗi build tạm thời (`ignoreBuildErrors`) nhằm tăng tốc độ triển khai liên tục (CI/CD). Cấu hình Webpack để xử lý `fs` module (tránh lỗi khi dùng các thư viện Node trong client).
- `tailwind.config.js`: Định nghĩa các keyframes phức tạp cho hiệu ứng: `accordion-down`, `pulse-ring`, `fade-in`.

---

## � 8. Bảo mật & Hiệu năng (Security & Performance)

- **Middleware Security**: Sử dụng Supabase SSR để kiểm soát phiên làm việc (Session) ở tầng Edge, đảm bảo người dùng chưa đăng nhập không bao giờ thấy được dữ liệu nhạy cảm.
- **Database RLS**: Filter dữ liệu trực tiếp trong Postgres. Mỗi user chỉ thấy data của chính mình (`user_id = auth.uid()`).
- **Performance**:
  - Sử dụng `NextTopLoader` để tạo thanh progress bar ảo khi chuyển trang.
  - Tối ưu hóa font và hình ảnh qua `next/font` và `next/image`.

---

> **Ghi chú**: Kiến trúc này được tối ưu để dễ dàng mở rộng (Scalable). Nếu cần thêm tính năng mới (vd: Multiplayer Focus), hệ thống Supabase Realtime đã sẵn sàng để tích hợp.
