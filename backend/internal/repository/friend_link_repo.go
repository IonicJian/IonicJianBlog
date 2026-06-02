package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type FriendLinkRepository interface {
	List(ctx context.Context) ([]*model.FriendLink, error)
	Create(ctx context.Context, fl *model.FriendLink) error
	Update(ctx context.Context, fl *model.FriendLink) error
	Delete(ctx context.Context, id int64) error
}

type friendLinkRepo struct {
	db *pgxpool.Pool
}

func NewFriendLinkRepository(db *pgxpool.Pool) FriendLinkRepository {
	return &friendLinkRepo{db: db}
}

func (r *friendLinkRepo) List(ctx context.Context) ([]*model.FriendLink, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, name, url, description, logo_url, sort_order, is_active, created_at, updated_at
		 FROM friend_links
		 WHERE is_active = true
		 ORDER BY sort_order ASC, id ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []*model.FriendLink
	for rows.Next() {
		l := &model.FriendLink{}
		if err := rows.Scan(&l.ID, &l.Name, &l.URL, &l.Description, &l.LogoURL,
			&l.SortOrder, &l.IsActive, &l.CreatedAt, &l.UpdatedAt); err != nil {
			return nil, err
		}
		links = append(links, l)
	}
	return links, nil
}

func (r *friendLinkRepo) Create(ctx context.Context, fl *model.FriendLink) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO friend_links (name, url, description, logo_url, sort_order)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, created_at, updated_at`,
		fl.Name, fl.URL, fl.Description, fl.LogoURL, fl.SortOrder,
	).Scan(&fl.ID, &fl.CreatedAt, &fl.UpdatedAt)
}

func (r *friendLinkRepo) Update(ctx context.Context, fl *model.FriendLink) error {
	_, err := r.db.Exec(ctx,
		`UPDATE friend_links SET name=$1, url=$2, description=$3, logo_url=$4, sort_order=$5, is_active=$6, updated_at=NOW()
		 WHERE id=$7`,
		fl.Name, fl.URL, fl.Description, fl.LogoURL, fl.SortOrder, fl.IsActive, fl.ID,
	)
	return err
}

func (r *friendLinkRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "DELETE FROM friend_links WHERE id=$1", id)
	return err
}
