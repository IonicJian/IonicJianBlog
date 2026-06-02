package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zanelin/blog/internal/model"
)

type TagRepository interface {
	Create(ctx context.Context, tag *model.Tag) error
	Update(ctx context.Context, tag *model.Tag) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context) ([]*model.Tag, error)
	GetByID(ctx context.Context, id int64) (*model.Tag, error)
	GetBySlug(ctx context.Context, slug string) (*model.Tag, error)
	GetByBlogID(ctx context.Context, blogID int64) ([]*model.Tag, error)
}

type tagRepo struct {
	db *pgxpool.Pool
}

func NewTagRepository(db *pgxpool.Pool) TagRepository {
	return &tagRepo{db: db}
}

func (r *tagRepo) Create(ctx context.Context, tag *model.Tag) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO tags (name, slug, color) VALUES ($1, $2, $3)
		 RETURNING id, created_at`,
		tag.Name, tag.Slug, tag.Color,
	).Scan(&tag.ID, &tag.CreatedAt)
}

func (r *tagRepo) Update(ctx context.Context, tag *model.Tag) error {
	_, err := r.db.Exec(ctx,
		"UPDATE tags SET name=$1, slug=$2, color=$3 WHERE id=$4",
		tag.Name, tag.Slug, tag.Color, tag.ID,
	)
	return err
}

func (r *tagRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, "DELETE FROM tags WHERE id=$1", id)
	return err
}

func (r *tagRepo) List(ctx context.Context) ([]*model.Tag, error) {
	rows, err := r.db.Query(ctx,
		`SELECT t.id, t.name, t.slug, t.color, t.created_at,
		        COUNT(bt.blog_id) AS post_count
		 FROM tags t
		 LEFT JOIN blog_tags bt ON bt.tag_id = t.id
		 GROUP BY t.id
		 ORDER BY post_count DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []*model.Tag
	for rows.Next() {
		t := &model.Tag{}
		if err := rows.Scan(&t.ID, &t.Name, &t.Slug, &t.Color, &t.CreatedAt, &t.PostCount); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, nil
}

func (r *tagRepo) GetByID(ctx context.Context, id int64) (*model.Tag, error) {
	t := &model.Tag{}
	err := r.db.QueryRow(ctx,
		"SELECT id, name, slug, color, created_at FROM tags WHERE id=$1", id,
	).Scan(&t.ID, &t.Name, &t.Slug, &t.Color, &t.CreatedAt)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (r *tagRepo) GetBySlug(ctx context.Context, slug string) (*model.Tag, error) {
	t := &model.Tag{}
	err := r.db.QueryRow(ctx,
		"SELECT id, name, slug, color, created_at FROM tags WHERE slug=$1", slug,
	).Scan(&t.ID, &t.Name, &t.Slug, &t.Color, &t.CreatedAt)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (r *tagRepo) GetByBlogID(ctx context.Context, blogID int64) ([]*model.Tag, error) {
	rows, err := r.db.Query(ctx,
		`SELECT t.id, t.name, t.slug, t.color, t.created_at
		 FROM tags t
		 INNER JOIN blog_tags bt ON bt.tag_id = t.id
		 WHERE bt.blog_id = $1`, blogID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []*model.Tag
	for rows.Next() {
		t := &model.Tag{}
		if err := rows.Scan(&t.ID, &t.Name, &t.Slug, &t.Color, &t.CreatedAt); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, nil
}
