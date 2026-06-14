#!/bin/bash
# ============================================================
# 数据库备份脚本
# 用法：bash scripts/db-backup.sh
# 备份文件保存在 ./backups/ 目录
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/blog_backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 备份数据库..."

# 生产环境
if docker ps --format '{{.Names}}' | grep -q "blog-postgres"; then
  docker exec blog-postgres pg_dump -U blog_user blog | gzip > "$BACKUP_FILE"
  echo "✅ 备份完成: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
  echo "⚠️  blog-postgres 容器未运行，尝试本地备份..."
  PGPASSWORD="${PGPASSWORD:-blog_password}" pg_dump -h localhost -U blog_user blog | gzip > "$BACKUP_FILE"
  echo "✅ 本地备份完成: $BACKUP_FILE"
fi

# 仅保留最近 30 天的备份
find "$BACKUP_DIR" -name "blog_backup_*.sql.gz" -mtime +30 -delete 2>/dev/null || true
echo "🧹 已清理 30 天前的旧备份"
