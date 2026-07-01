# 部署与运维指南

## 架构概览

```
GitHub                         阿里云 ECS (杭州)
┌─────────────┐               ┌────────────────────────┐
│ main 分支    │               │ Docker Compose          │
│    │        │               │                        │
│    ▼        │   SSH:22      │  frontend (nginx:80)    │
│ CI/CD       │──────────────▶│    │ /api/*             │
│ 1. lint     │   scp 构建产物  │    ▼                    │
│ 2. build    │               │  backend (Go:8080)      │
│ 3. deploy   │               │    │                    │
└─────────────┘               │    ▼                    │
                              │  postgres (5432)        │
                              │                        │
                              │  volumes:               │
                              │  - postgres_data        │
                              │  - uploads_data         │
                              └────────────────────────┘
```

## 服务器配置

### 阿里云 ECS

| 配置项 | 规格 |
|--------|------|
| 实例类型 | ecs.e-c1m1.large (2C2G) |
| 镜像 | Ubuntu 26.04 |
| 系统盘 | ESSD Entry 40GB |
| 地域 | 华东1（杭州） |
| 带宽 | 按使用流量，0.8 元/GB |

### 安全组

| 方向 | 端口 | 来源 | 用途 |
|------|------|------|------|
| 入 | 22 | 0.0.0.0/0 | SSH |
| 入 | 80 | 0.0.0.0/0 | HTTP |
| 入 | 443 | 0.0.0.0/0 | HTTPS（预留） |

### 初始配置

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Docker
apt install -y curl gnupg ca-certificates
mkdir -p /etc/apt/keyrings
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | \
  gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker 镜像加速
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
EOF
systemctl enable docker --now
```

---

## CI/CD 流程

### 触发条件

- **push 到 main**：触发完整流程（lint → build → deploy）
- **PR 到 main**：仅 lint（不部署）

### Job 详解

#### backend-lint
```
Go 1.26 → go vet ./... → go build ./...
```

#### frontend-lint
```
Node 24 → npm ci → tsc --noEmit → eslint → vite build
```

#### deploy（仅 main 分支 push）
1. 编译 Go 二进制（linux/amd64，已 strip 调试符号，约 27MB）
2. 编译前端（npm run build → dist/）
3. 打包为 tar.gz
4. SCP 传输到 VPS 的 /tmp/
5. SSH 到 VPS 执行：
   - 解压到 /opt/deploy/
   - `docker compose down`
   - `docker compose build --no-cache`
   - `docker compose up -d`
   - `docker image prune -f`
   - 健康检查验证

### GitHub Secrets

| 名称 | 说明 |
|------|------|
| `DEPLOY_HOST` | VPS 公网 IP |
| `DEPLOY_USER` | SSH 用户（deploy） |
| `DEPLOY_SSH_KEY` | deploy 用户的 SSH 私钥 |

---

## 部署架构详解

### 目录结构（VPS）

```
/opt/deploy/
├── docker-compose.yml    # 生产编排（从仓库 deploy/ 目录同步）
├── .env                  # 环境变量（本地创建，不入库）
├── backend/
│   ├── Dockerfile        # 极简 Dockerfile（仅 COPY，不编译）
│   └── blog-server       # Go 二进制（由 CI 构建并传入）
└── frontend/
    ├── Dockerfile        # 极简 Dockerfile（仅 COPY，不编译）
    ├── dist/             # 前端构建产物（由 CI 构建并传入）
    └── nginx.conf
```

### 为什么不在 VPS 上编译

- **内存不足**：2GB RAM 无法同时编译 Go + 前端（Node.js）
- **网络限制**：Docker Hub 和 Go 模块镜像可能不稳定
- **速度慢**：e 实例 CPU 性能有限，编译缓慢

解决方案：GitHub Actions 的云 runner 完成所有编译，VPS 只负责运行。

### Docker Compose 服务

```
postgres (16-alpine)
  - 数据库：blog，用户：blog_user
  - 持久化：postgres_data 卷
  - 健康检查：pg_isready
  - 不暴露端口到宿主机

backend (alpine:3.21)
  - 从 deploy/backend/Dockerfile 构建
  - COPY 预编译的 Go 二进制
  - 自动运行数据库迁移
  - 健康检查：curl /api/v1/health
  - 不暴露端口到宿主机

frontend (nginx:alpine)
  - 从 deploy/frontend/Dockerfile 构建
  - COPY 预编译的 dist/
  - 反向代理 /api/ → backend:8080
  - SPA 回退（try_files → index.html）
  - 暴露 80 端口
```

### 数据持久化

| 卷 | 内容 | 备份方式 |
|----|------|----------|
| postgres_data | 数据库 | `bash scripts/db-backup.sh` |
| uploads_data | 头像、博客图片 | scp 到本地备份 |

---

## 日常运维

### 环境变量配置

`.env` 文件包含以下必填项：

```ini
POSTGRES_PASSWORD=<强密码>
JWT_SECRET=<强随机密钥>
ADMIN_PASSWORD=<管理员密码>
```

### 手动部署

```bash
cd /opt/deploy
docker compose build --no-cache
docker compose up -d
docker compose ps
docker compose logs -f --tail=50 backend
```

### 查看状态

```bash
cd /opt/deploy
docker compose ps
docker compose logs backend   # 后端日志
docker compose logs frontend  # 前端日志
```

### 重启服务

```bash
cd /opt/deploy
docker compose restart        # 快速重启
docker compose up -d --force-recreate  # 完整重建
```

### 数据库备份

```bash
docker exec blog-postgres pg_dump -U blog_user blog | gzip > blog_backup_$(date +%Y%m%d).sql.gz
```

### 数据库恢复（不覆盖 uploads）

```bash
gunzip -c blog_backup_YYYYMMDD.sql.gz | docker exec -i blog-postgres psql -U blog_user blog
```

### 查看资源使用

```bash
docker stats
```

---

## 未来扩展

### 域名 + HTTPS

有域名后，在 DNS 添加 A 记录指向 VPS IP，然后在 VPS 上安装 Caddy：

```bash
apt install -y caddy
cat > /etc/caddy/Caddyfile << 'CADDY'
your-domain.com {
    reverse_proxy localhost:80
}
CADDY
systemctl restart caddy
```

Caddy 自动申请 Let's Encrypt 证书，无需手动配置 HTTPS。

### CDN 加速

业务流量上涨后，可接入阿里云 CDN 加速静态资源：`/assets/` 路径设置长缓存。

### 日志收集

将 Docker 日志接入阿里云 SLS 或自建 Loki 做集中查看和告警。
