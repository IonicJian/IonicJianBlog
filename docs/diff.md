backend/cmd/server/main.go | 243 ++------------
backend/go.mod | 5 +-
backend/internal/config/config.go | 1 +
backend/internal/dto/request/blog_req.go | 2 +
backend/internal/dto/response/blog_resp.go | 62 ++--
backend/internal/handler/auth_handler.go | 89 ++++-
backend/internal/handler/blog_handler.go | 5 +
backend/internal/model/models.go | 15 +-
backend/internal/repository/blog_repo.go | 363 +++++++++------------
backend/internal/repository/user_repo.go | 16 +
backend/internal/router/router.go | 10 +
backend/internal/service/auth_service.go | 5 +
backend/internal/service/blog_service.go | 2 +
frontend/src/App.tsx | 28 +-
frontend/src/api/auth.ts | 3 +
frontend/src/api/blogs.ts | 15 +-
frontend/src/api/client.ts | 6 +-
frontend/src/components/comment/CommentForm.tsx | 104 ++++--
frontend/src/components/comment/CommentItem.tsx | 39 ++-
frontend/src/components/comment/CommentList.tsx | 10 +-
.../src/components/common/MarkdownRenderer.tsx | 126 +++++--
frontend/src/components/layout/Footer.tsx | 2 +-
frontend/src/components/layout/Header.tsx | 104 ++----
frontend/src/components/layout/Layout.tsx | 14 +-
frontend/src/components/like/LikeButton.tsx | 9 +-
frontend/src/index.css | 132 ++++++++
frontend/src/pages/BlogCreatePage.tsx | 151 ++++++---
frontend/src/pages/BlogDetailPage.tsx | 121 +++----
frontend/src/pages/BlogEditPage.tsx | 179 +++++-----
frontend/src/pages/BlogListPage.tsx | 173 +++++-----
frontend/src/pages/FriendLinksPage.tsx | 151 +++------
frontend/src/pages/GuestbookPage.tsx | 104 +++---
frontend/src/pages/HomePage.tsx | 145 +++++---
frontend/src/pages/LoginPage.tsx | 95 +++---
frontend/src/pages/NotFoundPage.tsx | 4 +-
frontend/src/pages/OAuthCallbackPage.tsx | 2 +-
frontend/src/pages/ProfilePage.tsx | 39 ---
frontend/src/pages/RegisterPage.tsx | 77 ++---
frontend/src/pages/TrendingPage.tsx | 67 ++--
frontend/src/store/authStore.ts | 3 +
frontend/src/types/blog.ts | 4 +
41 files changed, 1400 insertions(+), 1325 deletions(-)

### Deleted Files

D frontend/src/pages/ProfilePage.tsx

## Key Feature Changes

### 1. Categories with Nested Support

- **Backend**: New `categories` table with `parent_id` self-referencing FK, `Category` model with `Children` field, tree-building logic in repository
- **Frontend**: Left sidebar with expand/collapse tree, admin can create/delete categories, category filter on blog list
- **Files**: `category_handler.go`, `category_repo.go`, `category_service.go`, `categories.ts`, `BlogListPage.tsx`

### 2. Avatar Upload with Compression

- **Backend**: `POST /users/me/avatar/upload` — multipart upload, `imaging.Fill` resize to 256×256, JPEG quality 85, `uuid` filenames, old file deletion
- **Frontend**: `UserMenu` hover panel with avatar preview + upload button, header profile link replaced
- **Files**: `auth_handler.go` (UploadAvatar), `UserMenu.tsx`, `auth.ts`

### 3. Blog Image Upload

- **Backend**: `POST /upload/image` — multipart upload, max 1200px wide resize, JPEG output
- **Frontend**: `ImageUploadButton` component in blog editor toolbar
- **Files**: `upload_handler.go` (new), `ImageUploadButton.tsx` (new)

### 4. Glass UI Design System

- **CSS**: `.glass` class with `backdrop-filter: blur(24px)` + gradient backgrounds, `.btn-primary` / `.btn-ghost`, `.input-underline`, `.hover-lift`, `.link-underline`, page transition animations
- **Colors**: Zinc → Slate monochrome with amber accents, `bg-mesh` texture background
- **Files**: `index.css` (rewritten), all page components

### 5. Markdown Rendering

- **Syntax Highlighting**: Replaced custom code blocks with `react-syntax-highlighter` (Prism), `oneLight`/`oneDark` theme switching
- **Copy Button**: Code blocks have language label + copy-to-clipboard button
- **TOC**: `TableOfContents` component with IntersectionObserver scroll tracking, left sidebar on blog detail
- **Files**: `MarkdownRenderer.tsx`, `TableOfContents.tsx` (new)

### 6. Lightbox

- Replaced custom lightbox with `yet-another-react-lightbox` library
- **Files**: `Lightbox.tsx`

### 7. SVG Icons

- Replaced all emoji icons (☀️🌙❤️🤍💬⭐🔀) with SVG components
- **Files**: `Icons.tsx` (new, 12 icons), `Header.tsx`, `LikeButton.tsx`, `TrendingPage.tsx`, `BlogDetailPage.tsx`

### 8. Blog Cards

- `BlogCard` shared component with `variant="glass"|"simple"`, used by HomePage and BlogListPage
- Scaled up: `text-sm→text-base` titles, `text-xs→text-sm` excerpts
- **Files**: `BlogCard.tsx` (new)

### 9. Guestbook — Login Required

- Changed from open posting to login-required with anonymous checkbox
- **Files**: `GuestbookPage.tsx`

### 10. Navigation & UX

- Blog detail back button uses `navigate(-1)` (smart back)
- `scrollbar-gutter: stable` prevents horizontal layout shift
- Fixed header with glass effect across all pages
- **Files**: `BlogDetailPage.tsx`, `Layout.tsx`, `index.css`

### Backend New Files

- backend/internal/handler/category_handler.go
- backend/internal/handler/upload_handler.go
- backend/internal/repository/category_repo.go
- backend/internal/service/category_service.go
- backend/uploads/

### Frontend New Files

- frontend/src/api/categories.ts
- frontend/src/components/common/BlogCard.tsx
- frontend/src/components/common/Icons.tsx
- frontend/src/components/common/ImageUploadButton.tsx
- frontend/src/components/common/Lightbox.tsx
- frontend/src/components/common/TableOfContents.tsx
- frontend/src/components/layout/UserMenu.tsx

### Modified Files (40 total)

- backend/cmd/server/main.go
- backend/go.mod
- backend/internal/config/config.go
- backend/internal/dto/request/blog_req.go
- backend/internal/dto/response/blog_resp.go
- backend/internal/handler/auth_handler.go
- backend/internal/handler/blog_handler.go
- backend/internal/model/models.go
- backend/internal/repository/blog_repo.go
- backend/internal/repository/user_repo.go
- backend/internal/router/router.go
- backend/internal/service/auth_service.go
- backend/internal/service/blog_service.go
- frontend/src/App.tsx
- frontend/src/api/auth.ts
- frontend/src/api/blogs.ts
- frontend/src/api/client.ts
- frontend/src/components/comment/CommentForm.tsx
- frontend/src/components/comment/CommentItem.tsx
- frontend/src/components/comment/CommentList.tsx
- frontend/src/components/common/MarkdownRenderer.tsx
- frontend/src/components/layout/Footer.tsx
- frontend/src/components/layout/Header.tsx
- frontend/src/components/layout/Layout.tsx
- frontend/src/components/like/LikeButton.tsx
- frontend/src/index.css
- frontend/src/pages/BlogCreatePage.tsx
- frontend/src/pages/BlogDetailPage.tsx
- frontend/src/pages/BlogEditPage.tsx
- frontend/src/pages/BlogListPage.tsx
- frontend/src/pages/FriendLinksPage.tsx
- frontend/src/pages/GuestbookPage.tsx
- frontend/src/pages/HomePage.tsx
- frontend/src/pages/LoginPage.tsx
- frontend/src/pages/NotFoundPage.tsx
- frontend/src/pages/OAuthCallbackPage.tsx
- frontend/src/pages/RegisterPage.tsx
- frontend/src/pages/TrendingPage.tsx
- frontend/src/store/authStore.ts
- frontend/src/types/blog.ts
