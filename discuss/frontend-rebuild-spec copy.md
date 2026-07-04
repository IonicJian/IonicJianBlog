# 前端重建规格（功能说明）

> 用途：整个 frontend 删除后照此重建。功能不得丢失。
> 布局与视觉设计方案见 `design.md`（独立，参照 Tailwind 官网，按 Google stitches 规范写）。

---

## 一、重建目标

- 删除现有 frontend/src 全部代码，从零重建。
- 保留所有功能（路由、页面能力、API 对接、状态管理）。
- 布局与视觉完全重设计，不保留任何原设计元素。方案见 `design.md`。

---

## 二、前端功能说明

### 2.1 路由

| 路径 | 页面 | 鉴权 |
|---|---|---|
| `/` | HomePage | 公开 |
| `/blogs` | BlogListPage | 公开 |
| `/blogs/:id` | BlogDetailPage | 公开（可选登录） |
| `/blogs/create` | BlogCreatePage | admin |
| `/blogs/:id/edit` | BlogEditPage | admin |
| `/login` | LoginPage | 公开 |
| `/register` | RegisterPage | 公开 |
| `/friends` | FriendLinksPage | 公开 |
| `/trending` | TrendingPage | 公开 |
| `/guestbook` | GuestbookPage | 公开 |
| `/photography` | PhotographyPage | 公开 |
| `/auth/callback` | OAuthCallbackPage | 公开 |
| `*` | NotFoundPage | 公开 |

所有页面共用 Layout（Header + main + Footer）。Outlet 渲染子路由。

### 2.2 页面功能

**HomePage `/`**
- 从 `GET /site/owner` 取站长信息（display_name、avatar_url、bio）。
- Hero：站长名字 + 简介 + CTA「开始阅读 →」跳 `/blogs`。
- 最新文章：`GET /blogs?page=1&page_size=6&sort=latest`，6 篇卡片网格。
- 无文章时显示占位卡片（标注 mock，不伪装真实数据）。
- 摄影作品区：照片卡片网格（统一比例裁切），查看全部跳 `/photography`。

**BlogListPage `/blogs`**
- 搜索：输入触发 `GET /blogs/search?q=...`。
- 侧栏筛选：
  - 排序：最新（latest）/ 推荐（popular）。
  - 分类：`GET /categories` 树形单选。
  - 标签：`GET /tags` 多选（逗号拼接 tag 参数）。
- 列表：`GET /blogs?page&size&tag&category&sort`，卡片网格。
- 分页：page_size=10。

**BlogDetailPage `/blogs/:id`**
- `GET /blogs/:id` 取文章。
- 增量浏览：`POST /blogs/:id/view`，sessionStorage key 去重（每篇每会话一次）。
- 渲染：MarkdownRenderer（react-markdown + remark-gfm + 代码高亮）。
- 图片点击：打开 Lightbox（yet-another-react-lightbox）。
- 目录：TableOfContents，解析 markdown 标题，左侧粘性，IntersectionObserver 滚动追踪。
- 文本选中引用：选中正文文字 → 出现 quote 图标 → 点击跳到底部评论框，带 anchorStart（段落 data-p-id）+ anchorText。
- 点赞：LikeButton（乐观更新），`POST /blogs/:id/like`，登录态 `GET /blogs/:id/like/status`。
- 评论：CommentList（`GET /blogs/:id/comments`）+ CommentForm（`POST /blogs/:id/comments`，登录必需）+ 删除（`DELETE /comments/:id`，owner/admin）。
- admin：显示「编辑」链接跳 `/blogs/:id/edit`。

**BlogCreatePage `/blogs/create`**（admin）
- MDEditor（@uiw/react-md-editor）+ 预览。
- 字段：标题、内容、状态（draft/published）、分类（选择或新建）、标签（多选或新建带颜色）。
- 创建分类：`POST /categories`（inline，可选 parent_id）。
- 创建标签：`POST /tags`（带颜色）。
- 图片上传：`POST /upload/image`，插入 `![]()` markdown。
- 保存：`POST /blogs`。

**BlogEditPage `/blogs/:id/edit`**（admin）
- 预填 `GET /blogs/:id`。
- 同 Create 字段。
- 保存：`PUT /blogs/:id`。
- 删除：确认后 `DELETE /blogs/:id`，跳 `/blogs`。

**LoginPage `/login`**
- 邮箱 + 密码登录：`POST /auth/login`，存 token。
- GitHub OAuth：跳 `GET /auth/github`。
- 错误提示。
- 登录成功跳首页。

**RegisterPage `/register`**
- 用户名 + 邮箱 + 密码：`POST /auth/register`。
- 注册成功跳登录或自动登录。

**OAuthCallbackPage `/auth/callback`**
- 处理 GitHub OAuth 回调（query token），存 token，跳首页。

**FriendLinksPage `/friends`**
- 列表：`GET /friend-links`，卡片网格（名称、描述、头像、URL）。
- admin：内联表单增/改/删（`POST`/`PUT`/`DELETE /friend-links/:id`）。

**TrendingPage `/trending`**
- `GET /trending/github`（后端缓存 1h），repo 列表（名称、描述、star、fork、语言）。

**GuestbookPage `/guestbook`**
- 列表：`GET /guestbook?page=N`，分页。
- 发留言：登录必需，可选匿名 checkbox，`POST /guestbook`。
- 删除：`DELETE /guestbook/:id`（owner/admin）。

**PhotographyPage `/photography`**
- 摄影作品卡片网格，照片裁切成统一比例。
- 点击照片放大（Lightbox）。
- 数据源待定（本地静态资源或后端 API，后续确定）。
- 具体布局后续细化。

**NotFoundPage `*`**
- 404 提示 + 回首页链接。

### 2.3 状态管理（Zustand）

**authStore**
- 字段：user、accessToken、refreshToken、isAuthenticated。
- 动作：login、register、logout、refreshSession、fetchProfile、setUser。
- init：启动时从 localStorage 恢复 token，fetchProfile。

**uiStore**
- 字段：theme（light/dark）。
- 动作：setTheme、toggleTheme、initTheme。
- 主题切换：`document.documentElement.classList.toggle('dark')`。
- localStorage 持久化。

### 2.4 API 端点（base `/api/v1`）

所有响应：`{ code, message, data }`，code=0 成功。

| 模块 | 端点 |
|---|---|
| 认证 | `POST /auth/register` `POST /auth/login` `POST /auth/refresh` `POST /auth/logout` `GET /auth/github` `GET /auth/github/callback` |
| 用户 | `GET /users/me` `PUT /users/me` `POST /users/me/avatar/upload`（multipart） |
| 博客 | `GET /blogs` `POST /blogs` `GET /blogs/:id` `PUT /blogs/:id` `DELETE /blogs/:id` `GET /blogs/slug/:slug` `GET /blogs/search` `GET /blogs/top` `POST /blogs/:id/view` `POST /blogs/:id/summary` |
| 评论 | `GET /blogs/:id/comments` `POST /blogs/:id/comments` `DELETE /comments/:id` |
| 点赞 | `POST /blogs/:id/like` `POST /comments/:id/like` `GET /blogs/:id/like/status` `GET /comments/:id/like/status` |
| 标签 | `GET /tags` `POST /tags` `PUT /tags/:id` `DELETE /tags/:id` |
| 分类 | `GET /categories`（返回嵌套树） `POST /categories` `PUT /categories/:id` `DELETE /categories/:id` |
| 上传 | `POST /upload/image`（multipart） |
| 友链 | `GET /friend-links` `POST /friend-links` `PUT /friend-links/:id` `DELETE /friend-links/:id` |
| 留言板 | `GET /guestbook` `POST /guestbook` `DELETE /guestbook/:id` |
| Trending | `GET /trending/github` |
| 站点 | `GET /site/owner` |

Axios client：
- baseURL `/api/v1`（Vite proxy 到 :8080）。
- 401 自动 refresh（`POST /auth/refresh`），失败跳登录。
- FormData 请求自动移除 Content-Type。
- `/uploads` 也 proxy 到 :8080。

### 2.5 组件清单

**layout**
- Layout：容器、Header、Footer、Outlet。
- Header：logo + 导航 + 主题切换 + 登录/UserMenu + 移动端菜单。
- Footer：版权。
- UserMenu：头像 + 上传头像 + 登出（DropdownMenu）。

**common**
- MarkdownRenderer：react-markdown + remark-gfm + 代码高亮 + 图片点击 + 段落 data-p-id（供引用定位）+ 标题 id（供 TOC）。
- BlogCard：卡片（标题、摘要、分类、置顶、日期、阅读箭头）。
- Icons：图标。
- Lightbox：yet-another-react-lightbox 包装。
- ImageUploadButton：上传图片插入 markdown。
- TableOfContents：解析 markdown 标题 + 滚动追踪。

**comment**
- CommentList：评论树（嵌套回复）。
- CommentItem：单条评论 + 删除 + 点赞 + 回复。
- CommentForm：评论输入（支持引用 quote）。

**like**
- LikeButton：乐观更新点赞。

---

## 三、约束（硬性）

- 代码不留元数据注释（`// ponytail:`、`// taste:`、`// generated by` 等）。
- 不传图片给 API（会毁项目）。
- 提交信息英文 `type(scope): description`，Co-Authored-By Claude。
- 文件不超 300 行（TS/TSX），文件夹不超 8 个文件。
- 严禁 commonjs，用 ESM。
- 数据结构强类型，不用 any（必要时先问）。
- 提交前 `npx tsc --noEmit` + `npx vite build` 通过。
