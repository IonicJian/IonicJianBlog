## File Structure

```
blog/
├── start.sh                    # One-command start (build+run both)
├── CLAUDE.md                   # This file
├── backend/
│   ├── cmd/server/main.go      # Entry: DB, migrations, admin seed, Gin server
│   ├── internal/
│   │   ├── config/config.go    # Viper config, .env loader
│   │   ├── model/models.go     # All DB models
│   │   ├── dto/request/        # Request DTOs
│   │   ├── dto/response/       # Response DTOs
│   │   ├── handler/            # HTTP handlers (auth, blog, comment, like, upload, category, etc.)
│   │   ├── service/            # Business logic layer
│   │   ├── repository/         # Database access layer (pgx queries)
│   │   ├── middleware/         # Auth middleware (RequiredAuth, OptionalAuth, RequireAdmin)
│   │   ├── router/router.go    # All route definitions
│   │   └── pkg/response/       # Standardized API response helpers
│   └── uploads/
│       ├── images/             # Blog image uploads (served as /uploads/images/)
│       └── avatars/            # User avatar uploads (served as /uploads/avatars/)
├── frontend/
│   ├── index.html
│   ├── vite.config.ts          # Vite config (proxy /api + /uploads → :8080)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx             # Routes + scroll observer + auth/theme init
│   │   ├── index.css           # Tailwind v4 + custom glass/button/input/animation classes
│   │   ├── api/                # Axios API client + endpoint modules
│   │   │   ├── client.ts       # Base client (401 refresh interceptor, FormData detection)
│   │   │   ├── auth.ts         # Auth endpoints + uploadAvatar
│   │   │   ├── blogs.ts        # Blog + tag endpoints
│   │   │   ├── categories.ts   # Category CRUD + nested list
│   │   │   ├── comments.ts     # Comments
│   │   │   ├── likes.ts        # Likes
│   │   │   ├── guestbook.ts    # Guestbook
│   │   │   ├── friendLinks.ts  # Friend links
│   │   │   └── trending.ts     # GitHub trending
│   │   ├── store/
│   │   │   ├── authStore.ts    # Zustand: user, tokens, login/register/logout/refresh
│   │   │   └── uiStore.ts     # Zustand: theme (light/dark) with localStorage
│   │   ├── types/              # TypeScript type definitions
│   │   ├── pages/              # All page components
│   │   └── components/
│   │       ├── layout/         # Layout, Header, Footer, UserMenu
│   │       ├── common/         # MarkdownRenderer, BlogCard, Icons, Lightbox, ImageUploadButton, TableOfContents
│   │       ├── comment/        # CommentList, CommentItem, CommentForm
│   │       └── like/           # LikeButton (optimistic update)
│   └── dist/                   # Production build output
```

## Features & API Mapping

### Authentication

| Feature            | Frontend                                 | API                                             | Auth |
| ------------------ | ---------------------------------------- | ----------------------------------------------- | ---- |
| Email register     | `RegisterPage.tsx`                       | `POST /auth/register`                           | No   |
| Email login        | `LoginPage.tsx`                          | `POST /auth/login`                              | No   |
| Token refresh      | `client.ts` interceptor                  | `POST /auth/refresh`                            | No   |
| GitHub OAuth login | `LoginPage.tsx`, `OAuthCallbackPage.tsx` | `GET /auth/github`, `GET /auth/github/callback` | No   |
| Logout             | `UserMenu.tsx`                           | `POST /auth/logout`                             | Yes  |
| Get profile        | `authStore.ts`                           | `GET /users/me`                                 | Yes  |
| Update profile     | (removed)                                | `PUT /users/me`                                 | Yes  |
| Avatar upload      | `UserMenu.tsx`                           | `POST /users/me/avatar/upload`                  | Yes  |
| Blog owner info    | `HomePage.tsx`                           | `GET /site/owner`                               | No   |

### Blog Management (Admin Only)

| Feature           | Frontend                                 | API                       | Auth  |
| ----------------- | ---------------------------------------- | ------------------------- | ----- |
| Create blog       | `BlogCreatePage.tsx`                     | `POST /blogs`             | Admin |
| Update blog       | `BlogEditPage.tsx`                       | `PUT /blogs/:id`          | Admin |
| Delete blog       | `BlogEditPage.tsx`                       | `DELETE /blogs/:id`       | Admin |
| Upload blog image | `ImageUploadButton.tsx`                  | `POST /upload/image`      | Yes   |
| Create tag        | `BlogListPage.tsx`, `BlogCreatePage.tsx` | `POST /tags`              | Admin |
| Update tag        | —                                        | `PUT /tags/:id`           | Admin |
| Delete tag        | —                                        | `DELETE /tags/:id`        | Admin |
| Create category   | `BlogCreatePage.tsx`                     | `POST /categories`        | Admin |
| Update category   | —                                        | `PUT /categories/:id`     | Admin |
| Delete category   | `BlogListPage.tsx`                       | `DELETE /categories/:id`  | Admin |
| AI summary        | —                                        | `POST /blogs/:id/summary` | Admin |

### Blog Reading (Public + Optional Auth)

| Feature                | Frontend                                                     | API                                                          | Auth     |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| Blog list with filters | `BlogListPage.tsx`                                           | `GET /blogs` (query: page, page_size, tag, category, status) | Optional |
| Blog detail            | `BlogDetailPage.tsx`                                         | `GET /blogs/:id`                                             | Optional |
| Blog by slug           | —                                                            | `GET /blogs/slug/:slug`                                      | Optional |
| Full-text search       | `BlogListPage.tsx`                                           | `GET /blogs/search` (query: q, page, page_size)              | Optional |
| Pinned blogs           | —                                                            | `GET /blogs/top`                                             | Optional |
| Increment view         | `BlogDetailPage.tsx` (sessionStorage dedup)                  | `POST /blogs/:id/view`                                       | Optional |
| Markdown rendering     | `MarkdownRenderer.tsx` (react-markdown + syntax highlighter) | Backend: goldmark → content_html                             | —        |
| Image lightbox         | `Lightbox.tsx` (yet-another-react-lightbox)                  | —                                                            | —        |
| Table of contents      | `TableOfContents.tsx` (IntersectionObserver)                 | —                                                            | —        |

### Comments & Likes (Auth Required)

| Feature             | Frontend                            | API                             | Auth              |
| ------------------- | ----------------------------------- | ------------------------------- | ----------------- |
| List comments       | `CommentList.tsx`                   | `GET /blogs/:id/comments`       | No                |
| Create comment      | `CommentForm.tsx`                   | `POST /blogs/:id/comments`      | Yes               |
| Delete comment      | `CommentItem.tsx`                   | `DELETE /comments/:id`          | Yes (owner/admin) |
| Inline quote reply  | `BlogDetailPage.tsx` text selection | Anchor fields in create comment | Yes               |
| Toggle blog like    | `LikeButton.tsx` (optimistic)       | `POST /blogs/:id/like`          | Yes               |
| Toggle comment like | `LikeButton.tsx`                    | `POST /comments/:id/like`       | Yes               |
| Blog like status    | —                                   | `GET /blogs/:id/like/status`    | Yes               |
| Comment like status | —                                   | `GET /comments/:id/like/status` | Yes               |

### Tags

| Feature             | Frontend                        | API                                         | Auth  |
| ------------------- | ------------------------------- | ------------------------------------------- | ----- |
| List all tags       | Blog sidebar, blog editor       | `GET /tags`                                 | No    |
| Create tag (admin)  | Inline form in sidebar & editor | `POST /tags`                                | Admin |
| Multi-select filter | `BlogListPage.tsx` sidebar      | Passed as comma-separated `tag` query param | —     |

### Categories (Nested)

| Feature            | Frontend                                           | API                                     | Auth  |
| ------------------ | -------------------------------------------------- | --------------------------------------- | ----- |
| Category tree      | `BlogListPage.tsx` sidebar (expand/collapse)       | `GET /categories` (returns nested tree) | No    |
| Create category    | `BlogCreatePage.tsx` (inline with parent selector) | `POST /categories`                      | Admin |
| Delete category    | `BlogListPage.tsx` (× button, hover)               | `DELETE /categories/:id`                | Admin |
| Filter by category | `BlogListPage.tsx` sidebar                         | `GET /blogs?category=slug`              | —     |

### Friend Links

| Feature             | Frontend                   | API                        | Auth  |
| ------------------- | -------------------------- | -------------------------- | ----- |
| List links          | `FriendLinksPage.tsx`      | `GET /friend-links`        | No    |
| Create link (admin) | `FriendLinksPage.tsx` form | `POST /friend-links`       | Admin |
| Update link (admin) | `FriendLinksPage.tsx` form | `PUT /friend-links/:id`    | Admin |
| Delete link (admin) | `FriendLinksPage.tsx`      | `DELETE /friend-links/:id` | Admin |

### Guestbook

| Feature        | Frontend                                                 | API                     | Auth |
| -------------- | -------------------------------------------------------- | ----------------------- | ---- |
| List messages  | `GuestbookPage.tsx` (paginated)                          | `GET /guestbook?page=N` | No   |
| Post message   | `GuestbookPage.tsx` (login required, anonymous checkbox) | `POST /guestbook`       | Yes  |
| Delete message | —                                                        | `DELETE /guestbook/:id` | Yes  |

### GitHub Trending

| Feature        | Frontend           | API                                | Auth |
| -------------- | ------------------ | ---------------------------------- | ---- |
| Trending repos | `TrendingPage.tsx` | `GET /trending/github` (cached 1h) | No   |

### Static Files

| Feature      | Path                 | Notes                                                     |
| ------------ | -------------------- | --------------------------------------------------------- |
| Blog images  | `/uploads/images/*`  | Uploaded via `POST /upload/image`, max 1200px             |
| User avatars | `/uploads/avatars/*` | Uploaded via `POST /users/me/avatar/upload`, 256×256 JPEG |

## Backend API Reference

All endpoints return `{"code": 0, "message": "success", "data": ...}`.
Errors return non-zero code with message.

Base URL: `/api/v1`

### Auth Headers

- `Authorization: Bearer <access_token>` for protected endpoints
- Access token: 15min, Refresh token: 7 days
- Axios interceptor auto-refreshes on 401
- Roles: `admin` (seeded) / `user` (default on register)

## Database

PostgreSQL with pgx v5. Embedded SQL migrations in `cmd/server/main.go`.

### Models (Go structs in `model/models.go`)

- `User` — authentication, profile, roles
- `Blog` — content with category_id FK, tags via junction
- `Category` — nested tree via `parent_id` FK + `Children` field
- `Tag` — label with color
- `Comment` — threaded via `parent_id`, inline quote via `anchor_start/text`
- `Like` — polymorphic: `target_type` (blog/comment) + `target_id`
- `FriendLink` — external links with sort order
- `GuestbookMessage` — public messages

### Key Queries

- Blog search: PostgreSQL FTS (`to_tsvector` with title weighting `setweight('A')`) + ILIKE fallback, deduplicated via `seen` map
- Category list: flat SQL query → Go builds nested tree via `byID` map, children attached recursively
- Blog list: supports `status`, `tag` (comma-separated slugs → EXISTS subquery), `category` (slug), `user_id`
- View count: per-blog per-session dedup via `sessionStorage` key
- Likes: UNIQUE constraint on `(user_id, target_type, target_id)`, count via COALESCE subquery

## Frontend Architecture

### State: Zustand

- `authStore`: user, accessToken, refreshToken, isAuthenticated, login/register/logout/refreshSession/fetchProfile/setUser
- `uiStore`: theme (light/dark) persisted in localStorage

### Routing: React Router v6

- `/` — HomePage (hero + blog panel)
- `/blogs` — BlogListPage (search, filter, sidebar)
- `/blogs/:id` — BlogDetailPage (article + TOC + comments + lightbox)
- `/blogs/create` — BlogCreatePage (admin, MDEditor + preview)
- `/blogs/:id/edit` — BlogEditPage (admin)
- `/login`, `/register` — Auth forms
- `/friends` — FriendLinksPage
- `/guestbook` — GuestbookPage
- `/trending` — TrendingPage
- `/auth/callback` — OAuth callback

### Design System

- **Colors**: Slate monochrome + amber accent (`#d97706`)
- **Glass**: `.glass` class — `backdrop-filter: blur(24px)` + gradient bg + 1px border
- **Buttons**: `.btn-primary` (zinc-900/white switch), `.btn-ghost` (transparent with border)
- **Inputs**: `.input-underline` (bottom-border-only style)
- **Cards**: `.glass rounded-xl` for standalone, `BlogCard` component with `variant="simple"|"glass"`
- **Animations**: `fade-up`, `scale-in`, `page-enter`, stagger delays (stagger-1 through stagger-6)
- **Font**: System font stack, no external fonts

### Key components

- `MarkdownRenderer.tsx` — ReactMarkdown + remarkGfm + SyntaxHighlighter (Prism oneDark/oneLight), image click → lightbox
- `Lightbox.tsx` — `yet-another-react-lightbox` wrapper
- `BlogCard.tsx` — Reusable card with glass/simple variants
- `UserMenu.tsx` — Header username hover panel with avatar upload + logout
- `TableOfContents.tsx` — Parses markdown headings → clickable TOC with scroll tracking

## Configuration

`.env` in `backend/`:

```
SERVER_PORT=:8080
SERVER_MODE=debug
SERVER_FRONTEND_URL=http://localhost:5173
DATABASE_DSN=postgres://blog_user:blog_password@localhost:5432/blog?sslmode=disable
JWT_SECRET=dev-secret-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=168h
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URL=http://localhost:8080/api/v1/auth/github/callback
ADMIN_GITHUB_ID=
ADMIN_EMAIL=admin@blog.local
ADMIN_PASSWORD=admin123
```

## Important Gotchas

- Backend binary **must** run from `backend/` directory (otherwise `./uploads` static path breaks)
- Vite proxy: `/api` and `/uploads` both proxy to `localhost:8080`
- `scrollbar-gutter: stable` on `html` prevents layout shift on page transitions
- React StrictMode double-mounts in dev — use `let cancelled = false` pattern in effects
- `html` has `scrollbar-gutter: stable` to prevent page-width jumps
- API client auto-removes `Content-Type` header when body is `FormData` (interceptor)
- Categories API returns nested tree (backend builds from flat query)
- Blog card `variant="simple"` on homepage (lightweight), `variant="glass"` on blog list page
