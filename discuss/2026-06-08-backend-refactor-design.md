# 后端代码重构设计方案

## 目标

按 Code Architecture 要求对后端进行全面重构，确保简洁、安全、无逻辑漏洞。

## 一、目录结构重组（方案 B：子目录分组）

handler/ service/ repository/ 三层统一采用领域子目录分组：

```
backend/internal/
├── config/config.go
├── model/models.go
├── dto/
│   ├── request/            # 4个文件 (不变)
│   ├── response/           # 5个文件 (不变)
│   └── mapper/mapper.go    # 🆕 模型→响应转换集中化
├── handler/                # 6个子目录 (原11个平铺文件)
│   ├── auth/auth_handler.go
│   ├── blog/blog_handler.go, upload_handler.go
│   ├── content/tag_handler.go, category_handler.go, friend_link_handler.go
│   ├── social/comment_handler.go, like_handler.go, guestbook_handler.go
│   ├── user/user_handler.go
│   └── trending/trending_handler.go
├── service/                # 5个子目录 (原8个平铺文件)
│   ├── auth/auth_service.go
│   ├── blog/blog_service.go
│   ├── content/tag_service.go, category_service.go, friend_link_service.go
│   ├── social/comment_service.go, like_service.go, guestbook_service.go
│   └── trending/trending_service.go
├── repository/             # 4个子目录 (原8个平铺文件, trending无需repo)
│   ├── user/user_repo.go
│   ├── blog/blog_repo.go
│   ├── content/tag_repo.go, category_repo.go, friend_link_repo.go
│   └── social/comment_repo.go, like_repo.go, guestbook_repo.go
├── middleware/
│   ├── auth.go, cors.go, logger.go, ratelimit.go, recovery.go  # 🆕 ratelimit.go
├── pkg/
│   ├── jwt/jwt.go, password/bcrypt.go, pagination/pagination.go
│   ├── markdown/render.go, response/response.go
│   └── slug/slug.go        # 🆕 统一slug生成
└── router/router.go
```

所有目录条目数 ≤ 5，所有 Go 文件 ≤ 400 行。满足硬性指标。

## 二、消除代码坏味道

### 2.1 冗余：统一 Slug 生成 (pkg/slug/slug.go)

消除 `blog_service.go:generateSlug`、`tag_service.go:tagSlug`、`category_service.go:catSlug` 三处重复。
统一为 `slug.Generate(title string) string`。

### 2.2 冗余：集中化模型转换 (dto/mapper/mapper.go)

将散落在各 handler 中的 `toXxxResponse` 函数集中管理：
- `UserToResponse`
- `BlogToListResponse`/`BlogToDetailResponse`
- `CommentToResponse`
- `TagToResponse`
- `CategoryToResponse`

### 2.3 冗余：BlogRepo GetByID/GetBySlug 提取共用方法

两段 ~30 行几乎相同的查询逻辑提取为 `getOne` 私有方法。

### 2.4 晦涩：统一错误消息语言

全部改为英文。上传模块的中文错误消息统一为英文。

### 2.5 不必要复杂：优雅关闭 trending 定时刷新

`main.go` 中将 `for { time.Sleep }` 改为 `time.Ticker`，通过 context 取消。

### 2.6 晦涩：GitHub OAuth email 查询使用统一 HTTP client

`getGitHubUser` 中 email 查询改用 `githubHTTPClient` 而非 `http.DefaultClient`。

### 2.7 不必要复杂：清理无效桩代码

移除 `UserHandler.GetUser` 和 `AIHandler.GenerateSummary`/`GetSummary` 的 TODO 桩，或标记为显式返回 501 Not Implemented。

## 三、安全修复

### 3.1 评论/留言删除权限校验（高优）

CommentHandler.Delete 和 GuestbookHandler.Delete 增加所有权校验：
- 仅允许作者本人或管理员删除
- 非所有者返回 403 Forbidden
- CommentService 新增 GetByID 方法

### 3.2 速率限制（中优）

新增 `middleware/ratelimit.go`：
- 登录接口: 10次/分钟
- 注册接口: 5次/分钟
- 基于内存 token bucket 实现

### 3.3 OAuth State Cookie 安全加固（中优）

SetCookie 增加 Secure flag（生产环境），SameSite 使用 Lax 模式。

### 3.4 JWT Secret 必须配置（中优）

移除硬编码默认值 `"dev-secret-change-in-production"`。
`Load()` 中校验 JWT_SECRET 非空，缺失时返回错误。

## 四、逻辑漏洞修复

### 4.1 GetTop 使用 SQL 直接查询（高优）

从「拉取5条再过滤」改为 `WHERE is_top = true` SQL 直接查询，不遗漏任何置顶博客。

### 4.2 Search 透传 currentUserID（中优）

Search 方法签名增加 `currentUserID *int64`，透传至 GetByID，使搜索结果能显示 liked_by_me 状态。
Handler 层从 OptionalAuth 上下文获取 userID 传入。

### 4.3 Category Update 传递 parent_id（中优）

Handler 中将请求的 `parent_id` 字段传递给 service 层的 Update 方法。

### 4.4 IncrementView 服务端去重（低优）

基于 `blog_id + client_ip + date` 简单去重，使用 PostgreSQL 唯一约束或内存缓存。

## 五、验证标准

- `go build ./...` 编译通过
- `go vet ./...` 无警告
- 所有现有 API 行为保持不变
- 评论/留言删除需验证权限
- 速率限制在登录/注册端点生效
- GetTop 返回所有置顶博客（不只前5条）
- JWT_SECRET 缺失时启动报错
