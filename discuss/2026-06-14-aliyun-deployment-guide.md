# 阿里云 ECS 部署全流程指南

## 整体架构

```
用户浏览器 → ECS (公网IP) → Docker Compose
                              ├── frontend (nginx:80)  — 入口，反向代理 /api/ 到 backend
                              ├── backend (Go:8080)    — 仅内网可达
                              └── postgres (5432)      — 仅内网可达
```

## 第一步：购买阿里云 ECS

### 推荐配置（个人博客够用）

| 项目 | 推荐 |
|------|------|
| 实例规格 | 2 vCPU / 2 GB 内存（ecs.t6 或 ecs.e 系列） |
| 系统盘 | 40 GB 高效云盘 |
| 镜像 | Ubuntu 24.04 LTS |
| 带宽 | 按量计费，1-3 Mbps |
| 地域 | 离你最近的（如华东1·杭州） |
| 购买时长 | 先买 1 个月测试，后续按年更便宜 |

> **省钱技巧**：新用户有大幅折扣，先去 https://free.aliyun.com 看有没有免费试用额度。

### 安全组配置（非常重要！）

购买时或购买后在 ECS 控制台 → 安全组 → 配置规则，添加：

| 方向 | 端口 | 来源 | 用途 |
|------|------|------|------|
| 入方向 | 22 | 你的 IP/0.0.0.0 | SSH 登录 |
| 入方向 | 80 | 0.0.0.0/0 | HTTP 网站 |
| 入方向 | 443 | 0.0.0.0/0 | HTTPS（等有域名后再加） |

> **安全建议**：22 端口尽量限制为你的家庭/公司 IP 而非 0.0.0.0

---

## 第二步：连接服务器并初始化

```bash
# SSH 登录（用阿里云控制台提供的公网 IP）
ssh root@<你的公网IP>

# 更新系统
apt update && apt upgrade -y

# 安装基础工具
apt install -y curl git vim ufw

# 配置防火墙（可选，安全组已做第一层防护）
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 第三步：安装 Docker

```bash
# 官方安装脚本
curl -fsSL https://get.docker.com | bash

# 将当前用户加入 docker 组（避免每次 sudo）
usermod -aG docker $USER

# 安装 Docker Compose 插件
apt install -y docker-compose-plugin

# 验证
docker --version
docker compose version

# 设置 Docker 开机自启
systemctl enable docker
```

---

## 第四步：克隆项目并配置

```bash
# 创建工作目录
mkdir -p /opt
cd /opt

# 克隆仓库
git clone git@github.com:IonicJian/IonicJianBlog.git blog
cd blog

# 切换到 main 分支（如果还不是）
git checkout main
```

### 配置环境变量

```bash
# 创建生产环境变量文件
cp .env.production.example .env.production

# 编辑，填入真实值
vim .env.production
```

**最小必填配置**：
```ini
# 用 openssl rand -base64 64 生成
POSTGRES_PASSWORD=<强随机密码>
JWT_SECRET=<强随机字符串>
ADMIN_PASSWORD=<管理员密码>

# 可选：GitHub OAuth（在 GitHub Settings → Developer settings 创建 OAuth App）
# GITHUB_CLIENT_ID=xxx
# GITHUB_CLIENT_SECRET=xxx
# GITHUB_REDIRECT_URL=http://<公网IP>/api/v1/auth/github/callback

# 可选：AI 摘要
# AI_API_KEY=sk-xxx
```

---

## 第五步：启动服务

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 验证
curl http://localhost/api/v1/health
# → {"code":0,"message":"success","data":{"status":"ok"}}
```

浏览器访问 `http://<公网IP>` 应该能看到博客首页。

---

## 第六步（等有域名后）：域名与 DNS

1. **购买域名**：阿里云万网 https://wanwang.aliyun.com
2. **DNS 解析**：在域名控制台添加 A 记录，指向 ECS 公网 IP
   ```
   主机记录: @    记录类型: A    记录值: <公网IP>
   主机记录: www  记录类型: A    记录值: <公网IP>
   ```
3. **DNS 生效**：通常 10 分钟—2 小时

---

## 第七步（等有域名后）：HTTPS 配置

### 方案：Caddy 反代（推荐，自动 HTTPS）

在宿主机上安装 Caddy，让它作为入口处理 HTTPS：

```bash
# 安装 Caddy
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# 编辑 Caddyfile
vim /etc/caddy/Caddyfile
```

`/etc/caddy/Caddyfile`：
```
your-domain.com, www.your-domain.com {
    reverse_proxy localhost:80
}
```

```bash
# 启动 Caddy
systemctl enable caddy
systemctl start caddy
```

Caddy 会自动申请 Let's Encrypt 证书并配置 HTTPS 重定向。

---

## 第八步：CI/CD 自动部署

当 VPS 和 GitHub Actions 打通后：

### 8.1 在服务器上创建部署用户

```bash
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# 生成 SSH 密钥对（在服务器上）
su - deploy
ssh-keygen -t ed25519 -C "github-actions-deploy"
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519   # 复制私钥，存入 GitHub Secrets
```

### 8.2 设置 GitHub Secrets

在 GitHub 仓库 → Settings → Secrets and variables → Actions 添加：

| Secret | 值 |
|--------|-----|
| `DEPLOY_HOST` | ECS 公网 IP |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | 上一步复制的私钥内容 |

### 8.3 取消 `.github/workflows/ci.yml` 中 deploy 的注释

```yaml
deploy:
  name: Deploy to VPS
  needs: [docker]
  if: github.ref == 'refs/heads/main'
  ...
```

之后每次 push 到 main，CI 会自动构建镜像 → 推送 ghcr.io → SSH 到服务器拉取并重启。

---

## 日常运维

```bash
# 查看服务状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f --tail=100 backend

# 重启
docker compose -f docker-compose.prod.yml restart

# 更新（CI 自动部署时不需要手动操作）
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# 备份数据库
bash scripts/db-backup.sh

# 清理旧镜像
docker image prune -a -f
```

---

## 费用估算

| 项目 | 月费（约） |
|------|-----------|
| ECS 2C2G | ¥50-70 |
| 系统盘 40GB | ¥14 |
| 域名（年付折算月） | ¥5-8 |
| **合计** | **~¥70-90/月** |

> 新用户首年 ECS 通常有 3-5 折优惠，实际可能更低。

---

## 附：当前状态检查清单

- [x] 代码已推送到 GitHub（`IonicJian/IonicJianBlog`）
- [x] `docker-compose.prod.yml` 已就绪
- [x] `.env.production.example` 模板已就绪
- [x] GitHub Actions CI/CD 已配置（lint + build + docker push）
- [ ] 购买阿里云 ECS
- [ ] 服务器初始化（Docker 安装）
- [ ] `.env.production` 配置生产密钥
- [ ] 启动生产服务
- [ ] 购买域名（可选）
- [ ] HTTPS 配置（可选）
- [ ] GitHub Secrets 配置 + 启用自动部署
