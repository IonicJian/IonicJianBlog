# 后端重构改动文档

重构范围：后端 Go 代码，涉及 bug 修复、架构清理、性能优化、死代码删除。

## 改动列表

### 1. 提取 `imageutil` 公共包（新文件）

**问题**：`auth_handler.go`（头像上传）和 `upload_handler.go`（博客图片上传）各有一套独立的文件校验 + 图片缩放逻辑，代码重复且维护两个版本。

**方案**：提取 `backend/internal/pkg/imageutil/imageutil.go`，提供 `Validate()` 和 `Save()` 两个函数，支持 Fill/Resize 两种模式。两个 handler 均调用同一份代码。

**文件**：`+backend/internal/pkg/imageutil/imageutil.go`

---

### 2. 内联 `oauthstore` 包（删除）

**问题**：`oauthstore` 包只被 `auth_handler.go` 一个消费者引用，且只有两个函数（Put/Take），却独立成包，属于过度拆分。

**方案**：将 `oauthExchangeEntry` 结构体和 `oauthExchangeStore`（含 sync.RWMutex + time.AfterFunc 5min TTL）直接内联到 `auth_handler.go`。

**文件**：`-backend/internal/pkg/oauthstore/store.go`

---

### 3. 修复评论分页（重写 `comment_repo.go`）

**问题**：旧代码先 `SELECT *` 拉取全部评论到内存，Go 里构建树，然后对顶层评论做切片分页。数据量大时内存占用高。

**方案**：`WHERE parent_id IS NULL LIMIT/OFFSET` 在 SQL 层做顶层分页，只拉当前页顶层的评论 ID，再一条 `WHERE parent_id IN (...)` 查回复。提取 `scanComment()` 辅助函数。

**文件**：`backend/internal/repository/social/comment_repo.go`

---

### 4. 修复搜索 N+1 问题

**问题**：`Search()` 用 `LIMIT/OFFSET` 查到一批 blog ID 后，循环调 `r.GetByID(id)` 逐条查详情，产生 N+1 次查询。

**方案**：新增 `getManyByIDs()` 方法，一条 `WHERE b.id IN (...)` 查出所有，按输入顺序返回。Search 直接调用它。

**文件**：`backend/internal/repository/blog/blog_repo.go`

---

### 5. 修复 `user_repo.go` 更新遗漏 `github_id`

**问题**：`UPDATE users SET display_name=$1, avatar_url=$2, bio=$3, updated_at=$4 WHERE id=$5` 缺少 `github_id=$4`，导致 GitHub OAuth 登录用户关联的邮箱账号更新时，github_id 被清空。

**方案**：加入 `github_id=$4`，参数后移一位。

**文件**：`backend/internal/repository/user/user_repo.go`

---

### 6. 修复中文标题 slug 为空

**问题**：中文标题经过 `[^a-z0-9]+` 正则处理后结果为空字符串，最终 fallback 为 `"untitled"`，导致多篇中文博客 slug 冲突。

**方案**：用 SHA256 哈希截取前 8 位作为 fallback：`post-<hash[:8]>`。

**文件**：`backend/internal/pkg/slug/slug.go`

---

### 7. 修复 `logger.go` 随机字符串性能问题

**问题**：`randomString()` 用一个 6 次循环 + `time.Sleep(1)` 生成随机数，依赖纳秒级 sleep 的随机性，性能差且不可靠。

**方案**：使用 `crypto/rand` + `hex.EncodeToString`。

**文件**：`backend/internal/middleware/logger.go`

---

### 8. 删除死代码

| 文件 | 原因 |
|------|------|
| `backend/internal/handler/user/user_handler.go` | 空壳，GetUser 返回 nil |
| `backend/internal/dto/response/user_resp.go` | UserProfileResponse 无引用 |
| `backend/internal/dto/response/common.go` | LikeStatusResponse 无引用 |
| `backend/internal/dto/request/user_req.go` | CreateGuestbookRequest 无引用（guestbook handler 用内联结构体） |
| `router.go` 中 `User *user.Handler` | handler 已删，注册的路由也对应移除 |

---

### 9. 其他小优化

- **`trending_handler.go`**：501 桩接口从 `c.JSON(http.StatusNotImplemented, gin.H{...})` 改为 `resp.Error()` 保证响应格式一致性
- **`blog_handler.go`**：`IncrementView` 从 `_ = h.blogService.IncrementView(...)`（静默吞错误）改为记录日志
- **`interface{}` → `any`**：符合 Go 1.22+ 风格
- **`min()`/`max()`**：使用 Go 内置函数替代手写条件判断

## 统计

```
17 files changed, 307 insertions(+), 238 deletions(-)
5 files deleted, 1 file created
```
