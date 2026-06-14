#!/bin/bash
# ============================================================
# 生产环境部署脚本
# 在 VPS 上执行：bash scripts/deploy-prod.sh
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# 检查 .env.production 文件
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ 缺少 $ENV_FILE 文件"
  echo "   请参考 .env.production.example 创建并填写真实值"
  exit 1
fi

echo "🚀 开始部署..."

# 拉取最新镜像（使用 ghcr.io 镜像时）
# docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull

# 构建并启动
echo "📦 构建镜像..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build

echo "🔄 重启服务..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# 等待健康检查
echo "⏳ 等待服务就绪..."
sleep 5

# 验证
if curl -sf http://localhost/api/v1/health > /dev/null 2>&1; then
  echo "✅ 部署成功！"
else
  echo "⚠️  后端健康检查未通过，请检查日志: docker compose -f $COMPOSE_FILE logs backend"
fi

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f

echo "📋 当前状态:"
docker compose -f "$COMPOSE_FILE" ps
