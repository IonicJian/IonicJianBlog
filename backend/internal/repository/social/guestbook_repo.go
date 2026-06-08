package social

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type GuestbookRepository interface {
	List(ctx context.Context, page, pageSize int) ([]*model.GuestbookMessage, int64, error)
	GetByID(ctx context.Context, id int64) (*model.GuestbookMessage, error)
	Create(ctx context.Context, m *model.GuestbookMessage) error
	Delete(ctx context.Context, id int64) error
}

type guestbookRepo struct {
	db *pgxpool.Pool
}

func NewGuestbookRepository(db *pgxpool.Pool) GuestbookRepository {
	return &guestbookRepo{db: db}
}

func (r *guestbookRepo) List(ctx context.Context, page, pageSize int) ([]*model.GuestbookMessage, int64, error) {
	var total int64
	err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM guestbook_messages").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	rows, err := r.db.Query(ctx,
		`SELECT m.id, m.user_id, m.nickname, m.content, m.is_approved, m.created_at, m.updated_at
		 FROM guestbook_messages m
		 ORDER BY m.created_at DESC
		 LIMIT $1 OFFSET $2`, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var messages []*model.GuestbookMessage
	for rows.Next() {
		m := &model.GuestbookMessage{}
		if err := rows.Scan(&m.ID, &m.UserID, &m.Nickname, &m.Content, &m.IsApproved, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, 0, err
		}
		messages = append(messages, m)
	}
	return messages, total, nil
}

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

func (r *guestbookRepo) Create(ctx context.Context, m *model.GuestbookMessage) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO guestbook_messages (user_id, nickname, content)
		 VALUES ($1, $2, $3)
		 RETURNING id, created_at, updated_at`,
		m.UserID, m.Nickname, m.Content,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
}

func (r *guestbookRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "DELETE FROM guestbook_messages WHERE id=$1", id)
	return err
}
