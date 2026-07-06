# IonicJianBlog

一个简陋的个人博客。

## 技术栈

**前端**：Vite + React 18 + TypeScript + Tailwind CSS v4 + Zustand + React Router v6

- Markdown 渲染：react-markdown + remark-gfm + Shiki 代码高亮
- 图片灯箱：yet-another-react-lightbox
- 图标：Phosphor Icons

**后端**：Go 1.22+ + Gin + pgx v5

- JWT 双 token 认证（access 15min + refresh 7d 轮转）
- bcrypt 密码哈希、GitHub OAuth、限流中间件
- Markdown → HTML：goldmark
- 图片处理：imaging（上传重编码为 JPEG，UUID 文件名）

**数据库**：PostgreSQL 16（全文检索 to_tsvector + pg_trgm）

**运维**：Docker Compose 编排、GitHub Actions CI/CD（runner 构建，VPS 仅拉镜像运行）

## 功能

### 认证与用户

- 邮箱注册 / 登录
- GitHub 第三方登录（OAuth + 一次性 code 交换，token 不进 URL）
- 头像上传（自动压缩 256×256）
- JWT refresh token 轮转 + 登出吊销

### 博客

- Markdown 写作，实时预览
- 代码块语法高亮 + 复制按钮
- 博客详情页目录（TOC）自动追踪滚动
- 图片点击放大灯箱
- 全文检索（PostgreSQL FTS + ILIKE 兜底）
- 置顶博客、热度排行榜
- 草稿 / 发布状态（权限隔离，草稿仅作者与管理员可见）
- 嵌套分类、多标签筛选

### 互动

- 博客评论与评论点赞
- 楼中楼回复
- 划线引用评论（选中正文 → 引用按钮 → 跳转评论框）
- 博客点赞（乐观更新）
- 留言板（登录可匿名留言）
- 友情链接管理

### AI 自动化

- 博客内容一句话摘要（自动生成）
- GitHub Trending 仓库自动解读
- AI 摘要定时刷新

### 管理后台

- 仪表盘
- 博客 / 分类 / 标签 / 评论 / 留言 / 友链 / 摄影管理
- 前端 admin 守卫 + 后端 RequireAdmin 双重校验

### 设计

- 玻璃拟态（backdrop-filter blur）
- 暗色 / 亮色模式切换（localStorage 持久化）
- 响应式布局（移动端 / 平板 / 桌面）
- 页面切换动画、滚动稳定（scrollbar-gutter）

## 项目结构

```
blog/
├── backend/          # Go + Gin 后端（handler → service → repository 分层）
├── frontend/         # Vite + React 前端
├── deploy/           # 极简 Dockerfile + docker-compose（VPS 部署）
├── docs/             # 项目文档（实现、测试、部署、审查记录）
├── scripts/          # 运维脚本（备份、部署、启停）
└── start.sh          # 一键启动
```
