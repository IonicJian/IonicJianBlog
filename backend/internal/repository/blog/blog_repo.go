package blog

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type Repository interface {
	Create(ctx context.Context, blog *model.Blog, tagIDs []int64) error
	GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error)
	GetBySlug(ctx context.Context, slug string, currentUserID *int64) (*model.Blog, error)
	Update(ctx context.Context, blog *model.Blog, tagIDs []int64) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, opts ListOptions) ([]*model.Blog, int64, error)
	Search(ctx context.Context, query string, page, pageSize int, currentUserID *int64) ([]*model.Blog, int64, error)
	GetTop(ctx context.Context, limit int) ([]*model.Blog, error)
	IncrementViewCount(ctx context.Context, id int64) error
	SlugExists(ctx context.Context, slug string, excludeID int64) (bool, error)
}

type ListOptions struct {
	Page         int
	PageSize     int
	Status       string
	TagSlug      string
	CategorySlug string
	UserID       *int64
}

type blogRepo struct{ db *pgxpool.Pool }

func New(db *pgxpool.Pool) Repository { return &blogRepo{db: db} }

func (r *blogRepo) Create(ctx context.Context, blog *model.Blog, tagIDs []int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	err = tx.QueryRow(ctx,
		`INSERT INTO blogs (user_id, title, slug, content, content_html, excerpt, cover_image, status, is_top, category_id)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, created_at, updated_at`,
		blog.UserID, blog.Title, blog.Slug, blog.Content, blog.ContentHTML,
		blog.Excerpt, blog.CoverImage, blog.Status, blog.IsTop, blog.CategoryID,
	).Scan(&blog.ID, &blog.CreatedAt, &blog.UpdatedAt)
	if err != nil {
		return err
	}
	for _, tid := range tagIDs {
		if _, err := tx.Exec(ctx, "INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", blog.ID, tid); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

// getOne is a helper to fetch a single blog with like_count and optional liked_by_me.
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
		if err != nil {
			return nil, err
		}
		b.LikedByMe = likedByMe
	} else {
		q := baseQuery + ` FROM blogs b WHERE ` + whereClause
		err := r.db.QueryRow(ctx, q, whereArg).Scan(
			&b.ID, &b.UserID, &b.Title, &b.Slug, &b.Content, &b.ContentHTML, &b.Excerpt, &b.CoverImage,
			&b.Status, &b.ViewCount, &b.IsTop, &b.CategoryID, &b.CreatedAt, &b.UpdatedAt, &b.LikeCount)
		if err != nil {
			return nil, err
		}
	}
	return b, nil
}

func (r *blogRepo) GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error) {
	return r.getOne(ctx, "b.id=$1", id, currentUserID)
}

func (r *blogRepo) GetBySlug(ctx context.Context, slug string, currentUserID *int64) (*model.Blog, error) {
	return r.getOne(ctx, "b.slug=$1", slug, currentUserID)
}

func (r *blogRepo) Update(ctx context.Context, blog *model.Blog, tagIDs []int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	_, err = tx.Exec(ctx,
		`UPDATE blogs SET title=$1, slug=$2, content=$3, content_html=$4, excerpt=$5,
		 cover_image=$6, status=$7, is_top=$8, category_id=$9, updated_at=NOW() WHERE id=$10`,
		blog.Title, blog.Slug, blog.Content, blog.ContentHTML, blog.Excerpt,
		blog.CoverImage, blog.Status, blog.IsTop, blog.CategoryID, blog.ID)
	if err != nil {
		return err
	}
	if len(tagIDs) > 0 {
		if _, err := tx.Exec(ctx, "DELETE FROM blog_tags WHERE blog_id=$1", blog.ID); err != nil {
			return err
		}
		for _, tid := range tagIDs {
			if _, err := tx.Exec(ctx, "INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", blog.ID, tid); err != nil {
				return err
			}
		}
	}
	return tx.Commit(ctx)
}

func (r *blogRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "DELETE FROM blogs WHERE id=$1", id)
	return err
}

func (r *blogRepo) List(ctx context.Context, opts ListOptions) ([]*model.Blog, int64, error) {
	var where []string
	args := []interface{}{}
	argIdx := 1
	if opts.Status != "" {
		where = append(where, fmt.Sprintf("b.status=$%d", argIdx))
		args = append(args, opts.Status)
		argIdx++
	}
	if opts.CategorySlug != "" {
		where = append(where, fmt.Sprintf("EXISTS(SELECT 1 FROM categories c WHERE c.id=b.category_id AND c.slug=$%d)", argIdx))
		args = append(args, opts.CategorySlug)
		argIdx++
	}
	if opts.TagSlug != "" {
		slugs := strings.Split(opts.TagSlug, ",")
		var tagConditions []string
		for _, slug := range slugs {
			slug = strings.TrimSpace(slug)
			if slug != "" {
				tagConditions = append(tagConditions, fmt.Sprintf("$%d", argIdx))
				args = append(args, slug)
				argIdx++
			}
		}
		if len(tagConditions) > 0 {
			where = append(where, fmt.Sprintf("EXISTS(SELECT 1 FROM blog_tags bt JOIN tags t ON t.id=bt.tag_id WHERE bt.blog_id=b.id AND t.slug IN (%s))", strings.Join(tagConditions, ",")))
		}
	}
	if opts.UserID != nil {
		where = append(where, fmt.Sprintf("b.user_id=$%d", argIdx))
		args = append(args, *opts.UserID)
		argIdx++
	}
	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	var total int64
	r.db.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM blogs b %s", whereClause), args...).Scan(&total)
	offset := (opts.Page - 1) * opts.PageSize
	query := fmt.Sprintf(
		`SELECT b.id, b.user_id, b.title, b.slug, b.excerpt, b.cover_image,
		 b.status, b.view_count, b.is_top, b.category_id, b.created_at, b.updated_at,
		 COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='blog' AND target_id=b.id),0) AS like_count
		 FROM blogs b %s ORDER BY b.is_top DESC, b.created_at DESC LIMIT $%d OFFSET $%d`,
		whereClause, argIdx, argIdx+1)
	args = append(args, opts.PageSize, offset)
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var blogs []*model.Blog
	for rows.Next() {
		b := &model.Blog{}
		var catID *int64
		if err := rows.Scan(&b.ID, &b.UserID, &b.Title, &b.Slug, &b.Excerpt, &b.CoverImage,
			&b.Status, &b.ViewCount, &b.IsTop, &catID, &b.CreatedAt, &b.UpdatedAt, &b.LikeCount); err != nil {
			return nil, 0, err
		}
		b.CategoryID = catID
		blogs = append(blogs, b)
	}
	return blogs, total, nil
}

func (r *blogRepo) Search(ctx context.Context, query string, page, pageSize int, currentUserID *int64) ([]*model.Blog, int64, error) {
	offset := (page - 1) * pageSize
	q := strings.TrimSpace(query)
	if q == "" {
		return nil, 0, nil
	}

	seen := make(map[int64]bool)
	var ids []int64

	// 1. FTS with title priority
	ftsRows, _ := r.db.Query(ctx,
		`SELECT b.id, ts_rank(setweight(to_tsvector('simple',b.title),'A') || to_tsvector('simple',b.content), plainto_tsquery('simple',$1)) AS rank
		 FROM blogs b WHERE b.status='published'
		 AND (setweight(to_tsvector('simple',b.title),'A') || to_tsvector('simple',b.content)) @@ plainto_tsquery('simple',$1)
		 ORDER BY rank DESC LIMIT 30`, q)
	if ftsRows != nil {
		var id int64
		var rank float64
		for ftsRows.Next() {
			ftsRows.Scan(&id, &rank)
			if !seen[id] {
				seen[id] = true
				ids = append(ids, id)
			}
		}
		ftsRows.Close()
	}

	// 2. ILIKE fallback for partial/substring matches
	likeQ := "%" + q + "%"
	var likeRows pgx.Rows
	if len(ids) == 0 {
		likeRows, _ = r.db.Query(ctx,
			`SELECT b.id FROM blogs b WHERE b.status='published'
			 AND (b.title ILIKE $1 OR b.content ILIKE $1)
			 ORDER BY CASE WHEN b.title ILIKE $1 THEN 0 ELSE 1 END, b.created_at DESC LIMIT 20`, likeQ)
	} else {
		likeRows, _ = r.db.Query(ctx,
			`SELECT b.id FROM blogs b WHERE b.status='published'
			 AND (b.title ILIKE $1 OR b.content ILIKE $1)
			 AND b.id != ALL($2)
			 ORDER BY CASE WHEN b.title ILIKE $1 THEN 0 ELSE 1 END, b.created_at DESC LIMIT 20`, likeQ, ids)
	}
	if likeRows != nil {
		var id int64
		for likeRows.Next() {
			likeRows.Scan(&id)
			if !seen[id] {
				seen[id] = true
				ids = append(ids, id)
			}
		}
		likeRows.Close()
	}

	total := int64(len(ids))
	if total == 0 {
		return nil, 0, nil
	}

	// Paginate IDs
	end := offset + pageSize
	if end > len(ids) {
		end = len(ids)
	}
	if offset >= len(ids) {
		return nil, total, nil
	}
	pageIDs := ids[offset:end]

	// Fetch full blog data for this page (now with currentUserID)
	var blogs []*model.Blog
	for _, id := range pageIDs {
		b, err := r.GetByID(ctx, id, currentUserID)
		if err == nil {
			b.Excerpt = highlightExcerpt(b.Excerpt, q)
			blogs = append(blogs, b)
		}
	}
	return blogs, total, nil
}

// GetTop returns pinned blogs ordered by creation date.
func (r *blogRepo) GetTop(ctx context.Context, limit int) ([]*model.Blog, error) {
	rows, err := r.db.Query(ctx,
		`SELECT b.id, b.user_id, b.title, b.slug, b.excerpt, b.cover_image,
		 b.status, b.view_count, b.is_top, b.category_id, b.created_at, b.updated_at,
		 COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='blog' AND target_id=b.id),0) AS like_count
		 FROM blogs b WHERE b.is_top = true AND b.status = 'published'
		 ORDER BY b.created_at DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
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

func highlightExcerpt(text, query string) string {
	ql := strings.ToLower(query)
	tl := strings.ToLower(text)
	idx := strings.Index(tl, ql)
	if idx >= 0 {
		start := idx - 20
		if start < 0 {
			start = 0
		}
		end := idx + len(query) + 30
		if end > len(text) {
			end = len(text)
		}
		snippet := text[start:end]
		if start > 0 {
			snippet = "..." + snippet
		}
		if end < len(text) {
			snippet = snippet + "..."
		}
		return strings.Replace(snippet, text[idx:idx+len(query)], "<mark>"+text[idx:idx+len(query)]+"</mark>", 1)
	}
	if len(text) > 100 {
		text = text[:100] + "..."
	}
	return text
}

func (r *blogRepo) IncrementViewCount(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "UPDATE blogs SET view_count=view_count+1 WHERE id=$1", id)
	return err
}

func (r *blogRepo) SlugExists(ctx context.Context, slug string, excludeID int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM blogs WHERE slug=$1 AND id!=$2)", slug, excludeID).Scan(&exists)
	return exists, err
}
