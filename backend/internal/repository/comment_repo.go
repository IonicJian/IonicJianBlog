package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type CommentRepository interface {
	Create(ctx context.Context, c *model.Comment) error
	Delete(ctx context.Context, id int64) error
	ListByBlogID(ctx context.Context, blogID int64, page, pageSize int) ([]*model.Comment, int64, error)
}

type commentRepo struct {
	db *pgxpool.Pool
}

func NewCommentRepository(db *pgxpool.Pool) CommentRepository {
	return &commentRepo{db: db}
}

func (r *commentRepo) Create(ctx context.Context, c *model.Comment) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO comments (blog_id, user_id, parent_id, content, anchor_start, anchor_end, anchor_text)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, created_at, updated_at`,
		c.BlogID, c.UserID, c.ParentID, c.Content, c.AnchorStart, c.AnchorEnd, c.AnchorText,
	).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
}

func (r *commentRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "DELETE FROM comments WHERE id=$1", id)
	return err
}

func (r *commentRepo) ListByBlogID(ctx context.Context, blogID int64, page, pageSize int) ([]*model.Comment, int64, error) {
	// Count all comments (including replies)
	var total int64
	err := r.db.QueryRow(ctx,
		"SELECT COUNT(*) FROM comments WHERE blog_id=$1", blogID,
	).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize

	// Get all comments for this blog (top-level + replies) in one query
	rows, err := r.db.Query(ctx,
		`SELECT c.id, c.blog_id, c.user_id, c.parent_id, c.content,
		        c.anchor_start, c.anchor_end, c.anchor_text, c.is_approved, c.created_at, c.updated_at,
		        u.id, u.username, u.display_name, u.avatar_url,
		        COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='comment' AND target_id=c.id), 0) AS like_count
		 FROM comments c
		 JOIN users u ON u.id = c.user_id
		 WHERE c.blog_id = $1
		 ORDER BY c.created_at ASC`, blogID)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var all []*model.Comment
	commentMap := make(map[int64]*model.Comment)

	for rows.Next() {
		c := &model.Comment{}
		author := &model.User{}
		err := rows.Scan(
			&c.ID, &c.BlogID, &c.UserID, &c.ParentID, &c.Content,
			&c.AnchorStart, &c.AnchorEnd, &c.AnchorText, &c.IsApproved, &c.CreatedAt, &c.UpdatedAt,
			&author.ID, &author.Username, &author.DisplayName, &author.AvatarURL,
			&c.LikeCount,
		)
		if err != nil {
			return nil, 0, err
		}
		c.Author = author
		all = append(all, c)
		commentMap[c.ID] = c
	}

	// Build tree: top-level paginated, replies attached
	var topLevel []*model.Comment
	for _, c := range all {
		if c.ParentID == nil {
			topLevel = append(topLevel, c)
		} else if parent, ok := commentMap[*c.ParentID]; ok {
			parent.Replies = append(parent.Replies, c)
		}
	}

	// Apply pagination to top-level
	start := offset
	end := offset + pageSize
	if start > len(topLevel) {
		start = len(topLevel)
	}
	if end > len(topLevel) {
		end = len(topLevel)
	}

	return topLevel[start:end], total, nil
}
