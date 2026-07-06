package content

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type AISummaryRepository interface {
	GetByBlogID(ctx context.Context, blogID int64) (*model.AISummary, error)
	Upsert(ctx context.Context, summary *model.AISummary) error
}

type aiSummaryRepo struct {
	db *pgxpool.Pool
}

func NewAISummaryRepository(db *pgxpool.Pool) AISummaryRepository {
	return &aiSummaryRepo{db: db}
}

func (r *aiSummaryRepo) GetByBlogID(ctx context.Context, blogID int64) (*model.AISummary, error) {
	row := r.db.QueryRow(ctx,
		`SELECT id, blog_id, summary, model, tokens_used, created_at, updated_at
		 FROM ai_summaries WHERE blog_id = $1`, blogID)
	s := &model.AISummary{}
	err := row.Scan(&s.ID, &s.BlogID, &s.Summary, &s.Model, &s.TokensUsed, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *aiSummaryRepo) Upsert(ctx context.Context, summary *model.AISummary) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO ai_summaries (blog_id, summary, model, tokens_used)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (blog_id) DO UPDATE
		 SET summary = EXCLUDED.summary, model = EXCLUDED.model,
		     tokens_used = EXCLUDED.tokens_used, updated_at = NOW()`,
		summary.BlogID, summary.Summary, summary.Model, summary.TokensUsed)
	return err
}

// IsNotFound reports whether the error is a "no rows" result.
func IsNotFound(err error) bool {
	return err == pgx.ErrNoRows
}
