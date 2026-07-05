package content

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type PhotoRepository interface {
	List(ctx context.Context) ([]*model.Photo, error)
	Create(ctx context.Context, p *model.Photo) error
	Delete(ctx context.Context, id int64) error
}

type photoRepo struct {
	db *pgxpool.Pool
}

func NewPhotoRepository(db *pgxpool.Pool) PhotoRepository {
	return &photoRepo{db: db}
}

func (r *photoRepo) List(ctx context.Context) ([]*model.Photo, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, url, title, sort_order, created_at FROM photos ORDER BY sort_order, created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var photos []*model.Photo
	for rows.Next() {
		p := &model.Photo{}
		if err := rows.Scan(&p.ID, &p.URL, &p.Title, &p.SortOrder, &p.CreatedAt); err != nil {
			return nil, err
		}
		photos = append(photos, p)
	}
	return photos, nil
}

func (r *photoRepo) Create(ctx context.Context, p *model.Photo) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO photos (url, title, sort_order) VALUES ($1, $2, $3) RETURNING id, created_at`,
		p.URL, p.Title, p.SortOrder,
	).Scan(&p.ID, &p.CreatedAt)
}

func (r *photoRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "DELETE FROM photos WHERE id=$1", id)
	return err
}
