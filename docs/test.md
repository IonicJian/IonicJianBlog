# Test Procedures

## Startup Verification

```bash
# 1. Start services
bash /home/zanelin/repositories/blog/start.sh

# 2. Verify both running
curl -s http://localhost:8080/api/v1/health  # → {"status":"ok"}
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/  # → 200

# 3. Verify DB connectivity
PGPASSWORD=blog_password psql -h localhost -U blog_user -d blog -c "SELECT count(*) FROM blogs;"
```

## Backend API Tests

### Auth Flow
```bash
BASE=http://localhost:8080/api/v1

# Register
curl -s -X POST $BASE/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Login (save token)
TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@blog.local","password":"admin123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

# Profile
curl -s $BASE/users/me -H "Authorization: Bearer $TOKEN"

# Refresh
REFRESH=$(curl -s -X POST $BASE/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@blog.local","password":"admin123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['refresh_token'])")
curl -s -X POST $BASE/auth/refresh \
  -H 'Content-Type: application/json' \
  -d "{\"refresh_token\":\"$REFRESH\"}"
```

### Blog CRUD (Admin)
```bash
# Create
BLOG_ID=$(curl -s -X POST $BASE/blogs \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Test","content":"# Hello\n\nWorld","status":"published"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

# Read
curl -s $BASE/blogs/$BLOG_ID

# Update
curl -s -X PUT $BASE/blogs/$BLOG_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Updated","content":"New content"}'

# Delete
curl -s -X DELETE $BASE/blogs/$BLOG_ID -H "Authorization: Bearer $TOKEN"
```

### Categories (Nested)
```bash
# Create parent
PARENT=$(curl -s -X POST $BASE/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Parent"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")

# Create child
curl -s -X POST $BASE/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Child\",\"parent_id\":$PARENT}"

# Verify tree
curl -s $BASE/categories | python3 -c "
import sys,json
d=json.load(sys.stdin)
for c in d['data']:
    kids=c.get('children',[])
    print(f'{c[\"name\"]}: {len(kids)} children')
"
```

### File Upload
```bash
# Avatar upload
echo "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" | base64 -d > /tmp/test.gif
curl -s -X POST $BASE/users/me/avatar/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@/tmp/test.gif"

# Verify served
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/uploads/avatars/*.jpg

# Blog image upload
curl -s -X POST $BASE/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/tmp/test.gif"
```

### Comments & Likes
```bash
# Create comment
curl -s -X POST $BASE/blogs/1/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"content":"Great post!"}'

# Toggle like
curl -s -X POST $BASE/blogs/1/like -H "Authorization: Bearer $TOKEN"
```

### Public Endpoints (No Auth)
```bash
curl -s $BASE/site/owner
curl -s "$BASE/blogs?page=1&page_size=5"
curl -s "$BASE/blogs/search?q=test"
curl -s $BASE/tags
curl -s $BASE/categories
curl -s $BASE/friend-links
curl -s $BASE/guestbook
curl -s $BASE/trending/github
```

### Permission Checks
```bash
# Non-admin cannot create blogs (expect 403)
USER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"test123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('access_token',''))")
curl -s -w "\n%{http_code}" -X POST $BASE/blogs \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"x","content":"x"}'

# Unauthenticated cannot like (expect 401)
curl -s -w "\n%{http_code}" -X POST $BASE/blogs/1/like
```

## Frontend Tests

### Build Check
```bash
cd /home/zanelin/repositories/blog/frontend
npm run build  # Should pass with no TS errors
```

### Manual Browser Testing Checklist

**Homepage (`/`)**
- [ ] Hero shows avatar + name
- [ ] Tab bar at bottom: 推荐阅读 / 最新文章
- [ ] Hover tab → panel slides up with blog cards
- [ ] Click tab → switches content
- [ ] Mouse leave → panel closes after 500ms
- [ ] Blog cards show title, excerpt, date, view count
- [ ] Dark mode toggle works

**Blog List (`/blogs`)**
- [ ] Left sidebar shows category tree with expand arrows
- [ ] Click category → filters blogs
- [ ] Click parent row → expands + selects simultaneously
- [ ] Tag multi-select works
- [ ] Search works (type → results update)
- [ ] Pagination works
- [ ] Blog cards match glass design

**Blog Detail (`/blogs/:id`)**
- [ ] Article title + meta display correctly
- [ ] Markdown renders properly (headings, code blocks, images, tables)
- [ ] Code blocks have language label + copy button
- [ ] Inline code styled differently from code blocks
- [ ] Left TOC shows headings, click scrolls, current section highlighted
- [ ] Click image → lightbox opens (full screen, Esc to close)
- [ ] Text selection → quote icon appears → click → jumps to comment box
- [ ] Comments display with avatars
- [ ] Reply to comments works
- [ ] Like button toggles optimistically
- [ ] Dark mode switch preserves reading position

**Auth Pages (`/login`, `/register`)**
- [ ] Email/password login works
- [ ] GitHub OAuth button shows
- [ ] Registration works
- [ ] Error messages display for invalid credentials

**Blog Editor (`/blogs/create`, `/blogs/:id/edit`)**
- [ ] MDEditor + preview panel side by side
- [ ] Category selector shows nested tree
- [ ] `+ 分类` button creates new category inline
- [ ] `+ 新标签` button creates tag with color picker
- [ ] Image upload button inserts `![]()` markdown
- [ ] Save as draft or publish
- [ ] Edit page pre-fills existing content
- [ ] Delete blog with confirmation

**Other Pages**
- [ ] Guestbook: login required, anonymous checkbox, post message
- [ ] FriendLinks: cards display with avatars, admin can add/edit/delete
- [ ] Trending: GitHub repos display with star/fork counts
- [ ] All pages: glass cards consistent, dark mode works, no console errors

### Performance
- [ ] Homepage hero → panel transition smooth (no jank)
- [ ] Code block scrolling works on mobile-width
- [ ] Lightbox opens/closes instantly
- [ ] Page transitions don't cause horizontal layout shift

### Cross-Browser
- [ ] Chrome: all features
- [ ] Firefox: glass backdrop-filter works
- [ ] Safari: -webkit-backdrop-filter works

### Responsive
- [ ] Mobile (< 768px): sidebar hidden, cards stack
- [ ] Tablet (768-1024px): layout adapts
- [ ] Desktop (> 1024px): full layout with sidebars

## Common Issues & Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Images 404 | Binary not running from `backend/` | Use `start.sh` or `cd backend && /tmp/blog-server &` |
| Port already in use | Previous instance not killed | `fuser -k 8080/tcp 5173/tcp` |
| Frontend build fails | TS errors | `npm run build` in `frontend/` to see errors |
| Login fails | DB not running | `sudo systemctl start postgresql` |
| GitHub OAuth 404 | Missing env vars | Check `.env` has `GITHUB_CLIENT_ID` |
| Glass effect not visible | Page bg is solid color | Ensure `bg-mesh` class on Layout |
| Panel animation janky | backdrop-filter on panel | Removed — panel now uses solid `bg-white/85` |
