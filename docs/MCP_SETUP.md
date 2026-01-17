# Hướng dẫn cấu hình MCP Supabase

## Lấy Supabase Access Token
1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Vào **Account Settings** > **Access Tokens**
3. Tạo Personal Access Token mới
4. Copy token (bắt đầu với `sbp_`)

⚠️ **Lưu ý:** Token của bạn đã được cung cấp, sử dụng nó trong các bước cấu hình bên dưới.

## Cách cấu hình trong Cursor

### Cách 1: Qua Cursor Settings UI
1. Mở Cursor Settings: `Cmd + ,` (Mac) hoặc `Ctrl + ,` (Windows/Linux)
2. Tìm "Model Context Protocol" hoặc "MCP" trong search
3. Tìm Supabase MCP server configuration
4. Thêm access token vào field tương ứng

### Cách 2: Qua Cursor Settings JSON
1. Mở Command Palette: `Cmd + Shift + P` (Mac) hoặc `Ctrl + Shift + P` (Windows/Linux)
2. Gõ "Preferences: Open User Settings (JSON)"
3. Thêm cấu hình sau:

```json
{
  "mcp": {
    "servers": {
      "supabase": {
        "command": "npx",
        "args": [
          "-y",
          "@supabase/mcp-server-supabase"
        ],
        "env": {
          "SUPABASE_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
        }
      }
    }
  }
}
```

### Cách 3: Qua Environment Variables
Thêm vào shell profile (`~/.zshrc` hoặc `~/.bashrc`):
```bash
export SUPABASE_ACCESS_TOKEN="YOUR_TOKEN_HERE"
```

Sau đó restart Cursor.

## Kiểm tra kết nối
Sau khi cấu hình, restart Cursor và test lại bằng cách:
- Gọi các MCP Supabase functions
- List projects hoặc organizations

## Lưu ý bảo mật
⚠️ **KHÔNG commit token này vào Git!**
- Token đã được thêm vào `.gitignore` (nếu có)
- Nếu cần share, sử dụng environment variables hoặc secret management
