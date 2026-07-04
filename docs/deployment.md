# 部署与运维（Agent 参考）

## 服务器

```
112.124.8.162 (阿里云 ECS 杭州)
ecs.e-c1m1.large  2C2G  Ubuntu 26.04  40GB ESSD Entry
带宽：按流量 0.8元/GB
SSH：root@112.124.8.162（本地 ~/.ssh/id_ed25519 已配，无密码登录）
```

安全组已开放：22、80。入方向 0.0.0.0/0。

## VPS 现有环境

- Docker + docker compose 插件已安装
- `/etc/docker/daemon.json` → mirror 指向 `docker.1ms.run` 和 `docker.xuanyuan.me`
- 部署位于 `/opt/deploy/`，结构：

```
/opt/deploy/
├── .env                          # 环境变量（不入库）
├── docker-compose.yml            # 来自仓库 deploy/docker-compose.yml
├── backend/
│   ├── Dockerfile                # FROM alpine → COPY blog-server → CMD
│   └── blog-server               # CI 构建的 Go 二进制
└── frontend/
    ├── Dockerfile                # FROM nginx:alpine → COPY dist + nginx.conf
    ├── nginx.conf
    └── dist/                     # CI 构建的前端产物
```

## 关键约束

部署时必须遵守以下规则，否则会失败：

1. **不在 VPS 上编译** — 2GB 内存不可同时跑 `go build` 和 `npm build`
2. **不在 VPS 上 go mod download / npm ci** — 网络不稳且内存不足
3. **DockerHub 拉取可能极慢** — 基础镜像（alpine:3.21、nginx:alpine、postgres:16-alpine）已在 VPS 缓存，不要清掉
4. **不使用 docker-compose.prod.yml** — 那是旧方案（Docker 内编译），用 `/opt/deploy/docker-compose.yml`
5. **部署用 deploy/ 目录下的极简 Dockerfile** — Dockerfile 不含编译步骤，只 COPY 预构建产物

## CI/CD

文件：`.github/workflows/ci.yml`

触发：
- push main → backend-lint + frontend-lint + deploy
- PR main → 只 lint，不 deploy

deploy job 做的事：
1. 在 GitHub runner 上 `go build` (linux/amd64) → deploy/backend/blog-server
2. 在 GitHub runner 上 `npm build` → frontend/dist/
3. 组装 deploy/ 目录，tar 打包
4. appleboy/scp-action → /tmp/deploy.tar.gz
5. appleboy/ssh-action → tar 解压到 /opt/deploy，docker compose down/build/up

需要的 GitHub Secrets（仓库级）：
- DEPLOY_HOST=112.124.8.162
- DEPLOY_USER=deploy
- DEPLOY_SSH_KEY=deploy 用户的 SSH 私钥

## VPS deploy 用户

需在 VPS 上存在 deploy 用户，加入 docker 组，其 ~/.ssh/authorized_keys 有对应公钥。创建方式：

```bash
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
su - deploy
ssh-keygen -t ed25519 -N "" -C "github-actions"
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 环境变量（.env）

```ini
POSTGRES_PASSWORD=<随机>
JWT_SECRET=<随机>
ADMIN_PASSWORD=<管理员密码>
```

## 运维命令

```bash
cd /opt/deploy

# 查看状态
docker compose ps
docker compose logs -f backend

# 重启
docker compose restart

# 完全重建
docker compose build --no-cache && docker compose up -d

# 数据库备份
docker exec blog-postgres pg_dump -U blog_user blog | gzip > backup_$(date +%Y%m%d).sql.gz

# 验证
curl -s http://localhost/api/v1/health
```

## 本地开发

```
后端 :8080  前端 :5173  bash start.sh 启动
PostgreSQL：blog_user / blog_password / blog
管理员：745559127lzj@gmail.com / youknow123LZJ（在 backend/.env）
```

### 本地数据库连接

```bash
PGPASSWORD=blog_password psql -h localhost -U blog_user -d blog
```

### 数据库迁移（本地 → VPS）

```bash
# 本地导出
PGPASSWORD=blog_password pg_dump -h localhost -U blog_user blog --no-owner | gzip > dump.sql.gz
# 上传
scp dump.sql.gz root@112.124.8.162:/tmp/
# VPS 导入（先停掉后端避免冲突）
ssh root@112.124.8.162 "gunzip -c /tmp/dump.sql.gz | docker exec -i blog-postgres psql -U blog_user blog"
```

### 本地构建并手动部署（CI 不通时）

```bash
# 本地构建
cd backend && CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /tmp/blog-server ./cmd/server
cd ../frontend && npm run build

# 组装
cp /tmp/blog-server /tmp/deploy/backend/
cp -r dist /tmp/deploy/frontend/
cp nginx.conf /tmp/deploy/frontend/

# 上传并重启
scp -r /tmp/deploy root@112.124.8.162:/tmp/
ssh root@112.124.8.162 "cp -r /tmp/deploy/* /opt/deploy/ && cd /opt/deploy && docker compose down && docker compose build --no-cache && docker compose up -d"
```

## git push GFW 问题

本机 SSH 到 GitHub 可能被 GFW 干扰。备用方案：

1. HTTPS 方式（需配 credential helper）：`git remote set-url origin https://github.com/IonicJian/IonicJianBlog.git`
2. 或通过 GitHub MCP `push_files` 工具直接推文件，不走 git

## GitHub OAuth

本地 callback：`http://localhost:8080/api/v1/auth/github/callback`
VPS callback：`http://112.124.8.162/api/v1/auth/github/callback`
GitHub OAuth App 设置中两者都需在允许列表，否则 VPS 上登录失败。

## 常见坑

| 现象 | 原因 | 修复 |
|------|------|------|
| Docker build 计时器卡住 | apk 从 dl-cdn.alpinelinux.org 拉取极慢 | Dockerfile 加 `sed -i 's/dl-cdn/mirrors.aliyun/g' /etc/apk/repositories` |
| Docker compose build OOM killed | 2GB 不够同时 go build + npm build | 不在 VPS 编译，用 deploy/ 下的极简 Dockerfile |
| 502 Bad Gateway | nginx 未收到外部请求 / nginx 内部 DNS 不通 | `curl -s --noproxy '*' http://IP` 绕过代理测试 |
| 网站能开但 API 全挂 | 前端 JS baseURL 配错 | 确认 `client.ts` baseURL 是 `/api/v1` 相对路径 |
| 外部访问超时 | 安全组没放 80 端口 | 阿里云控制台添加入方向规则
