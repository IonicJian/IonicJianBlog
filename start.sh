#!/bin/bash
set -e
BLOG_DIR="$(cd "$(dirname "$0")" && pwd)"

# Force-kill anything on our ports
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 2

# Build & start backend (stay in backend dir so uploads path works)
echo "=== Backend ==="
cd "$BLOG_DIR/backend"
go build -o /tmp/blog-server ./cmd/server
/tmp/blog-server &
sleep 3

# Start frontend
echo "=== Frontend ==="
cd "$BLOG_DIR/frontend"
npx vite --host 0.0.0.0 --port 5173 &
sleep 3

# Verify
echo ""
curl -sf http://localhost:8080/api/v1/health >/dev/null && echo "后端: http://localhost:8080 ✅" || echo "后端: FAILED ❌"
curl -sf http://localhost:5173/ >/dev/null && echo "前端: http://localhost:5173 ✅" || echo "前端: FAILED ❌"
