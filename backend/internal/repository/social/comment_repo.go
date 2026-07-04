package social

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type CommentRepository interface {
	Create(ctx context.Context, c *model.Comment) error
	GetByID(ctx context.Context, id int64) (*model.Comment, error)
	Delete(ctx context.Context, id int64) error
	ListByBlogID(ctx context.Context, blogID int64, page, pageSize int) ([]*model.Comment, int64, error)
	ListAll(ctx context.Context, page, pageSize int) ([]*model.Comment, int64, error)
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

func (r *commentRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "DELETE FROM comments WHERE id=$1", id)
	return err
}

// scanComment is a helper to scan a comment row with author and like_count.
func (r *commentRepo) scanComment(scanner interface {
	Scan(dest ...any) error
}) (*model.Comment, error) {
	c := &model.Comment{}
	author := &model.User{}
	err := scanner.Scan(
		&c.ID, &c.BlogID, &c.UserID, &c.ParentID, &c.Content,
		&c.AnchorStart, &c.AnchorEnd, &c.AnchorText, &c.IsApproved, &c.CreatedAt, &c.UpdatedAt,
		&author.ID, &author.Username, &author.DisplayName, &author.AvatarURL,
		&c.LikeCount,
	)
	if err != nil {
		return nil, err
	}
	c.Author = author
	return c, nil
}

const commentSelectCols = `c.id, c.blog_id, c.user_id, c.parent_id, c.content,
	c.anchor_start, c.anchor_end, c.anchor_text, c.is_approved, c.created_at, c.updated_at,
	u.id, u.username, u.display_name, u.avatar_url,
	COALESCE((SELECT COUNT(*) FROM likes WHERE target_type='comment' AND target_id=c.id), 0) AS like_count`

const commentFromJoin = `FROM comments c JOIN users u ON u.id = c.user_id`

func (r *commentRepo) ListByBlogID(ctx context.Context, blogID int64, page, pageSize int) ([]*model.Comment, int64, error) {
	// Count only top-level comments for pagination
	var total int64
	err := r.db.QueryRow(ctx,
		"SELECT COUNT(*) FROM comments WHERE blog_id=$1 AND parent_id IS NULL", blogID,
	).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize

	// Step 1: Query paginated top-level comments
	rows, err := r.db.Query(ctx,
		fmt.Sprintf(`SELECT %s %s WHERE c.blog_id=$1 AND c.parent_id IS NULL ORDER BY c.created_at ASC LIMIT $2 OFFSET $3`, commentSelectCols, commentFromJoin),
		blogID, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	var topLevel []*model.Comment
	topIDs := make([]int64, 0, pageSize)
	for rows.Next() {
		c, err := r.scanComment(rows)
		if err != nil {
			rows.Close()
			return nil, 0, err
		}
		topLevel = append(topLevel, c)
		topIDs = append(topIDs, c.ID)
	}
	rows.Close()

	if len(topLevel) == 0 {
		return topLevel, total, nil
	}

	// Step 2: Fetch all replies for these top-level comments in one query
	placeholders := make([]string, len(topIDs))
	args := make([]any, len(topIDs)+1)
	args[0] = blogID
	for i, id := range topIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args[i+1] = id
	}

	replyRows, err := r.db.Query(ctx,
		fmt.Sprintf(`SELECT %s %s WHERE c.blog_id=$1 AND c.parent_id IN (%s) ORDER BY c.created_at ASC`,
			commentSelectCols, commentFromJoin, strings.Join(placeholders, ",")),
		args...)
	if err != nil {
		return nil, 0, err
	}
	defer replyRows.Close()

	// Build parent map for attaching replies
	parentMap := make(map[int64]*model.Comment)
	for _, c := range topLevel {
		parentMap[c.ID] = c
	}

	for replyRows.Next() {
		c, err := r.scanComment(replyRows)
		if err != nil {
			return nil, 0, err
		}
		if parent, ok := parentMap[*c.ParentID]; ok {
			parent.Replies = append(parent.Replies, c)
		}
	}

	return topLevel, total, nil
}

func (r *commentRepo) ListAll(ctx context.Context, page, pageSize int) ([]*model.Comment, int64, error) {
	var total int64
	if err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM comments").Scan(&total); err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * pageSize
	rows, err := r.db.Query(ctx,
		fmt.Sprintf(`SELECT %s %s ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`, commentSelectCols, commentFromJoin),
		pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var comments []*model.Comment
	for rows.Next() {
		c, err := r.scanComment(rows)
		if err != nil {
			return nil, 0, err
		}
		comments = append(comments, c)
	}
	return comments, total, nil
}
