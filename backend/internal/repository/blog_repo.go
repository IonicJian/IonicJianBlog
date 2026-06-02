package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type BlogRepository interface {
	Create(ctx context.Context, blog *model.Blog, tagIDs []int64) error
	GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error)
	GetBySlug(ctx context.Context, slug string, currentUserID *int64) (*model.Blog, error)
	Update(ctx context.Context, blog *model.Blog, tagIDs []int64) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, opts ListOptions) ([]*model.Blog, int64, error)
	Search(ctx context.Context, query string, page, pageSize int) ([]*model.Blog, int64, error)
	IncrementViewCount(ctx context.Context, id int64) error
	SlugExists(ctx context.Context, slug string, excludeID int64) (bool, error)
}

type ListOptions struct {
	Page     int
	PageSize int
	Status   string
	TagID    int64
	UserID   *int64
}

type blogRepo struct {
	db *pgxpool.Pool
}

func NewBlogRepository(db *pgxpool.Pool) BlogRepository {
	return &blogRepo{db: db}
}

func (r *blogRepo) Create(ctx context.Context, blog *model.Blog, tagIDs []int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	err = tx.QueryRow(ctx,
		`INSERT INTO blogs (user_id, title, slug, content, content_html, excerpt, cover_image, status, is_top)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING id, created_at, updated_at`,
		blog.UserID, blog.Title, blog.Slug, blog.Content, blog.ContentHTML,
		blog.Excerpt, blog.CoverImage, blog.Status, blog.IsTop,
	).Scan(&blog.ID, &blog.CreatedAt, &blog.UpdatedAt)
	if err != nil {
		return err
	}

	for _, tagID := range tagIDs {
		_, err = tx.Exec(ctx, "INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", blog.ID, tagID)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *blogRepo) GetByID(ctx context.Context, id int64, currentUserID *int64) (*model.Blog, error) {
	blog := &model.Blog{}
	var likedByMe bool
	query := `SELECT b.id, b.user_id, b.title, b.slug, b.content, b.content_html, b.excerpt, b.cover_image,
		        b.status, b.view_count, b.is_top, b.created_at, b.updated_at,
		        COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='blog' AND target_id=b.id), 0) AS like_count`
	args := []interface{}{id}
	if currentUserID != nil {
		query += `, EXISTS(SELECT 1 FROM likes WHERE target_type='blog' AND target_id=b.id AND user_id=$2) AS liked_by_me`
		args = append(args, *currentUserID)
		err := r.db.QueryRow(ctx, query+" FROM blogs b WHERE b.id = $1", args...).
			Scan(&blog.ID, &blog.UserID, &blog.Title, &blog.Slug, &blog.Content, &blog.ContentHTML,
				&blog.Excerpt, &blog.CoverImage, &blog.Status, &blog.ViewCount, &blog.IsTop,
				&blog.CreatedAt, &blog.UpdatedAt, &blog.LikeCount, &likedByMe)
		if err != nil {
			return nil, err
		}
		blog.LikedByMe = likedByMe
	} else {
		err := r.db.QueryRow(ctx, query+" FROM blogs b WHERE b.id = $1", args...).
			Scan(&blog.ID, &blog.UserID, &blog.Title, &blog.Slug, &blog.Content, &blog.ContentHTML,
				&blog.Excerpt, &blog.CoverImage, &blog.Status, &blog.ViewCount, &blog.IsTop,
				&blog.CreatedAt, &blog.UpdatedAt, &blog.LikeCount)
		if err != nil {
			return nil, err
		}
	}
	return blog, nil
}

func (r *blogRepo) GetBySlug(ctx context.Context, slug string, currentUserID *int64) (*model.Blog, error) {
	blog := &model.Blog{}
	var likedByMe bool
	query := `SELECT b.id, b.user_id, b.title, b.slug, b.content, b.content_html, b.excerpt, b.cover_image,
		        b.status, b.view_count, b.is_top, b.created_at, b.updated_at,
		        COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='blog' AND target_id=b.id), 0) AS like_count`
	args := []interface{}{slug}
	if currentUserID != nil {
		query += `, EXISTS(SELECT 1 FROM likes WHERE target_type='blog' AND target_id=b.id AND user_id=$2) AS liked_by_me`
		args = append(args, *currentUserID)
		err := r.db.QueryRow(ctx, query+" FROM blogs b WHERE b.slug = $1", args...).
			Scan(&blog.ID, &blog.UserID, &blog.Title, &blog.Slug, &blog.Content, &blog.ContentHTML,
				&blog.Excerpt, &blog.CoverImage, &blog.Status, &blog.ViewCount, &blog.IsTop,
				&blog.CreatedAt, &blog.UpdatedAt, &blog.LikeCount, &likedByMe)
		if err != nil {
			return nil, err
		}
		blog.LikedByMe = likedByMe
	} else {
		err := r.db.QueryRow(ctx, query+" FROM blogs b WHERE b.slug = $1", args...).
			Scan(&blog.ID, &blog.UserID, &blog.Title, &blog.Slug, &blog.Content, &blog.ContentHTML,
				&blog.Excerpt, &blog.CoverImage, &blog.Status, &blog.ViewCount, &blog.IsTop,
				&blog.CreatedAt, &blog.UpdatedAt, &blog.LikeCount)
		if err != nil {
			return nil, err
		}
	}
	return blog, nil
}

func (r *blogRepo) Update(ctx context.Context, blog *model.Blog, tagIDs []int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx,
		`UPDATE blogs SET title=$1, slug=$2, content=$3, content_html=$4, excerpt=$5,
		 cover_image=$6, status=$7, is_top=$8, updated_at=NOW()
		 WHERE id=$9`,
		blog.Title, blog.Slug, blog.Content, blog.ContentHTML, blog.Excerpt,
		blog.CoverImage, blog.Status, blog.IsTop, blog.ID,
	)
	if err != nil {
		return err
	}

	if len(tagIDs) > 0 {
		_, err = tx.Exec(ctx, "DELETE FROM blog_tags WHERE blog_id=$1", blog.ID)
		if err != nil {
			return err
		}
		for _, tagID := range tagIDs {
			_, err = tx.Exec(ctx, "INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", blog.ID, tagID)
			if err != nil {
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
		where = append(where, fmt.Sprintf("b.status = $%d", argIdx))
		args = append(args, opts.Status)
		argIdx++
	}
	if opts.UserID != nil {
		where = append(where, fmt.Sprintf("b.user_id = $%d", argIdx))
		args = append(args, *opts.UserID)
		argIdx++
	}

	whereClause := ""
	if len(where) > 0 {
		whereClause = "WHERE " + strings.Join(where, " AND ")
	}

	// Count
	var total int64
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM blogs b %s", whereClause)
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Paginated query
	offset := (opts.Page - 1) * opts.PageSize
	query := fmt.Sprintf(
		`SELECT b.id, b.user_id, b.title, b.slug, b.excerpt, b.cover_image,
		        b.status, b.view_count, b.is_top, b.created_at, b.updated_at,
		        COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='blog' AND target_id=b.id), 0) AS like_count
		 FROM blogs b %s
		 ORDER BY b.is_top DESC, b.created_at DESC
		 LIMIT $%d OFFSET $%d`,
		whereClause, argIdx, argIdx+1,
	)
	args = append(args, opts.PageSize, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var blogs []*model.Blog
	for rows.Next() {
		b := &model.Blog{}
		err := rows.Scan(&b.ID, &b.UserID, &b.Title, &b.Slug, &b.Excerpt, &b.CoverImage,
			&b.Status, &b.ViewCount, &b.IsTop, &b.CreatedAt, &b.UpdatedAt, &b.LikeCount)
		if err != nil {
			return nil, 0, err
		}
		blogs = append(blogs, b)
	}

	return blogs, total, nil
}

func (r *blogRepo) Search(ctx context.Context, query string, page, pageSize int) ([]*model.Blog, int64, error) {
	offset := (page - 1) * pageSize
	searchQuery := strings.TrimSpace(query)

	// Full-text search
	ftsCount, _ := r.searchFTS(ctx, searchQuery, pageSize, offset, true)
	ftsTotal := int64(len(ftsCount))

	// Trigram search as fallback (if FTS returns few results)
	if ftsTotal < 5 {
		trgmResults, trgmTotal := r.searchTrigram(ctx, searchQuery, pageSize, offset, ftsTotal)
		if trgmTotal > ftsTotal {
			return trgmResults, trgmTotal, nil
		}
	}

	results, total := r.searchFTS(ctx, searchQuery, pageSize, offset, false)
	return results, total, nil
}

func (r *blogRepo) searchFTS(ctx context.Context, query string, pageSize, offset int, countOnly bool) ([]*model.Blog, int64) {
	var total int64
	r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM blogs b WHERE b.status = 'published'
		 AND to_tsvector('simple', b.title || ' ' || b.content) @@ plainto_tsquery('simple', $1)`,
		query,
	).Scan(&total)

	if countOnly || total == 0 {
		return nil, total
	}

	rows, err := r.db.Query(ctx,
		`SELECT b.id, b.user_id, b.title, b.slug,
		        COALESCE(ts_headline('simple', b.excerpt, plainto_tsquery('simple', $1), 'MaxWords=30, MinWords=10, ShortWord=2, StartSel=<mark>, StopSel=</mark>'), b.excerpt) AS excerpt,
		        b.cover_image, b.status, b.view_count, b.is_top, b.created_at, b.updated_at,
		        COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='blog' AND target_id=b.id), 0) AS like_count,
		        ts_rank(to_tsvector('simple', b.title || ' ' || b.content), plainto_tsquery('simple', $1)) AS rank
		 FROM blogs b
		 WHERE b.status = 'published'
		 AND to_tsvector('simple', b.title || ' ' || b.content) @@ plainto_tsquery('simple', $1)
		 ORDER BY rank DESC, b.created_at DESC
		 LIMIT $2 OFFSET $3`,
		query, pageSize, offset,
	)
	if err != nil {
		return nil, total
	}
	defer rows.Close()

	var blogs []*model.Blog
	var rank float64
	for rows.Next() {
		b := &model.Blog{}
		if err := rows.Scan(&b.ID, &b.UserID, &b.Title, &b.Slug, &b.Excerpt, &b.CoverImage,
			&b.Status, &b.ViewCount, &b.IsTop, &b.CreatedAt, &b.UpdatedAt, &b.LikeCount, &rank); err != nil {
			continue
		}
		blogs = append(blogs, b)
	}
	return blogs, total
}

func (r *blogRepo) searchTrigram(ctx context.Context, query string, pageSize, offset int, ftsTotal int64) ([]*model.Blog, int64) {
	searchQuery := "%" + strings.ToLower(query) + "%"
	var total int64
	r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM blogs b WHERE b.status = 'published'
		 AND (LOWER(b.title) LIKE $1 OR LOWER(b.content) LIKE $1)`,
		searchQuery,
	).Scan(&total)

	if total == 0 {
		return nil, total
	}

	rows, err := r.db.Query(ctx,
		`SELECT b.id, b.user_id, b.title, b.slug, b.excerpt, b.cover_image,
		        b.status, b.view_count, b.is_top, b.created_at, b.updated_at,
		        COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='blog' AND target_id=b.id), 0) AS like_count
		 FROM blogs b
		 WHERE b.status = 'published'
		 AND (LOWER(b.title) LIKE $1 OR LOWER(b.content) LIKE $1)
		 ORDER BY b.created_at DESC
		 LIMIT $2 OFFSET $3`,
		searchQuery, pageSize, offset,
	)
	if err != nil {
		return nil, total
	}
	defer rows.Close()

	var blogs []*model.Blog
	for rows.Next() {
		b := &model.Blog{}
		if err := rows.Scan(&b.ID, &b.UserID, &b.Title, &b.Slug, &b.Excerpt, &b.CoverImage,
			&b.Status, &b.ViewCount, &b.IsTop, &b.CreatedAt, &b.UpdatedAt, &b.LikeCount); err != nil {
			continue
		}
		blogs = append(blogs, b)
	}
	return blogs, total + ftsTotal
}

func (r *blogRepo) IncrementViewCount(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "UPDATE blogs SET view_count = view_count + 1 WHERE id=$1", id)
	return err
}

func (r *blogRepo) SlugExists(ctx context.Context, slug string, excludeID int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		"SELECT EXISTS(SELECT 1 FROM blogs WHERE slug=$1 AND id != $2)", slug, excludeID,
	).Scan(&exists)
	return exists, err
}
