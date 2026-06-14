# 后端代码完整重构 实施方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 Code Architecture 要求重构后端：重组目录结构、消除代码坏味道、修复安全漏洞和逻辑漏洞。

**Architecture:** 将 handler/ service/ repository/ 三层从平铺改为领域子目录分组（auth, blog, content, social, trending），提取共享代码到 pkg/slug 和 dto/mapper，新增速率限制中间件，修复评论/留言删除权限校验等安全漏洞。

**Tech Stack:** Go 1.22+, Gin, pgx v5, golang-jwt v5, zerolog

**Design Doc:** `discuss/2026-06-08-backend-refactor-design.md`

---

## 任务概览

| 阶段 | 任务 | 说明 |
|------|------|------|
| 1 | 新建共享包 | pkg/slug, dto/mapper, middleware/ratelimit |
| 2 | 安全修复 | 删除权限、速率限制、OAuth cookie、JWT校验 |
| 3 | Repository 重组 + Bug修复 | 子目录迁移、GetByID去重、GetTop SQL、Search透传 |
| 4 | Service 重组 + 去冗余 | 子目录迁移、使用 pkg/slug |
| 5 | Handler 重组 + 清理 | 子目录迁移、使用 dto/mapper、统一错误消息 |
| 6 | Router + main.go 更新 | 所有 import 更新、优雅关闭、速率限制路由 |
| 7 | 构建验证 | go build, go vet |

---

### Task 1: 新建 `pkg/slug/slug.go` — 统一 Slug 生成

**Files:**
- Create: `backend/internal/pkg/slug/slug.go`

- [ ] **Step 1: 创建 slug 包**

```go
// backend/internal/pkg/slug/slug.go
package slug

import (
	"regexp"
	"strings"
)

// Generate creates a URL-friendly slug from the given title.
func Generate(title string) string {
	s := strings.ToLower(title)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	s = re.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if s == "" {
		return "untitled"
	}
	return s
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /home/zanelin/repositories/blog/backend && go build ./internal/pkg/slug/
```

Expected: 编译成功

---

### Task 2: 新建 `dto/mapper/mapper.go` — 集中化模型转换

**Files:**
- Create: `backend/internal/dto/mapper/mapper.go`

- [ ] **Step 1: 创建 mapper 包，将所有 toXxxResponse 函数集中**

```go
// backend/internal/dto/mapper/mapper.go
package mapper

import (
	"github.com/zanelin/blog/internal/dto/response"
	"github.com/zanelin/blog/internal/model"
)

func UserToResponse(u *model.User) response.UserResponse {
	return response.UserResponse{
		ID:          u.ID,
		Username:    u.Username,
		Email:       u.Email,
		DisplayName: u.DisplayName,
		AvatarURL:   u.AvatarURL,
		Bio:         u.Bio,
		GithubID:    u.GithubID,
		Role:        u.Role,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}
}

func UserToSimpleResponse(u *model.User) *response.UserResponse {
	if u == nil {
		return nil
	}
	r := UserToResponse(u)
	return &r
}

func BlogToListResponse(b *model.Blog) response.BlogListResponse {
	r := response.BlogListResponse{
		ID:         b.ID,
		Title:      b.Title,
		Slug:       b.Slug,
		Excerpt:    b.Excerpt,
		CoverImage: b.CoverImage,
		Status:     b.Status,
		ViewCount:  b.ViewCount,
		IsTop:      b.IsTop,
		CategoryID: b.CategoryID,
		CreatedAt:  b.CreatedAt,
		UpdatedAt:  b.UpdatedAt,
		LikeCount:  b.LikeCount,
	}
	if b.Author != nil {
		u := UserToResponse(b.Author)
		r.Author = &u
	}
	if b.Tags != nil {
		for _, t := range b.Tags {
			r.Tags = append(r.Tags, &response.TagResponse{
				ID:        t.ID,
				Name:      t.Name,
				Slug:      t.Slug,
				Color:     t.Color,
				PostCount: t.PostCount,
				CreatedAt: t.CreatedAt,
			})
		}
	}
	return r
}

func BlogToDetailResponse(b *model.Blog) response.BlogResponse {
	r := response.BlogResponse{
		ID:          b.ID,
		UserID:      b.UserID,
		Title:       b.Title,
		Slug:        b.Slug,
		Content:     b.Content,
		ContentHTML: b.ContentHTML,
		Excerpt:     b.Excerpt,
		CoverImage:  b.CoverImage,
		Status:      b.Status,
		ViewCount:   b.ViewCount,
		IsTop:       b.IsTop,
		CategoryID:  b.CategoryID,
		CreatedAt:   b.CreatedAt,
		UpdatedAt:   b.UpdatedAt,
		LikeCount:   b.LikeCount,
		LikedByMe:   b.LikedByMe,
	}
	if b.Author != nil {
		u := UserToResponse(b.Author)
		r.Author = &u
	}
	if b.Tags != nil {
		for _, t := range b.Tags {
			r.Tags = append(r.Tags, &response.TagResponse{
				ID:        t.ID,
				Name:      t.Name,
				Slug:      t.Slug,
				Color:     t.Color,
				PostCount: t.PostCount,
				CreatedAt: t.CreatedAt,
			})
		}
	}
	return r
}

func CommentToResponse(c *model.Comment) *response.CommentResponse {
	r := &response.CommentResponse{
		ID:          c.ID,
		BlogID:      c.BlogID,
		UserID:      c.UserID,
		ParentID:    c.ParentID,
		Content:     c.Content,
		AnchorStart: c.AnchorStart,
		AnchorEnd:   c.AnchorEnd,
		AnchorText:  c.AnchorText,
		IsApproved:  c.IsApproved,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
		LikeCount:   c.LikeCount,
	}
	if c.Author != nil {
		r.Author = &response.UserResponse{
			ID:          c.Author.ID,
			Username:    c.Author.Username,
			DisplayName: c.Author.DisplayName,
			AvatarURL:   c.Author.AvatarURL,
		}
	}
	if c.Replies != nil {
		for _, reply := range c.Replies {
			r.Replies = append(r.Replies, CommentToResponse(reply))
		}
	}
	return r
}

func TagToResponse(t *model.Tag) *response.TagResponse {
	return &response.TagResponse{
		ID:        t.ID,
		Name:      t.Name,
		Slug:      t.Slug,
		Color:     t.Color,
		PostCount: t.PostCount,
		CreatedAt: t.CreatedAt,
	}
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /home/zanelin/repositories/blog/backend && go build ./internal/dto/mapper/
```

Expected: 编译成功

---

### Task 3: 新建 `middleware/ratelimit.go` — 速率限制中间件

**Files:**
- Create: `backend/internal/middleware/ratelimit.go`

- [ ] **Step 1: 创建速率限制中间件**

使用 token bucket 算法，基于 `golang.org/x/time/rate`：

```go
// backend/internal/middleware/ratelimit.go
package middleware

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen int64
}

type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	rate     rate.Limit
	burst    int
}

// RateLimit returns a middleware that limits requests per client IP.
// maxReqs: max requests allowed in the window
// window: the window duration (e.g., time.Minute)
// Note: burst = maxReqs, rate = maxReqs / window
func RateLimit(maxReqs int, ratePerSec float64) gin.HandlerFunc {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
		burst:    maxReqs,
		rate:     rate.Limit(ratePerSec),
	}

	return func(c *gin.Context) {
		ip := c.ClientIP()

		rl.mu.Lock()
		v, exists := rl.visitors[ip]
		if !exists {
			v = &visitor{limiter: rate.NewLimiter(rl.rate, rl.burst)}
			rl.visitors[ip] = v
		}
		rl.mu.Unlock()

		if !v.limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"code":    429,
				"message": "rate limit exceeded, please try again later",
			})
			return
		}
		c.Next()
	}
}
```

- [ ] **Step 2: 安装依赖**

```bash
cd /home/zanelin/repositories/blog/backend && go get golang.org/x/time/rate
```

- [ ] **Step 3: 验证编译**

```bash
cd /home/zanelin/repositories/blog/backend && go build ./internal/middleware/
```

Expected: 编译成功

---

### Task 4: 安全修复 — 评论和留言删除权限校验

**Files:**
- Modify: `backend/internal/repository/comment_repo.go` (新增 GetByID)
- Modify: `backend/internal/service/comment_service.go` (新增 GetByID 方法到接口)
- Modify: `backend/internal/handler/comment_handler.go` (Delete 增加权限校验)
- Modify: `backend/internal/service/guestbook_service.go` (新增 GetByID)
- Modify: `backend/internal/repository/guestbook_repo.go` (新增 GetByID)
- Modify: `backend/internal/handler/guestbook_handler.go` (Delete 增加权限校验)

- [ ] **Step 1: CommentRepo 接口和实现新增 GetByID**

```go
// 在 CommentRepository interface 中新增:
GetByID(ctx context.Context, id int64) (*model.Comment, error)

// 在 commentRepo 中新增实现:
func (r *commentRepo) GetByID(ctx context.Context, id int64) (*model.Comment, error) {
	c := &model.Comment{}
	err := r.db.QueryRow(ctx,
		`SELECT id, blog_id, user_id, parent_id, content,
		        anchor_start, anchor_end, anchor_text, is_approved, created_at, updated_at
		 FROM comments WHERE id=$1`, id,
	).Scan(&c.ID, &c.BlogID, &c.UserID, &c.ParentID, &c.Content,
		&c.AnchorStart, &c.AnchorEnd, &c.AnchorText, &c.IsApproved, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return c, nil
}
```

- [ ] **Step 2: CommentService 接口和实现新增 GetByID**

```go
// 在 CommentService interface 中新增:
GetByID(ctx context.Context, id int64) (*model.Comment, error)

// 实现:
func (s *commentService) GetByID(ctx context.Context, id int64) (*model.Comment, error) {
	return s.commentRepo.GetByID(ctx, id)
}
```

- [ ] **Step 3: CommentHandler.Delete 增加权限校验**

```go
func (h *CommentHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		resp.BadRequest(c, "invalid id")
		return
	}

	userID := c.GetInt64(middleware.ContextKeyUserID)
	role, _ := c.Get(middleware.ContextKeyRole)

	comment, err := h.commentService.GetByID(c.Request.Context(), id)
	if err != nil {
		resp.NotFound(c, "comment not found")
		return
	}
	if comment.UserID != userID && role != "admin" {
		resp.Forbidden(c, "you can only delete your own comments")
		return
	}

	if err := h.commentService.Delete(c.Request.Context(), id); err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, nil)
}
```

- [ ] **Step 4: GuestbookRepo 新增 GetByID，GuestbookService 新增 GetByID，Handler.Delete 增加权限校验**（同样模式）

**GuestbookRepo.GetByID:**
```go
func (r *guestbookRepo) GetByID(ctx context.Context, id int64) (*model.GuestbookMessage, error) {
	m := &model.GuestbookMessage{}
	err := r.db.QueryRow(ctx,
		`SELECT id, user_id, nickname, content, is_approved, created_at, updated_at
		 FROM guestbook_messages WHERE id=$1`, id,
	).Scan(&m.ID, &m.UserID, &m.Nickname, &m.Content, &m.IsApproved, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return m, nil
}
```

**GuestbookHandler.Delete 权限校验:** 留言可能匿名（UserID为nil），仅管理员和留言作者可删。

```go
func (h *GuestbookHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	userID, _ := c.Get(middleware.ContextKeyUserID)
	role, _ := c.Get(middleware.ContextKeyRole)

	msg, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		resp.NotFound(c, "message not found")
		return
	}
	// Only the author or admin can delete
	if msg.UserID != nil {
		if uid, ok := userID.(int64); !ok || (*msg.UserID != uid && role != "admin") {
			resp.Forbidden(c, "permission denied")
			return
		}
	} else if role != "admin" {
		resp.Forbidden(c, "permission denied")
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	resp.Success(c, nil)
}
```

- [ ] **Step 5: 验证编译**

```bash
cd /home/zanelin/repositories/blog/backend && go build ./...
```

Expected: 编译成功

---

### Task 5: 安全修复 — OAuth Cookie 安全 + JWT Secret 校验

**Files:**
- Modify: `backend/internal/handler/auth_handler.go` (GitHubLogin: 增加 Secure flag)
- Modify: `backend/internal/config/config.go` (JWT Secret 缺失时报错)

- [ ] **Step 1: OAuth State Cookie 安全加固**

```go
// auth_handler.go GitHubLogin 方法中，修改 SetCookie:
// 原: c.SetCookie("oauth_state", state, 600, "/", "", false, true)
// 改为: 根据运行环境决定 Secure flag
isProduction := h.cfg.Server.Mode == "release"
c.SetCookie("oauth_state", state, 600, "/", "", isProduction, true)
// SameSite 默认 Lax 模式由 go 1.22+ net/http 处理
```

- [ ] **Step 2: JWT Secret 缺失时启动报错**

```go
// config.go Load() 函数中，在 return 之前增加:
if cfg.JWT.Secret == "" || cfg.JWT.Secret == "dev-secret-change-in-production" {
	return nil, fmt.Errorf("JWT_SECRET is required and must not use the default value")
}
```

同时删除 `viper.SetDefault("JWT_SECRET", "dev-secret-change-in-production")` 这一行。

- [ ] **Step 3: 验证编译**

```bash
cd /home/zanelin/repositories/blog/backend && go build ./...
```

Expected: 编译成功

---

### Task 6: BlogRepo 修复 — GetByID/GetBySlug 去重 + GetTop SQL + Search 透传 + IncrementView 去重

**Files:**
- Modify: `backend/internal/repository/blog_repo.go`

- [ ] **Step 1: 提取 getOne 辅助方法，消除 GetByID/GetBySlug 重复**

```go
// 在 blogRepo 中新增私有方法:
func (r *blogRepo) getOne(ctx context.Context, whereClause string, whereArg interface{}, currentUserID *int64) (*model.Blog, error) {
	b := &model.Blog{}
	var likedByMe bool

	baseQuery := `SELECT b.id, b.user_id, b.title, b.slug, b.content, b.content_html, b.excerpt, b.cover_image,
		b.status, b.view_count, b.is_top, b.category_id, b.created_at, b.updated_at,
		COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='blog' AND target_id=b.id),0) AS like_count`

	if currentUserID != nil {
		q := baseQuery + `, EXISTS(SELECT 1 FROM likes WHERE target_type='blog' AND target_id=b.id AND user_id=$2) AS liked_by_me
		 FROM blogs b WHERE ` + whereClause
		err := r.db.QueryRow(ctx, q, whereArg, *currentUserID).Scan(
			&b.ID, &b.UserID, &b.Title, &b.Slug, &b.Content, &b.ContentHTML, &b.Excerpt, &b.CoverImage,
			&b.Status, &b.ViewCount, &b.IsTop, &b.CategoryID, &b.CreatedAt, &b.UpdatedAt, &b.LikeCount, &likedByMe)
		if err != nil { return nil, err }
		b.LikedByMe = likedByMe
	} else {
		q := baseQuery + ` FROM blogs b WHERE ` + whereClause
		err := r.db.QueryRow(ctx, q, whereArg).Scan(
			&b.ID, &b.UserID, &b.Title, &b.Slug, &b.Content, &b.ContentHTML, &b.Excerpt, &b.CoverImage,
			&b.Status, &b.ViewCount, &b.IsTop, &b.CategoryID, &b.CreatedAt, &b.UpdatedAt, &b.LikeCount)
		if err != nil { return nil, err }
	}
	return b, nil
}

// GetByID 简化为:
func (r *blogRepo) GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error) {
	return r.getOne(ctx, "b.id=$1", id, currentUserID)
}

// GetBySlug 简化为:
func (r *blogRepo) GetBySlug(ctx context.Context, slug string, currentUserID *int64) (*model.Blog, error) {
	return r.getOne(ctx, "b.slug=$1", slug, currentUserID)
}
```

- [ ] **Step 2: GetTop 改为 SQL 直接查询**

在 BlogRepository 接口新增 GetTop 方法：

```go
// BlogRepository interface 新增:
GetTop(ctx context.Context, limit int) ([]*model.Blog, error)

// 实现:
func (r *blogRepo) GetTop(ctx context.Context, limit int) ([]*model.Blog, error) {
	rows, err := r.db.Query(ctx,
		`SELECT b.id, b.user_id, b.title, b.slug, b.excerpt, b.cover_image,
		 b.status, b.view_count, b.is_top, b.category_id, b.created_at, b.updated_at,
		 COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='blog' AND target_id=b.id),0) AS like_count
		 FROM blogs b WHERE b.is_top = true AND b.status = 'published'
		 ORDER BY b.created_at DESC LIMIT $1`, limit)
	if err != nil { return nil, err }
	defer rows.Close()
	var blogs []*model.Blog
	for rows.Next() {
		b := &model.Blog{}
		var catID *int64
		if err := rows.Scan(&b.ID, &b.UserID, &b.Title, &b.Slug, &b.Excerpt, &b.CoverImage,
			&b.Status, &b.ViewCount, &b.IsTop, &catID, &b.CreatedAt, &b.UpdatedAt, &b.LikeCount); err != nil {
			return nil, err
		}
		b.CategoryID = catID
		blogs = append(blogs, b)
	}
	return blogs, nil
}
```

- [ ] **Step 3: Search 方法增加 currentUserID 参数**

修改 Search 签名：
```go
// 原: Search(ctx context.Context, query string, page, pageSize int) ([]*model.Blog, int64, error)
// 改为:
Search(ctx context.Context, query string, page, pageSize int, currentUserID *int64) ([]*model.Blog, int64, error)

// 内部调用 GetByID 时传入 currentUserID:
b, err := r.GetByID(ctx, id, currentUserID)
```

- [ ] **Step 4: IncrementView 增加服务端简单去重**

```go
func (r *blogRepo) IncrementViewCount(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "UPDATE blogs SET view_count=view_count+1 WHERE id=$1", id)
	return err
}
```
保持不变，但在 handler 层增加基于 session key 的简单去重校验（保持与前端 sessionStorage 一致的逻辑，服务端通过请求头中的临时标识做同日去重）。

实际实现：在 handler 的 IncrementView 中解析客户端传的 `X-View-Key` header，使用短时内存缓存做同日去重。

- [ ] **Step 5: 验证编译**

```bash
cd /home/zanelin/repositories/blog/backend && go build ./...
```

Expected: 编译成功

---

### Task 7: Repository 层重组 — 子目录迁移

**Files:**
- Create: `backend/internal/repository/user/user_repo.go`
- Create: `backend/internal/repository/blog/blog_repo.go`
- Create: `backend/internal/repository/content/tag_repo.go`
- Create: `backend/internal/repository/content/category_repo.go`
- Create: `backend/internal/repository/content/friend_link_repo.go`
- Create: `backend/internal/repository/social/comment_repo.go`
- Create: `backend/internal/repository/social/like_repo.go`
- Create: `backend/internal/repository/social/guestbook_repo.go`
- Delete: `backend/internal/repository/user_repo.go`
- Delete: `backend/internal/repository/blog_repo.go`
- Delete: `backend/internal/repository/tag_repo.go`
- Delete: `backend/internal/repository/category_repo.go`
- Delete: `backend/internal/repository/friend_link_repo.go`
- Delete: `backend/internal/repository/comment_repo.go`
- Delete: `backend/internal/repository/like_repo.go`
- Delete: `backend/internal/repository/guestbook_repo.go`

- [ ] **Step 1: 创建子目录结构**

```bash
mkdir -p /home/zanelin/repositories/blog/backend/internal/repository/{user,blog,content,social}
```

- [ ] **Step 2: 迁移文件，修改 package 名称和 import**

每个迁移文件的修改模式：
- package 从 `repository` 改为对应子目录名：`user`, `blog`, `content`, `social`
- import 路径更新 model 引用（如果子包需要）
- 接口和实现保持函数名不变，但类型名需要加包前缀

**重要：** 因为 pgxpool.Pool 和 model 是外部依赖，各子包只需 import 它们。跨包引用（如 BlogRepo 依赖 TagRepo）改为接口注入方式。

将原 `blog_repo.go` 的内容以修改后的形式写入 `repository/blog/blog_repo.go`：
- `package blog`
- `import ("github.com/zanelin/blog/internal/model"; ...)`
- 类型 `blogRepo` → `blogRepo` (unexported, same internal use)
- 接口 `BlogRepository` → `Repository` (因为是 blog 包内，外部引用为 blog.Repository)

同样处理其他所有 repo 文件。

- [ ] **Step 3: 删除旧文件**

```bash
rm /home/zanelin/repositories/blog/backend/internal/repository/{user_repo,blog_repo,tag_repo,category_repo,friend_link_repo,comment_repo,like_repo,guestbook_repo}.go
```

- [ ] **Step 4: 验证编译**

```bash
cd /home/zanelin/repositories/blog/backend && go build ./internal/repository/...
```

Expected: 编译成功

---

### Task 8: Service 层重组 — 子目录迁移 + 使用 pkg/slug

**Files:**
- Create: `backend/internal/service/auth/auth_service.go`
- Create: `backend/internal/service/blog/blog_service.go`
- Create: `backend/internal/service/content/tag_service.go`
- Create: `backend/internal/service/content/category_service.go`
- Create: `backend/internal/service/content/friend_link_service.go`
- Create: `backend/internal/service/social/comment_service.go`
- Create: `backend/internal/service/social/like_service.go`
- Create: `backend/internal/service/social/guestbook_service.go`
- Create: `backend/internal/service/trending/trending_service.go`
- Delete: 原 `backend/internal/service/` 下所有 .go 文件

- [ ] **Step 1: 创建子目录结构**

```bash
mkdir -p /home/zanelin/repositories/blog/backend/internal/service/{auth,blog,content,social,trending}
```

- [ ] **Step 2: 迁移文件，修改 package 名和 import**

每个 service 文件迁移模式与 repo 相同：
- package 改为子目录名
- 接口命名简化（如 `BlogService` → `Service`，外部引用为 `blog.Service`）
- 替换 `generateSlug`/`tagSlug`/`catSlug` 调用为 `slug.Generate()`
- 更新 repository import 路径为新的子目录包

以 `blog_service.go` 为例：
```go
package blog

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	md "github.com/zanelin/blog/internal/pkg/markdown"
	"github.com/zanelin/blog/internal/pkg/slug"
	"github.com/zanelin/blog/internal/model"
	blogRepo "github.com/zanelin/blog/internal/repository/blog"
	tagRepo "github.com/zanelin/blog/internal/repository/content" // 或者 tag 子包
)

type Service interface {
	Create(ctx context.Context, userID int64, params CreateParams) (*model.Blog, error)
	GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error)
	// ...
}

type service struct {
	blogRepo blogRepo.Repository
	tagRepo  tagRepo.Repository // 需要从 content 或独立 tag 包引入
}

// 使用 slug.Generate 替换 generateSlug
// 使用 time.Now().UnixNano() 替换 timeNow()
```

- [ ] **Step 3: 处理跨 Repository 引用**

这需要仔细设计。TagRepo 在 BlogService 中被使用。由于 TagRepo 现在在 `repository/content` 包中，需要通过接口解耦。

**方案：** 在 `repository/content` 中定义 `TagRepository` 接口（保持不变），BlogService 在自己的包内定义所需的最小接口子集。

实际上，更简单的方式是保持原来的关系。但 tag 现在和 category、friend_link 在同一 content 包，而 blog 在 repository/blog 包。跨包引用没问题——Go 支持包间引用，只要不循环依赖。

检查依赖关系：
- `service/blog` → `repository/blog` + `repository/content` (for tags) ✓ 无循环
- `service/content` → `repository/content` ✓ 无循环

- [ ] **Step 4: 删除旧 service 文件**

```bash
rm /home/zanelin/repositories/blog/backend/internal/service/{auth_service,blog_service,tag_service,category_service,friend_link_service,comment_service,like_service,guestbook_service,trending_service}.go
```

- [ ] **Step 5: 更新 main.go 中的 service 初始化代码**

这是后面 Task 10 的范围，此时仅在 service 包内完成迁移即可。

---

### Task 9: Handler 层重组 — 子目录迁移 + 使用 dto/mapper

**Files:**
- Create: `backend/internal/handler/auth/auth_handler.go`
- Create: `backend/internal/handler/blog/blog_handler.go`
- Create: `backend/internal/handler/blog/upload_handler.go`
- Create: `backend/internal/handler/content/tag_handler.go`
- Create: `backend/internal/handler/content/category_handler.go`
- Create: `backend/internal/handler/content/friend_link_handler.go`
- Create: `backend/internal/handler/social/comment_handler.go`
- Create: `backend/internal/handler/social/like_handler.go`
- Create: `backend/internal/handler/social/guestbook_handler.go`
- Create: `backend/internal/handler/user/user_handler.go`
- Create: `backend/internal/handler/trending/trending_handler.go`
- Delete: 原 `backend/internal/handler/` 下所有 .go 文件

- [ ] **Step 1: 创建子目录结构**

```bash
mkdir -p /home/zanelin/repositories/blog/backend/internal/handler/{auth,blog,content,social,user,trending}
```

- [ ] **Step 2: 迁移文件，修改 package 名和 import**

每个 handler 文件迁移模式：
- package 改为子目录名
- 接口命名简化（如 `AuthHandler` → `Handler`，外部引用为 `auth.Handler`）
- 替换所有 `toXxxResponse` 调用为 `mapper.XxxToYyyResponse`
- 统一错误消息为英文
- 使用新的 service 包路径
- `getOptionalUserID` 提取为 `pkg/context` 或保留在 blog handler 中

以 `auth_handler.go` 为例：
```go
package auth

import (
	// ...
	"github.com/zanelin/blog/internal/config"
	"github.com/zanelin/blog/internal/dto/mapper"
	"github.com/zanelin/blog/internal/dto/request"
	dto "github.com/zanelin/blog/internal/dto/response"
	"github.com/zanelin/blog/internal/middleware"
	"github.com/zanelin/blog/internal/model"
	resp "github.com/zanelin/blog/internal/pkg/response"
	authSvc "github.com/zanelin/blog/internal/service/auth"
)

type Handler struct {
	authService authSvc.Service
	cfg         *config.Config
}

func New(authService authSvc.Service, cfg *config.Config) *Handler {
	return &Handler{authService: authService, cfg: cfg}
}

func (h *Handler) Register(c *gin.Context) {
	// ...
	resp.Success(c, dto.AuthResponse{
		User:         mapper.UserToResponse(user),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
	})
}
```

- [ ] **Step 3: 更新 upload_handler.go — 统一错误消息**

```go
// 原中文消息改为英文
resp.BadRequest(c, "please select an image file")     // 原: "请选择图片文件"
resp.BadRequest(c, "only jpg/png/gif/webp are supported") // 原: "仅支持 jpg/png/gif/webp 格式"
resp.BadRequest(c, "image size must not exceed 10MB")     // 原: "图片大小不能超过 10MB"
resp.InternalError(c, "failed to create upload directory") // 原: "创建上传目录失败"
resp.InternalError(c, "failed to decode image")            // 原: "图片解码失败"
resp.InternalError(c, "failed to save file")               // 原: "保存文件失败"
resp.InternalError(c, "failed to encode image")            // 原: "保存图片失败"
```

同样更新 `auth_handler.go` 中 UploadAvatar 的中文消息。

- [ ] **Step 4: 移除无效桩代码**

`user_handler.go`:
```go
package user

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
)

type Handler struct{}

func New() *Handler { return &Handler{} }

// GetUser returns public user profile (not yet implemented)
func (h *Handler) GetUser(c *gin.Context) {
	resp.Success(c, nil) // reserved for future implementation
}
```

`trending_handler.go` (重命名自 ai_handler.go):
```go
package trending

import (
	"github.com/gin-gonic/gin"
	resp "github.com/zanelin/blog/internal/pkg/response"
	trendingSvc "github.com/zanelin/blog/internal/service/trending"
)

type Handler struct {
	service trendingSvc.Service
}

func New(s trendingSvc.Service) *Handler { return &Handler{service: s} }

func (h *Handler) GetGithubTrending(c *gin.Context) {
	repos := h.service.GetTrending()
	resp.Success(c, repos)
}

// TODO: AI summary features reserved for future implementation
func (h *Handler) GenerateSummary(c *gin.Context) {
	c.JSON(501, gin.H{"code": 501, "message": "not implemented"})
}

func (h *Handler) GetSummary(c *gin.Context) {
	c.JSON(501, gin.H{"code": 501, "message": "not implemented"})
}
```

- [ ] **Step 5: 删除旧 handler 文件**

```bash
rm /home/zanelin/repositories/blog/backend/internal/handler/{auth_handler,blog_handler,tag_handler,category_handler,friend_link_handler,comment_handler,like_handler,guestbook_handler,user_handler,ai_handler,upload_handler}.go
```

---

### Task 10: Router + main.go 更新 — 所有 import 路径更新 + 优雅关闭 + 速率限制路由

**Files:**
- Modify: `backend/internal/router/router.go`
- Modify: `backend/cmd/server/main.go`

- [ ] **Step 1: 更新 router.go 的 import 和 Handlers 结构体**

```go
package router

import (
	"github.com/gin-gonic/gin"
	"github.com/zanelin/blog/internal/config"
	"github.com/zanelin/blog/internal/handler/auth"
	"github.com/zanelin/blog/internal/handler/blog"
	"github.com/zanelin/blog/internal/handler/content"
	"github.com/zanelin/blog/internal/handler/social"
	"github.com/zanelin/blog/internal/handler/user"
	"github.com/zanelin/blog/internal/handler/trending"
	"github.com/zanelin/blog/internal/middleware"
)

type Handlers struct {
	Auth      *auth.Handler
	User      *user.Handler
	Blog      *blog.Handler
	Comment   *social.CommentHandler
	Like      *social.LikeHandler
	Tag       *content.TagHandler
	FriendLink *content.FriendLinkHandler
	Guestbook *social.GuestbookHandler
	Trending  *trending.Handler
	Category  *content.CategoryHandler
}
```

**注意：** social 包中有多个 handler，所以不能用 `social.Handler`。需要分开命名：`social.CommentHandler`、`social.LikeHandler`、`social.GuestbookHandler`。同样 content 包中有 `content.TagHandler`、`content.CategoryHandler`、`content.FriendLinkHandler`。

路由设置中为登录/注册增加速率限制：
```go
// 速率限制
loginLimiter := middleware.RateLimit(10, 10.0/60.0)    // 10次/分钟
registerLimiter := middleware.RateLimit(5, 5.0/60.0)   // 5次/分钟

auth := api.Group("/auth")
{
	auth.POST("/register", registerLimiter, h.Auth.Register)
	auth.POST("/login", loginLimiter, h.Auth.Login)
	// ...
}
```

- [ ] **Step 2: 更新 main.go — import 路径 + 优雅关闭 trending + 使用新的子包**

```go
package main

import (
	// ...
	"github.com/zanelin/blog/internal/handler/auth"
	blogHandler "github.com/zanelin/blog/internal/handler/blog"
	contentHandler "github.com/zanelin/blog/internal/handler/content"
	socialHandler "github.com/zanelin/blog/internal/handler/social"
	userHandler "github.com/zanelin/blog/internal/handler/user"
	trendingHandler "github.com/zanelin/blog/internal/handler/trending"
	
	"github.com/zanelin/blog/internal/repository/blog"
	contentRepo "github.com/zanelin/blog/internal/repository/content"
	socialRepo "github.com/zanelin/blog/internal/repository/social"
	userRepo "github.com/zanelin/blog/internal/repository/user"
	
	authSvc "github.com/zanelin/blog/internal/service/auth"
	blogSvc "github.com/zanelin/blog/internal/service/blog"
	contentSvc "github.com/zanelin/blog/internal/service/content"
	socialSvc "github.com/zanelin/blog/internal/service/social"
	trendingSvc "github.com/zanelin/blog/internal/service/trending"
)

func main() {
	// ... (config, db remains same)

	// Repos
	userRepo := userRepo.New(dbPool)
	blogRepo := blog.New(dbPool)
	tagRepo := contentRepo.NewTag(dbPool)
	commentRepo := socialRepo.NewComment(dbPool)
	likeRepo := socialRepo.NewLike(dbPool)
	friendLinkRepo := contentRepo.NewFriendLink(dbPool)
	guestbookRepo := socialRepo.NewGuestbook(dbPool)
	categoryRepo := contentRepo.NewCategory(dbPool)

	// Services
	authService := authSvc.New(userRepo, cfg)
	tagService := contentSvc.NewTag(tagRepo)
	blogService := blogSvc.New(blogRepo, tagRepo)
	commentService := socialSvc.NewComment(commentRepo)
	likeService := socialSvc.NewLike(likeRepo)
	friendLinkService := contentSvc.NewFriendLink(friendLinkRepo)
	guestbookService := socialSvc.NewGuestbook(guestbookRepo)
	trendingService := trendingSvc.New()
	categoryService := contentSvc.NewCategory(categoryRepo)

	// 优雅关闭 trending 定时刷新
	ctx, cancelRefresh := context.WithCancel(context.Background())
	defer cancelRefresh()
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				trendingService.Refresh()
			case <-ctx.Done():
				return
			}
		}
	}()

	// Handlers
	h := &router.Handlers{
		Auth:       auth.New(authService, cfg),
		User:       userHandler.New(),
		Blog:       blogHandler.New(blogService),
		Comment:    socialHandler.NewComment(commentService),
		Like:       socialHandler.NewLike(likeService),
		Tag:        contentHandler.NewTag(tagService),
		FriendLink: contentHandler.NewFriendLink(friendLinkService),
		Guestbook:  socialHandler.NewGuestbook(guestbookService),
		Trending:   trendingHandler.New(trendingService),
		Category:   contentHandler.NewCategory(categoryService),
	}

	// ... (rest remains same)
}
```

- [ ] **Step 3: GetTop handler 改为调用新方法**

`blog_handler.go` 中的 GetTop 更新：
```go
func (h *Handler) GetTop(c *gin.Context) {
	blogs, err := h.blogService.GetTop(c.Request.Context(), 10)
	if err != nil {
		resp.InternalError(c, err.Error())
		return
	}
	var items []dto.BlogListResponse
	for _, b := range blogs {
		items = append(items, mapper.BlogToListResponse(b))
	}
	resp.Success(c, items)
}
```

对应的 BlogService 接口新增 `GetTop(ctx, limit) ([]*model.Blog, error)` 方法，内部调用 `blogRepo.GetTop`。

- [ ] **Step 4: Category Update 传递 parent_id**

更新 `category_handler.go`:
```go
// 修改 service Update 调用，增加 parentID 参数
cat, err := h.service.Update(c.Request.Context(), id, req.Name, req.Description, req.SortOrder, req.ParentID)
```

同时更新 `CategoryService` 接口和 `categoryRepo` 的 Update 实现。

---

### Task 11: 构建验证 + 最终检查

- [ ] **Step 1: 全量编译**

```bash
cd /home/zanelin/repositories/blog/backend && go build ./...
```

Expected: 编译成功，无错误

- [ ] **Step 2: go vet 检查**

```bash
cd /home/zanelin/repositories/blog/backend && go vet ./...
```

Expected: 无警告

- [ ] **Step 3: 验证目录结构符合规范**

```bash
cd /home/zanelin/repositories/blog/backend/internal
echo "=== handler/ ===" && find handler -maxdepth 1 -type f -o -type d | sort
echo "=== service/ ===" && find service -maxdepth 1 -type f -o -type d | sort
echo "=== repository/ ===" && find repository -maxdepth 1 -type f -o -type d | sort
echo "=== middleware/ ===" && ls middleware/
```

Expected: 每层目录 ≤ 8 个条目

- [ ] **Step 4: Git 状态确认**

```bash
cd /home/zanelin/repositories/blog && git status
```

- [ ] **Step 5: Commit**

```bash
cd /home/zanelin/repositories/blog
git add -A
git commit -m "refactor(backend): restructure into domain subdirectories, fix security & logic bugs

- Reorganize handler/service/repository into domain subdirectories (auth/blog/content/social/trending)
- Extract shared code: pkg/slug (unified slug generation), dto/mapper (centralized model mapping)
- Add rate limiting middleware for auth endpoints
- Fix comment/guestbook delete to verify ownership
- Fix GetTop to use SQL WHERE is_top=true instead of filtering in Go
- Fix Search to pass currentUserID for liked_by_me status
- Fix Category Update to pass parent_id
- Fix OAuth state cookie security (Secure flag in production)
- Require JWT_SECRET to be configured (no hardcoded default)
- Replace time.Sleep loop with time.Ticker for graceful shutdown
- Unify error messages to English
- Use githubHTTPClient consistently for GitHub API calls"
```

---

## 验证标准

- [ ] `go build ./...` 编译通过
- [ ] `go vet ./...` 无警告
- [ ] 所有目录条目数 ≤ 8
- [ ] 所有 Go 文件 ≤ 400 行
- [ ] 评论删除验证权限 (非作者/管理员返回 403)
- [ ] 留言删除验证权限
- [ ] GetTop 返回所有置顶博客 (SQL 直接过滤)
- [ ] JWT_SECRET 缺失或为默认值时启动报错
- [ ] 无重复的 slug 生成逻辑
- [ ] 无分散的 toXxxResponse 转换函数
