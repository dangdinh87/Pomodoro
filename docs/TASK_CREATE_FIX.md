# Fix: Task Creation Failed - Phân tích và Giải pháp

## Vấn đề đã tìm thấy

### 1. ❌ RLS Policies Missing (ĐÃ FIX)
**Vấn đề:** Table `tasks` có RLS enabled nhưng **KHÔNG có policies nào**, nên không ai có thể insert/select/update/delete.

**Giải pháp:** Đã tạo migration `add_tasks_rls_policies` với 4 policies:
- ✅ SELECT: Users can view their own tasks (chỉ non-deleted)
- ✅ INSERT: Users can insert their own tasks
- ✅ UPDATE: Users can update their own tasks  
- ✅ DELETE: Users can delete their own tasks

**RLS Policy Logic:**
```sql
auth.uid()::text = user_id AND is_deleted = false  -- SELECT
auth.uid()::text = user_id                         -- INSERT/UPDATE/DELETE
```

### 2. ⚠️ Authentication Flow

#### Luồng hiện tại:
1. **Client** (`use-tasks.ts`): Gửi POST `/api/tasks` với body JSON, **KHÔNG có Authorization header**
2. **Server** (`route.ts`):
   - Kiểm tra `isAuthorized(request)`:
     - Nếu `API_ROUTE_TOKEN` không tồn tại → ✅ Cho phép
     - Nếu `API_ROUTE_TOKEN` tồn tại → ❌ Cần Bearer token trong header
   - Tạo Supabase client từ cookies
   - Lấy user từ `supabase.auth.getUser()`
   - Insert task với `user_id = user.id`

#### Vấn đề tiềm ẩn:
- Nếu `API_ROUTE_TOKEN` được set trong env, client cần gửi Bearer token
- Hiện tại client không gửi Authorization header

### 3. ⚠️ Data Type Mismatch
- `user.id` từ Supabase auth là **UUID**
- `user_id` trong tasks table là **TEXT**
- PostgreSQL tự động convert UUID → TEXT khi insert
- RLS policy dùng `auth.uid()::text = user_id` → ✅ Đúng

## Luồng hoàn chỉnh

```
Client (use-tasks.ts)
  ↓ POST /api/tasks
  ↓ Body: { title, description, priority, estimate_pomodoros, tags }
  ↓ Headers: { 'Content-Type': 'application/json' }
  ↓ (KHÔNG có Authorization header)
  ↓
Server (route.ts)
  ↓ isAuthorized(request)
  ↓   - Nếu API_ROUTE_TOKEN không tồn tại → ✅ Pass
  ↓   - Nếu API_ROUTE_TOKEN tồn tại → ❌ Fail (cần Bearer token)
  ↓
  ↓ createClient() từ cookies
  ↓ supabase.auth.getUser() → lấy user từ cookies
  ↓   - Nếu không có user → 401 Unauthorized
  ↓
  ↓ validateCreateTask(body) → validate input
  ↓ buildInsertPayload(userId, data) → { user_id, title, ... }
  ↓
Supabase
  ↓ RLS Policy check: auth.uid()::text = user_id
  ↓ Insert vào tasks table
  ↓ Return task data
```

## Cách test

1. **Kiểm tra RLS policies:**
```sql
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'tasks';
```

2. **Test insert (từ Supabase SQL Editor):**
```sql
-- Cần đăng nhập với user account
INSERT INTO tasks (user_id, title, priority, estimate_pomodoros, tags)
VALUES (auth.uid()::text, 'Test Task', 'MEDIUM', 1, ARRAY[]::text[]);
```

3. **Test từ client:**
- Đảm bảo đã đăng nhập
- Tạo task mới từ UI
- Kiểm tra console logs nếu có lỗi

## Các điểm cần lưu ý

1. **API_ROUTE_TOKEN:**
   - Nếu không cần bảo vệ API route, đảm bảo `API_ROUTE_TOKEN` không được set
   - Nếu cần bảo vệ, client phải gửi `Authorization: Bearer <token>` header

2. **Cookies:**
   - Supabase auth sử dụng cookies để authenticate
   - Middleware phải refresh cookies đúng cách
   - Client phải gửi cookies trong request

3. **RLS Policies:**
   - Đã được tạo và hoạt động
   - Chỉ user có thể thao tác với tasks của chính họ
   - Soft delete: SELECT chỉ trả về tasks có `is_deleted = false`

## Status

- ✅ RLS Policies: Đã fix
- ✅ Migration: Đã apply thành công
- ⚠️ Authentication: Cần test lại từ client
- ⚠️ API_ROUTE_TOKEN: Cần kiểm tra env variable
